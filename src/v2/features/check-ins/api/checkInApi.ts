import {
  apiClient,
  type ApiClient,
  type OperationRequestBody,
  type OperationResponse,
  type PlaceExplorationOperationQuery,
  type PlaceExplorationOperationResponse,
} from '../../../shared/api';

export type ListCheckInsParams = PlaceExplorationOperationQuery<'listMine_4'>;
export type CreateCheckInBody = OperationRequestBody<'createLocationCheckIn'>;
export type CreateStatusVoteBody = OperationRequestBody<'createPlaceStatusVote'>;
export type LocationCheckIn = OperationResponse<'createLocationCheckIn', 201>;
export type LocationCheckInListItem = Pick<
  LocationCheckIn,
  'distanceMeters' | 'id' | 'observedAt' | 'placeId'
> & Partial<LocationCheckIn>;
export type LocationCheckInPage = Omit<
  OperationResponse<'listMyLocationCheckIns', 200>,
  'checkIns'
> & { checkIns: LocationCheckInListItem[] };
export type StatusVote = OperationResponse<'createPlaceStatusVote', 201>;

type LocationCheckInWirePage = PlaceExplorationOperationResponse<'listMine_4', 200>;

function isUsableCheckIn(
  item: NonNullable<LocationCheckInWirePage['items']>[number],
): item is NonNullable<LocationCheckInWirePage['items']>[number] & {
  distanceMeters: number;
  id: number;
  observedAt: string;
  placeId: number;
} {
  return Number.isInteger(item.id)
    && Number(item.id) > 0
    && Number.isInteger(item.placeId)
    && Number(item.placeId) > 0
    && Number.isFinite(item.distanceMeters)
    && typeof item.observedAt === 'string'
    && item.observedAt.length > 0;
}

export function normalizeLocationCheckInPage(
  page: LocationCheckInWirePage,
  params: ListCheckInsParams = {},
): LocationCheckInPage {
  const currentPage = page.page ?? params.page ?? 1;
  const hasNext = page.hasNext ?? false;

  return {
    checkIns: (page.items ?? []).filter(isUsableCheckIn),
    hasNext,
    limit: page.limit ?? params.limit ?? 20,
    page: currentPage,
    totalCount: page.totalElements ?? 0,
    totalPages: page.totalPages ?? (hasNext ? currentPage + 1 : currentPage),
  };
}

export function createCheckInApi(client: ApiClient = apiClient) {
  return {
    createCheckIn: (body: CreateCheckInBody, signal?: AbortSignal): Promise<LocationCheckIn> =>
      client.post<LocationCheckIn, CreateCheckInBody>('/location-check-ins', body, { signal }),

    createStatusVote: (
      placeId: number,
      body: CreateStatusVoteBody,
      signal?: AbortSignal,
    ): Promise<StatusVote> =>
      client.post<StatusVote, CreateStatusVoteBody>(
        `/places/${placeId}/status-votes`,
        body,
        { signal },
      ),

    listCheckIns: async (
      params: ListCheckInsParams = {},
      signal?: AbortSignal,
<<<<<<< HEAD
    ): Promise<LocationCheckInPage> => {
      // The live server responds with `items`/`totalElements`; the generated
      // contract (last regenerated against an older spec) still expects
      // `checkIns`/`totalCount`. Normalize so callers can rely on either.
      const raw = await client.get<Record<string, unknown>>('/location-check-ins', { params, signal });
      return {
        ...raw,
        checkIns: (raw.items ?? raw.checkIns ?? []) as LocationCheckInPage['checkIns'],
        totalCount: (raw.totalElements ?? raw.totalCount ?? 0) as LocationCheckInPage['totalCount'],
      } as LocationCheckInPage;
    },
=======
    ): Promise<LocationCheckInPage> => client
      .get<LocationCheckInWirePage>('/location-check-ins', { params, signal })
      .then((page) => normalizeLocationCheckInPage(page, params)),
>>>>>>> origin/dev
  };
}

export const checkInApi = createCheckInApi();
