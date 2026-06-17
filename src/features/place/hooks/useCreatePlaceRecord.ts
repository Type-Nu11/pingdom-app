import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordApi, type CreateRecordResponse } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import { placeApi, type CreatePlaceResponse } from '../api/placeApi';
import type { Place, PlaceCategory, PlaceCreateDraft, PlaceUploadPhoto } from '../model/place.types';
import { placeQueryKeys } from './usePlaces';

type CreatePlaceRecordRequest = {
  caption: string;
  category: PlaceCategory;
  draft: PlaceCreateDraft;
  photo: PlaceUploadPhoto;
};

type CreatePlaceRecordResponse = {
  place: CreatePlaceResponse;
  record: CreateRecordResponse;
};

export const useCreatePlaceRecord = () => {
  const queryClient = useQueryClient();
  const createPlaceRecordMutation = useMutation<
    CreatePlaceRecordResponse,
    Error,
    CreatePlaceRecordRequest
  >({
    mutationFn: async ({ caption, category, draft, photo }) => {
      const {
        kakaoPlaceId,
        place,
        validPlace,
      } = await resolvePlaceForRecord({ category, draft, photo });
      const description = caption.trim();
      const record = await recordApi.createRecord({
        description: description || undefined,
        file: photo,
        kakaoPlaceId,
        placeId: place.id,
        title: draft.name,
        validPlace,
      });

      return { place, record };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: placeQueryKeys.all });
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

type CreateKakaoPlaceParams = {
  category: PlaceCategory;
  draft: PlaceCreateDraft;
  photo: PlaceUploadPhoto;
};

const PLACE_SEARCH_LIMIT = 100;
const PLACE_SEARCH_MAX_PAGES = 5;

type ResolvePlaceForRecordParams = CreateKakaoPlaceParams;

type ResolvedPlaceForRecord = {
  kakaoPlaceId?: string;
  place: CreatePlaceResponse;
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

  for (const keyword of [...queries, undefined]) {
    for (let page = 1; page <= PLACE_SEARCH_MAX_PAGES; page += 1) {
      const placesPage = await placeApi.getPlaces({
        ...(keyword ? { keyword } : {}),
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

  if (draft.kakaoPlaceId) {
    return {
      kakaoPlaceId: draft.kakaoPlaceId,
      place: await createKakaoPlace({ category, draft, photo }),
      validPlace: true,
    };
  }

  return {
    place: await placeApi.createPlace({
      address: draft.address,
      category,
      latitude: draft.latitude,
      longitude: draft.longitude,
      name: draft.name,
    }),
  };
}

async function createKakaoPlace({ category, draft, photo }: CreateKakaoPlaceParams) {
  if (!draft.kakaoPlaceId) {
    throw new Error('KAKAO_PLACE_ID_REQUIRED');
  }

  const coordinateToken = draft.coordinateToken ?? (
    await placeApi.createPlaceCoordinates({
      baseLatitude: draft.latitude,
      baseLongitude: draft.longitude,
      kakaoPlaceId: draft.kakaoPlaceId,
    })
  ).coordinateToken;

  return placeApi.createPlaceWithCoordinateToken({
    address: draft.address,
    category,
    coordinateToken,
    imageUrl: photo.uri,
    kakaoPlaceId: draft.kakaoPlaceId,
    name: draft.name,
  });
}

export default useCreatePlaceRecord;
