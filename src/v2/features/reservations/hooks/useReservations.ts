import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  availabilities: (placeId: number, params: ListAvailabilitiesParams) =>
    ['v2', 'availabilities', placeId, params] as const,
  list: (params: ListReservationsParams) => [...reservationQueryKeys.all, 'mine', params] as const,
  owned: (params: ListOwnedReservationsParams) =>
    [...reservationQueryKeys.all, 'owned', params] as const,
};

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

export function useOwnedReservations(params: ListOwnedReservationsParams = {}) {
  return useQuery(createOwnedReservationsQueryOptions(params));
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    ...createReservationMutationOptions(),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: reservationQueryKeys.all }),
  });
}

export function useReservationTransition(transition: ReservationTransition) {
  const queryClient = useQueryClient();
  return useMutation({
    ...createReservationTransitionMutationOptions(transition),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: reservationQueryKeys.all }),
  });
}
