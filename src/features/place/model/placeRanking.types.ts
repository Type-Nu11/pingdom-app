// 이슈 #190 제안 계약(docs/api/map-hotplace-trend.proposal.openapi.json) 기준 타입.
// 서버가 /v3/api-docs에 계약을 반영하면 배포 명세 기준으로 갱신한다.

export type PlaceRankingScope = 'LOCAL' | 'NATIONAL';

export type PlaceRankingPeriod = 'DAY' | 'WEEK' | 'MONTH';

export type PlaceRankingCriteria =
  | 'POST_LIKE_COUNT'
  | 'POST_COUNT'
  | 'CHECK_IN_COUNT'
  | 'COMPOSITE';

export type PlaceRankingImageSource = 'POST' | 'PLACE_EXPLORATION_MEDIA' | 'NONE';

export type PlaceRankingItem = {
  bookmarked?: boolean | null;
  category?: string | null;
  distanceMeters?: number | null;
  imageSource: PlaceRankingImageSource;
  imageUrl: string | null;
  latitude: number;
  likeCount?: number;
  longitude: number;
  placeId: number;
  placeName: string;
  postCount?: number;
  rank: number;
  registrantUsername?: string | null;
  representativeMediaId?: number | null;
  representativePostId?: number | null;
  score: number;
  thumbnailUrl: string | null;
};

export type PlaceRankingPage = {
  appliedRadiusKm?: number | null;
  criteria: PlaceRankingCriteria;
  generatedAt: string;
  hasNext: boolean;
  items: PlaceRankingItem[];
  limit: number;
  page: number;
  period: PlaceRankingPeriod;
  periodEnd: string;
  periodStart: string;
  radiusExpanded: boolean;
  requestedRadiusKm?: number | null;
  scope: PlaceRankingScope;
  totalCount: number;
  totalPages: number;
};
