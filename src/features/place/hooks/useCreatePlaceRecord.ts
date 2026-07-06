import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getAuthState } from '../../../app/store/authStore';
import { getTokens } from '../../../shared/api/authStorage';
import { profileApi } from '../../profile/api/profileApi';
import { recordApi, type CreateRecordResponse } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import { placeApi, type CreatePlaceResponse } from '../api/placeApi';
import type { Place, PlaceCategory, PlaceCreateDraft, PlaceUploadPhoto } from '../model/place.types';
import { placeRecommendationQueryKeys } from './usePlaceRecommendations';
import { placeQueryKeys } from './usePlaces';

type CreatePlaceRecordRequest = {
  caption: string;
  category: PlaceCategory;
  draft: PlaceCreateDraft;
  photo: PlaceUploadPhoto;
};

type CreatePlaceRecordResponse = {
  place?: CreatePlaceResponse;
  record: CreateRecordResponse;
};

const UPLOAD_LOG_PREFIX = '[place-upload]';

function logUpload(stage: string, details?: Record<string, unknown>) {
  console.info(UPLOAD_LOG_PREFIX, stage, details ?? {});
}

function warnUpload(stage: string, details?: Record<string, unknown>) {
  console.warn(UPLOAD_LOG_PREFIX, stage, details ?? {});
}

async function logAuthSnapshot(stage: string) {
  const authState = getAuthState();
  const tokens = await getTokens().catch(() => null);

  logUpload(stage, {
    keychainHasAccessToken: Boolean(tokens?.accessToken),
    keychainHasRefreshToken: Boolean(tokens?.refreshToken),
    storeHasAccessToken: Boolean(authState.accessToken),
    storeIsLoggedIn: authState.isLoggedIn,
  });
}

function getUploadErrorDetails(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return {
      message: error instanceof Error ? error.message : String(error),
    };
  }

  const responseData = error.response?.data as {
    code?: unknown;
    errors?: unknown;
    message?: unknown;
  } | undefined;

  return {
    code: responseData?.code,
    errors: responseData?.errors,
    message: responseData?.message ?? error.message,
    method: error.config?.method,
    status: error.response?.status,
    url: error.config?.url,
  };
}

export const useCreatePlaceRecord = () => {
  const queryClient = useQueryClient();
  const createPlaceRecordMutation = useMutation<
    CreatePlaceRecordResponse,
    Error,
    CreatePlaceRecordRequest
  >({
    mutationFn: async ({ caption, category, draft, photo }) => {
      try {
        await logAuthSnapshot('start');
        logUpload('input', {
          captionLength: caption.trim().length,
          category,
          hasCoordinateToken: Boolean(draft.coordinateToken),
          hasKakaoPlaceId: Boolean(draft.kakaoPlaceId),
          photoName: photo.name,
          photoType: photo.type,
        });

        const {
          kakaoPlaceId,
          place,
          validPlace,
        } = await resolvePlaceForRecord({ category, draft, photo });
        const description = caption.trim();

        logUpload('place resolved', {
          hasKakaoPlaceId: Boolean(kakaoPlaceId),
          placeId: place?.id,
          validPlace: Boolean(validPlace),
        });

        if (place) {
          await logAuthSnapshot('before duplicate check');
          await assertUserCanUploadPlacePost(place.id);
          logUpload('duplicate check passed', { placeId: place.id });
        } else {
          logUpload('duplicate check skipped', {
            reason: 'new kakao place upload does not have legacy placeId yet',
          });
        }

        await logAuthSnapshot('before record upload');
        const record = await recordApi.createRecord({
          description: description || undefined,
          file: photo,
          kakaoPlaceId,
          placeId: place?.id,
          title: draft.name,
          validPlace,
        });

        logUpload('record upload success', {
          placeId: place?.id,
          recordId: record.id,
        });

        return { place, record };
      } catch (error) {
        warnUpload('failed', getUploadErrorDetails(error));
        await logAuthSnapshot('after failure');
        throw error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: placeQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: placeRecommendationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });

  return {
    createPlaceRecord: createPlaceRecordMutation.mutateAsync,
    error: createPlaceRecordMutation.error,
    isError: createPlaceRecordMutation.isError,
    isUploading: createPlaceRecordMutation.isPending,
  };
};

const PLACE_SEARCH_LIMIT = 100;
const PLACE_SEARCH_MAX_PAGES = 5;
const MAX_POSTS_PER_USER_PER_PLACE = 1;
export const PLACE_POST_ALREADY_EXISTS_ERROR = 'PLACE_POST_ALREADY_EXISTS';

type ResolvePlaceForRecordParams = {
  category: PlaceCategory;
  draft: PlaceCreateDraft;
  photo: PlaceUploadPhoto;
};

type ResolvedPlaceForRecord = {
  kakaoPlaceId?: string;
  place?: CreatePlaceResponse;
  validPlace?: true;
};

function normalizeAddress(address: string) {
  return address.replace(/\s+/g, ' ').trim();
}

function getPlaceAddressMatch(places: Place[], address: string) {
  const normalizedAddress = normalizeAddress(address);

  return places.find((place) => normalizeAddress(place.address) === normalizedAddress) ?? null;
}

async function findExistingPlaceByAddress(draft: PlaceCreateDraft) {
  const queries = Array.from(new Set([
    normalizeAddress(draft.address),
    normalizeAddress(draft.name),
  ].filter(Boolean)));

  for (const keyword of queries) {
    for (let page = 1; page <= PLACE_SEARCH_MAX_PAGES; page += 1) {
      const placesPage = await placeApi.getPlaces({
        keyword,
        limit: PLACE_SEARCH_LIMIT,
        page,
      });
      const existingPlace = getPlaceAddressMatch(placesPage.places, draft.address);

      if (existingPlace) {
        return existingPlace;
      }

      if (!placesPage.hasNext) {
        break;
      }
    }
  }

  return null;
}

async function resolvePlaceForRecord({
  category,
  draft,
  photo,
}: ResolvePlaceForRecordParams): Promise<ResolvedPlaceForRecord> {
  const existingPlace = await findExistingPlaceByAddress(draft);

  if (existingPlace) {
    return { place: existingPlace };
  }

  if (draft.coordinateToken) {
    return {
      kakaoPlaceId: draft.kakaoPlaceId,
      place: await placeApi.createPlaceWithCoordinateToken({
        address: draft.address,
        category,
        coordinateToken: draft.coordinateToken,
        imageUrl: photo.uri,
        kakaoPlaceId: draft.kakaoPlaceId,
        name: draft.name,
      }),
      validPlace: draft.kakaoPlaceId ? true : undefined,
    };
  }

  if (draft.kakaoPlaceId) {
    return {
      kakaoPlaceId: draft.kakaoPlaceId,
      validPlace: true,
    };
  }

  throw new Error('PLACE_COORDINATE_TOKEN_REQUIRED');
}

async function countUserPostsForPlace(placeId: number, userId: number) {
  let count = 0;

  for (let page = 1; page <= PLACE_SEARCH_MAX_PAGES; page += 1) {
    const postsPage = await recordApi.getPosts({
      limit: PLACE_SEARCH_LIMIT,
      page,
      placeId,
    });

    count += postsPage.posts.filter((post) => (
      Number(post.placeId) === placeId && post.userId === userId
    )).length;

    if (!postsPage.hasNext) break;
  }

  return count;
}

async function assertUserCanUploadPlacePost(placeId: number) {
  const profile = await profileApi.getProfile();
  const userPostCount = await countUserPostsForPlace(placeId, profile.id);

  if (userPostCount >= MAX_POSTS_PER_USER_PER_PLACE) {
    throw new Error(PLACE_POST_ALREADY_EXISTS_ERROR);
  }
}

export default useCreatePlaceRecord;
