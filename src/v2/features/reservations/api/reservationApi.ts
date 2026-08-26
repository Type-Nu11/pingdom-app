import {
  apiClient,
  type ApiClient,
  type OperationQuery,
  type OperationRequestBody,
  type OperationResponse,
  type ReservationPaymentOperationResponse,
} from '../../../shared/api';

export type ListAvailabilitiesParams = OperationQuery<'listPlaceAvailabilities'>;
export type ListReservationsParams = OperationQuery<'listMyReservations'>;
export type ListOwnedReservationsParams = OperationQuery<'listOwnedPlaceReservations'>;
export type CreateReservationBody = OperationRequestBody<'createReservation'>;
export type AvailabilityList = OperationResponse<'listPlaceAvailabilities', 200>;
export type ReservationPage = OperationResponse<'listMyReservations', 200>;
export type Reservation = OperationResponse<'createReservation', 201>;
export type ReservationDetail = ReservationPaymentOperationResponse<'get_5', 200>;

export function createReservationApi(client: ApiClient = apiClient) {
  const postReservationTransition = (
    scope: '' | '/merchant-owner',
    reservationId: number,
    transition: 'cancel' | 'confirm',
    signal?: AbortSignal,
  ): Promise<Reservation> =>
    client.post<Reservation>(
      `${scope}/reservations/${reservationId}/${transition}`,
      undefined,
      { signal },
    );

  return {
    cancelOwnedReservation: (reservationId: number, signal?: AbortSignal) =>
      postReservationTransition('/merchant-owner', reservationId, 'cancel', signal),

    cancelReservation: (reservationId: number, signal?: AbortSignal) =>
      postReservationTransition('', reservationId, 'cancel', signal),

    confirmOwnedReservation: (reservationId: number, signal?: AbortSignal) =>
      postReservationTransition('/merchant-owner', reservationId, 'confirm', signal),

    createReservation: (
      body: CreateReservationBody,
      signal?: AbortSignal,
    ): Promise<Reservation> =>
      client.post<Reservation, CreateReservationBody>('/reservations', body, { signal }),

    listAvailabilities: (
      placeId: number,
      params: ListAvailabilitiesParams = {},
      signal?: AbortSignal,
    ): Promise<AvailabilityList> =>
      client.get<AvailabilityList>(`/places/${placeId}/availabilities`, { params, signal }),

    listOwnedReservations: (
      params: ListOwnedReservationsParams = {},
      signal?: AbortSignal,
    ): Promise<ReservationPage> =>
      client.get<ReservationPage>('/merchant-owner/reservations', { params, signal }),

    getReservation: (
      reservationId: number,
      signal?: AbortSignal,
    ): Promise<ReservationDetail> =>
      client.get<ReservationDetail>(`/reservations/${reservationId}`, { signal }),

    listReservations: (
      params: ListReservationsParams = {},
      signal?: AbortSignal,
    ): Promise<ReservationPage> =>
      client.get<ReservationPage>('/reservations', { params, signal }),
  };
}

export const reservationApi = createReservationApi();
