import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  merchantOwnerApi,
  type MerchantPlaceInformationUpdate,
  type OfferCreate,
  type OperatingScheduleUpdate,
} from '../api/merchantOwnerApi';

const STALE_TIME_MS = 60_000;

export const merchantOwnerQueryKeys = {
  all: ['v2', 'merchant-owner'] as const,
  media: (placeId: number) => [...merchantOwnerQueryKeys.all, 'media', placeId] as const,
  offers: () => [...merchantOwnerQueryKeys.all, 'offers'] as const,
  operating: (placeId: number) => [...merchantOwnerQueryKeys.all, 'operating', placeId] as const,
  placeDetail: (placeId: number) => [...merchantOwnerQueryKeys.all, 'place', placeId] as const,
  placeInformation: (placeId: number) =>
    [...merchantOwnerQueryKeys.all, 'place-information', placeId] as const,
  profile: () => [...merchantOwnerQueryKeys.all, 'profile'] as const,
  reviews: (placeId: number) => [...merchantOwnerQueryKeys.all, 'reviews', placeId] as const,
};

export function useMerchantOwnerProfile(enabled = true) {
  return useQuery({
    enabled,
    queryFn: ({ signal }) => merchantOwnerApi.getProfile(signal),
    queryKey: merchantOwnerQueryKeys.profile(),
    staleTime: STALE_TIME_MS,
  });
}

export function useMerchantPlaceDetail(placeId: number | undefined) {
  return useQuery({
    enabled: placeId != null,
    queryFn: ({ signal }) => merchantOwnerApi.getPlaceDetail(placeId as number, signal),
    queryKey: merchantOwnerQueryKeys.placeDetail(placeId ?? -1),
    staleTime: STALE_TIME_MS,
  });
}

export function useMerchantPlaceInformation(placeId: number | undefined) {
  return useQuery({
    enabled: placeId != null,
    queryFn: ({ signal }) => merchantOwnerApi.getPlaceInformation(placeId as number, signal),
    queryKey: merchantOwnerQueryKeys.placeInformation(placeId ?? -1),
    staleTime: STALE_TIME_MS,
  });
}

export function useMerchantOperating(placeId: number | undefined) {
  return useQuery({
    enabled: placeId != null,
    queryFn: ({ signal }) => merchantOwnerApi.getOperating(placeId as number, signal),
    queryKey: merchantOwnerQueryKeys.operating(placeId ?? -1),
    staleTime: STALE_TIME_MS,
  });
}

export function useMerchantMedia(placeId: number | undefined) {
  return useQuery({
    enabled: placeId != null,
    queryFn: ({ signal }) => merchantOwnerApi.getMedia(placeId as number, signal),
    queryKey: merchantOwnerQueryKeys.media(placeId ?? -1),
    staleTime: STALE_TIME_MS,
  });
}

export function useMerchantReviews(placeId: number | undefined) {
  return useQuery({
    enabled: placeId != null,
    queryFn: ({ signal }) => merchantOwnerApi.listReviews(placeId as number, { limit: 20 }, signal),
    queryKey: merchantOwnerQueryKeys.reviews(placeId ?? -1),
    staleTime: STALE_TIME_MS,
  });
}

export function useMerchantOffers(enabled = true) {
  return useQuery({
    enabled,
    queryFn: ({ signal }) => merchantOwnerApi.listOffers({ limit: 50 }, signal),
    queryKey: merchantOwnerQueryKeys.offers(),
    staleTime: STALE_TIME_MS,
  });
}

export function useUpdatePlaceInformation(placeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: MerchantPlaceInformationUpdate) =>
      merchantOwnerApi.updatePlaceInformation(placeId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: merchantOwnerQueryKeys.placeInformation(placeId),
      });
    },
  });
}

export function useUpdateOperatingSchedule(placeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: OperatingScheduleUpdate) =>
      merchantOwnerApi.updateOperatingSchedule(placeId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: merchantOwnerQueryKeys.operating(placeId) }),
        queryClient.invalidateQueries({ queryKey: merchantOwnerQueryKeys.placeDetail(placeId) }),
      ]);
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: OfferCreate) => merchantOwnerApi.createOffer(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantOwnerQueryKeys.offers() });
    },
  });
}

export function usePublishOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => merchantOwnerApi.publishOffer(offerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantOwnerQueryKeys.offers() });
    },
  });
}

export function useCloseOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: number) => merchantOwnerApi.closeOffer(offerId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: merchantOwnerQueryKeys.offers() });
    },
  });
}
