import type {
  LocalHotContractQuery,
  LocalHotRequest,
  NationalTrendsContractQuery,
  NationalTrendsRequest,
  RankedPlaceViewModel,
  RankingPlaceContract,
} from './mapHomeFeeds.types';
import { toApiError } from '../../../../shared/api';
import type { RankedPlaceFeedStatus } from './mapHomeFeeds.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const validPage = (page: number) => Number.isInteger(page) && page >= 1;
const validLimit = (limit: number) => Number.isInteger(limit) && limit >= 1 && limit <= 50;
const validLatitude = (value: number) => Number.isFinite(value) && value >= -90 && value <= 90;
const validLongitude = (value: number) => Number.isFinite(value) && value >= -180 && value <= 180;

export function selectLocalHotParams(params: LocalHotRequest): LocalHotContractQuery | null {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if (!validPage(page) || !validLimit(limit)) return null;

  const hasLatitude = params.latitude !== undefined;
  const hasLongitude = params.longitude !== undefined;
  const hasRegionCode = params.regionCode !== undefined;
  if (hasRegionCode) {
    if (hasLatitude || hasLongitude || !/^\d{5}$/.test(params.regionCode ?? '')) return null;
    return { regionCode: params.regionCode, page, limit };
  }
  if (!hasLatitude || !hasLongitude) return null;
  if (!validLatitude(params.latitude as number) || !validLongitude(params.longitude as number)) return null;

  return {
    latitude: Math.round((params.latitude as number) * 10_000) / 10_000,
    longitude: Math.round((params.longitude as number) * 10_000) / 10_000,
    page,
    limit,
  };
}

export function selectNationalTrendsParams(
  params: NationalTrendsRequest = {},
): NationalTrendsContractQuery | null {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;
  if ((params.period ?? 'WEEK') !== 'WEEK' || !validPage(page) || !validLimit(limit)) return null;
  return {
    period: params.period ?? 'WEEK',
    page,
    limit,
  };
}

export function toRankedPlaceViewModels(items: RankingPlaceContract[] | undefined): RankedPlaceViewModel[] {
  return (items ?? []).flatMap((item) => {
    if (!Number.isFinite(item.placeId) || !Number.isFinite(item.rank) || !item.placeName?.trim()) {
      return [];
    }
    return [{
      address: item.address?.trim() ?? '',
      bookmarkAdds: item.bookmarkAdds ?? 0,
      bookmarkCount: item.bookmarkCount ?? 0,
      bookmarked: item.bookmarked ?? false,
      bookmarkRemoves: item.bookmarkRemoves ?? 0,
      category: item.category?.trim() ?? '',
      imageUrl: item.imageUrl?.trim() || undefined,
      name: item.placeName.trim(),
      netBookmarkGrowth: item.netBookmarkGrowth ?? 0,
      placeId: item.placeId as number,
      rank: item.rank as number,
    }];
  });
}

type FeedStatusInput = {
  enabled?: boolean;
  error?: unknown;
  isLoading?: boolean;
  placeCount?: number;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && typeof (error as { status?: unknown }).status === 'number') {
    return (error as { status: number }).status;
  }
  return toApiError(error).status;
};

export function getLocalHotFeedStatus(
  input: FeedStatusInput & {
    hasValidLocation?: boolean;
    locationStatus: 'denied' | 'failed' | 'granted' | 'loading';
  },
): RankedPlaceFeedStatus {
  if (input.enabled === false) return 'disabled';
  if (input.locationStatus === 'loading') return 'location-pending';
  if (input.locationStatus === 'denied') return 'location-denied';
  if (input.locationStatus === 'failed') return 'invalid-location';
  if (input.hasValidLocation === false) return 'invalid-location';
  if (input.isLoading) return 'loading';
  if (input.error) {
    switch (getErrorStatus(input.error)) {
      case 400: return 'invalid-location';
      case 401: return 'unauthorized';
      case 403: return 'forbidden';
      case 404: return 'region-not-found';
      case 502: return 'region-resolution-failed';
      case 503: return 'region-service-unavailable';
      default: return 'error';
    }
  }
  return (input.placeCount ?? 0) > 0 ? 'ready' : 'empty';
}

export function getNationalTrendsFeedStatus(input: FeedStatusInput): RankedPlaceFeedStatus {
  if (input.enabled === false) return 'disabled';
  if (input.isLoading) return 'loading';
  if (input.error) {
    switch (getErrorStatus(input.error)) {
      case 400: return 'invalid-period';
      case 401: return 'unauthorized';
      case 403: return 'forbidden';
      default: return 'error';
    }
  }
  return (input.placeCount ?? 0) > 0 ? 'ready' : 'empty';
}
