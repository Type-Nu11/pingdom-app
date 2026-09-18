import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import {
  reservationApi,
  type CreateReservationBody,
  type ListAvailabilitiesParams,
  type ListOwnedReservationsParams,
  type ListReservationsParams,
} from '../api/reservationApi';

type ReservationApi = typeof reservationApi;

export const reservationQueryKeys = {
  all: ['v2', 'reservations'] as const,
  availabilitiesRoot: ['v2', 'availabilities'] as const,
  availabilitiesByPlace: (placeId: number) =>
    [...reservationQueryKeys.availabilitiesRoot, placeId] as const,
  availabilities: (placeId: number, params: ListAvailabilitiesParams) =>
    [...reservationQueryKeys.availabilitiesByPlace(placeId), params] as const,
  lists: () => [...reservationQueryKeys.all, 'mine'] as const,
  list: (params: ListReservationsParams) => [...reservationQueryKeys.lists(), params] as const,
  owned: (params: ListOwnedReservationsParams) =>
    [...reservationQueryKeys.all, 'owned', params] as const,
  detail: (reservationId: number) =>
    [...reservationQueryKeys.all, 'detail', reservationId] as const,
};

export function createReservationDetailQueryOptions(
  reservationId: number,
  api: Pick<ReservationApi, 'getReservation'> = reservationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.getReservation(reservationId, signal),
    queryKey: reservationQueryKeys.detail(reservationId),
  };
}

export function createAvailabilitiesQueryOptions(
  placeId: number,
  params: ListAvailabilitiesParams = {},
  api: Pick<ReservationApi, 'listAvailabilities'> = reservationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.listAvailabilities(placeId, params, signal),
    queryKey: reservationQueryKeys.availabilities(placeId, params),
  };
}

export function createReservationsQueryOptions(
  params: ListReservationsParams = {},
  api: Pick<ReservationApi, 'listReservations'> = reservationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listReservations(params, signal),
    queryKey: reservationQueryKeys.list(params),
  };
}

export function createOwnedReservationsQueryOptions(
  params: ListOwnedReservationsParams = {},
  api: Pick<ReservationApi, 'listOwnedReservations'> = reservationApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listOwnedReservations(params, signal),
    queryKey: reservationQueryKeys.owned(params),
  };
}

export function createReservationMutationOptions(
  api: Pick<ReservationApi, 'createReservation'> = reservationApi,
) {
  return { mutationFn: (body: CreateReservationBody) => api.createReservation(body) };
}

type ReservationTransition =
  | 'cancelOwnedReservation'
  | 'cancelReservation'
  | 'confirmOwnedReservation';

export function createReservationTransitionMutationOptions(
  transition: ReservationTransition,
  api: Pick<ReservationApi, ReservationTransition> = reservationApi,
) {
  return { mutationFn: (reservationId: number) => api[transition](reservationId) };
}

export function useAvailabilities(placeId: number, params: ListAvailabilitiesParams = {}) {
  return useQuery(createAvailabilitiesQueryOptions(placeId, params));
}

export function useReservations(params: ListReservationsParams = {}) {
  return useQuery(createReservationsQueryOptions(params));
}

export function useReservationDetail(reservationId: number) {
  return useQuery(createReservationDetailQueryOptions(reservationId));
}

export function useOwnedReservations(params: ListOwnedReservationsParams = {}) {
  return useQuery(createOwnedReservationsQueryOptions(params));
}

/**
 * A successful create only invalidates what the new reservation can change: the
 * user's reservation list and, when the origin place is known, that place's
 * availability. Place, recommendation, and review caches are left untouched.
 */
export async function invalidateReservationCreateDependencies(
  queryClient: QueryClient,
  placeId?: number,
) {
  await queryClient.invalidateQueries({ queryKey: reservationQueryKeys.lists() });
  if (typeof placeId === 'number') {
    await queryClient.invalidateQueries({
      queryKey: reservationQueryKeys.availabilitiesByPlace(placeId),
    });
  }
}

export function useCreateReservation(placeId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    ...createReservationMutationOptions(),
    onSuccess: () => {
      // The reservation write is complete; refresh lists in the background so the
      // success screen is not coupled to a second network round trip.
      void invalidateReservationCreateDependencies(queryClient, placeId);
    },
  });
}

export function useReservationTransition(transition: ReservationTransition) {
  const queryClient = useQueryClient();
  return useMutation({
    ...createReservationTransitionMutationOptions(transition),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reservationQueryKeys.all });
    },
  });
}
