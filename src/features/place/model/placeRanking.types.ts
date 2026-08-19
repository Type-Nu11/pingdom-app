// 배포 계약(GET /map/place-rankings, 2026-08-19 /v3/api-docs 확인) 기준 타입.
// 서버 schema는 required와 nullable을 표기하지 않고 criteria·imageSource도 자유 string이라
// 식별자 외 필드는 선택으로 두고 enum은 normalizer로 좁힌다.

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
  imageSource?: string | null;
  imageUrl?: string | null;
  latitude?: number | null;
  likeCount?: number | null;
  longitude?: number | null;
  placeId: number;
  placeName?: string | null;
  postCount?: number | null;
  rank?: number | null;
  registrantUsername?: string | null;
  representativeMediaId?: number | null;
  representativePostId?: number | null;
  score?: number | null;
  thumbnailUrl?: string | null;
};

export type PlaceRankingPage = {
  appliedRadiusKm?: number | null;
  criteria?: string | null;
  generatedAt?: string | null;
  hasNext?: boolean | null;
  items?: PlaceRankingItem[] | null;
  limit?: number | null;
  page?: number | null;
  period?: string | null;
  periodEnd?: string | null;
  periodStart?: string | null;
  radiusExpanded?: boolean | null;
  requestedRadiusKm?: number | null;
  scope?: PlaceRankingScope | null;
  totalCount?: number | null;
  totalPages?: number | null;
};
