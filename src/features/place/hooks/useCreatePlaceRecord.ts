import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordApi, type CreateRecordResponse } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import { placeApi, type CreatePlaceResponse } from '../api/placeApi';
import type { PlaceCategory, PlaceCreateDraft, PlaceUploadPhoto } from '../model/place.types';
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

      const place = await placeApi.createPlaceWithCoordinateToken({
        address: draft.address,
        category,
        coordinateToken,
        imageUrl: photo.uri,
        kakaoPlaceId: draft.kakaoPlaceId,
        name: draft.name,
      });
      const description = caption.trim();
      const record = await recordApi.createRecord({
        description: description || undefined,
        file: photo,
        kakaoPlaceId: draft.kakaoPlaceId,
        placeId: place.id,
        title: draft.name,
        validPlace: true,
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

export default useCreatePlaceRecord;
