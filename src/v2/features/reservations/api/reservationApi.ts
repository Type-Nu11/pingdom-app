import {
  apiClient,
  type ApiClient,
  type OperationQuery,
  type ReservationPaymentOperationQuery,
  type ReservationPaymentOperationRequestBody,
  type ReservationPaymentOperationResponse,
} from '../../../shared/api';

// The tourist reservation surface (list, create, cancel, availabilities, detail)
// is typed by the live `app` group snapshot in `reservation-payment.openapi.json`.
// The merchant-owner endpoints below stay on the app-wide `mvp` contract because
// the `app` group does not expose them.
export type ListReservationsParams = ReservationPaymentOperationQuery<'listMyReservations'>;
export type ListOwnedReservationsParams = OperationQuery<'listOwnedPlaceReservations'>;
// The live `/places/{placeId}/availabilities` operation takes no query params.
export type ListAvailabilitiesParams = Record<string, never>;
export type CreateReservationBody = ReservationPaymentOperationRequestBody<'createReservation'>;
export type AvailabilityList = ReservationPaymentOperationResponse<'listPlaceAvailabilities', 200>;
export type ReservationPage = ReservationPaymentOperationResponse<'listMyReservations', 200>;
export type Reservation = ReservationPaymentOperationResponse<'createReservation', 201>;
export type ReservationDetail = ReservationPaymentOperationResponse<'getMyReservation', 200>;

// The live server responds with `totalElements`; the merchant-owner list on the
// older `mvp` contract still says `totalCount`. Normalize so callers can rely on
// `totalElements` regardless of which endpoint produced the page.
function normalizeReservationPage(raw: Record<string, unknown>): ReservationPage {
  return {
    ...raw,
    totalElements: (raw.totalElements ?? raw.totalCount ?? 0) as number,
  } as ReservationPage;
}

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

    listOwnedReservations: async (
      params: ListOwnedReservationsParams = {},
      signal?: AbortSignal,
    ): Promise<ReservationPage> =>
      normalizeReservationPage(
        await client.get<Record<string, unknown>>('/merchant-owner/reservations', { params, signal }),
      ),

    getReservation: (
      reservationId: number,
      signal?: AbortSignal,
    ): Promise<ReservationDetail> =>
      client.get<ReservationDetail>(`/reservations/${reservationId}`, { signal }),

    listReservations: async (
      params: ListReservationsParams = {},
      signal?: AbortSignal,
    ): Promise<ReservationPage> =>
      normalizeReservationPage(
        await client.get<Record<string, unknown>>('/reservations', { params, signal }),
      ),
  };
}

export const reservationApi = createReservationApi();
