import type {
  MapHomeFeedsOperationQuery,
  MapHomeFeedsOperationResponse,
  MapHomeFeedsSchema,
} from '../../../shared/api';

export type LocalHotContractQuery = MapHomeFeedsOperationQuery<'findLocalHotPlaces'>;
export type NationalTrendsContractQuery = MapHomeFeedsOperationQuery<'findTrends'>;
export type LocalHotResponse = MapHomeFeedsOperationResponse<'findLocalHotPlaces', 200>;
export type NationalTrendsResponse = MapHomeFeedsOperationResponse<'findTrends', 200>;
export type RankingPlaceContract = MapHomeFeedsSchema<'Item'>;

export type LocalHotRequest = {
  latitude?: number;
  longitude?: number;
  regionCode?: string;
  page?: number;
  limit?: number;
};

export type NationalTrendsRequest = {
  period?: 'WEEK';
  page?: number;
  limit?: number;
};

export type RankedPlaceViewModel = {
  address: string;
  bookmarkAdds: number;
  bookmarkCount: number;
  bookmarked: boolean;
  bookmarkRemoves: number;
  category: string;
  imageUrl?: string;
  name: string;
  netBookmarkGrowth: number;
  placeId: number;
  rank: number;
};

export type RankedPlaceFeedStatus =
  | 'disabled'
  | 'location-pending'
  | 'location-denied'
  | 'loading'
  | 'ready'
  | 'empty'
  | 'invalid-location'
  | 'region-not-found'
  | 'region-resolution-failed'
  | 'region-service-unavailable'
  | 'unauthorized'
  | 'forbidden'
  | 'invalid-period'
  | 'error';

export type RankedPlaceFeed = {
  hasNext: boolean;
  isFetchingNextPage?: boolean;
  places: RankedPlaceViewModel[];
  retry: () => void;
  status: RankedPlaceFeedStatus;
  title?: string;
};
