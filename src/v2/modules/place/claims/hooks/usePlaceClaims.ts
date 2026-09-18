import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  placeClaimApi,
  type CreatePlaceClaimBody,
  type ListPlaceClaimsParams,
} from '../api/placeClaimApi';

type PlaceClaimApi = typeof placeClaimApi;

export const placeClaimQueryKeys = {
  all: ['v2', 'place-claims'] as const,
  detail: (claimId: number) => [...placeClaimQueryKeys.all, 'detail', claimId] as const,
  list: (params: ListPlaceClaimsParams) => [...placeClaimQueryKeys.all, 'list', params] as const,
};

export function createPlaceClaimListQueryOptions(
  params: ListPlaceClaimsParams = {},
  api: Pick<PlaceClaimApi, 'listPlaceClaims'> = placeClaimApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listPlaceClaims(params, signal),
    queryKey: placeClaimQueryKeys.list(params),
  };
}

export function createPlaceClaimDetailQueryOptions(
  claimId: number,
  api: Pick<PlaceClaimApi, 'getPlaceClaim'> = placeClaimApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getPlaceClaim(claimId, signal),
    queryKey: placeClaimQueryKeys.detail(claimId),
  };
}

export function createPlaceClaimMutationOptions(
  api: Pick<PlaceClaimApi, 'createPlaceClaim'> = placeClaimApi,
) {
  return { mutationFn: (body: CreatePlaceClaimBody) => api.createPlaceClaim(body) };
}

export function createCancelPlaceClaimMutationOptions(
  api: Pick<PlaceClaimApi, 'cancelPlaceClaim'> = placeClaimApi,
) {
  return { mutationFn: (claimId: number) => api.cancelPlaceClaim(claimId) };
}

export function usePlaceClaims(params: ListPlaceClaimsParams = {}) {
  return useQuery(createPlaceClaimListQueryOptions(params));
}

export function usePlaceClaim(claimId: number) {
  return useQuery(createPlaceClaimDetailQueryOptions(claimId));
}

export function useCreatePlaceClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createPlaceClaimMutationOptions(),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: placeClaimQueryKeys.all }),
  });
}

export function useCancelPlaceClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createCancelPlaceClaimMutationOptions(),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: placeClaimQueryKeys.all }),
  });
}
