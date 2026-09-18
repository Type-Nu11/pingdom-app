import type { ApiSchema } from '../contract';

const liveStatus = {
  operatingStatus: 'OPERATING',
  openNow: true,
  crowdLevel: 'MODERATE',
  waitTimeMinutes: 15,
  couponUsageStatus: 'AVAILABLE',
  observedAt: '2026-07-23T05:30:00Z',
  expiresAt: '2026-07-23T06:00:00Z',
  source: 'VISITOR_VOTE',
} satisfies ApiSchema<'LiveStatus'>;

const touristSupport = {
  supportedLanguages: ['ko', 'en'],
  englishMenu: 'AVAILABLE',
  foreignCard: 'AVAILABLE',
  taxRefund: 'UNKNOWN',
  freeWifi: 'AVAILABLE',
  reservationAvailable: true,
  couponAvailable: true,
  lastVerifiedAt: '2026-07-23T05:30:00Z',
} satisfies ApiSchema<'TouristSupport'>;

export const trustFixture = {
  score: 84,
  confidence: 'HIGH',
  verificationStatus: 'VERIFIED',
  evidenceCount: 12,
  uniqueContributors: 9,
  lastVerifiedAt: '2026-07-23T05:30:00Z',
} satisfies ApiSchema<'TrustSummary'>;

export const placeSummaryFixture = {
  id: 17,
  name: '핑덤 테스트 팝업',
  englishName: 'Pingdom Test Pop-up',
  address: '서울특별시 테스트구 픽스처로 17',
  category: 'POP_UP',
  touristSummary: 'Mock 전용 데이터로 실제 장소나 운영 정보가 아닙니다.',
  touristCategories: ['CULTURE', 'SHOPPING'],
  latitude: 37.5445,
  longitude: 127.056,
  distanceMeters: 128,
  thumbnailUrl: null,
  liveStatus,
  touristSupport,
  trustSummary: trustFixture,
} satisfies ApiSchema<'PlaceSummary'>;

export const placePageFixture = {
  places: [placeSummaryFixture],
  page: 1,
  limit: 20,
  totalCount: 1,
  totalPages: 1,
  hasNext: false,
} satisfies ApiSchema<'PlacePage'>;

export const emptyPlacePageFixture = {
  places: [],
  page: 1,
  limit: 20,
  totalCount: 0,
  totalPages: 0,
  hasNext: false,
} satisfies ApiSchema<'PlacePage'>;

const { distanceMeters: _distanceMeters, ...placeSummaryWithoutDistance } = placeSummaryFixture;

export const placeDetailFixture = {
  ...placeSummaryWithoutDistance,
  roadAddress: '서울특별시 테스트구 픽스처로 17',
  jibunAddress: null,
  postalCode: '00000',
  geocodingSource: 'MANUAL',
  timeZone: 'Asia/Seoul',
  regularHours: [
    {
      dayOfWeek: 'FRIDAY',
      closed: false,
      hours: [{ opensAt: '10:00:00', closesAt: '20:00:00' }],
    },
  ],
  operatingExceptions: [],
  activeOperatingNotices: [],
  registrant: 'MOCK_FIXTURE',
  merchantOwner: {
    userId: 101,
    businessName: 'Pingdom Fixture Store',
    displayName: 'Fixture Owner',
    description: 'Synthetic merchant used only in development.',
    contactEmail: null,
    contactPhone: null,
  },
} satisfies ApiSchema<'PlaceDetail'>;

export const checkInFixture = {
  id: 7001,
  placeId: 17,
  checkInDate: '2026-07-23',
  observedAt: '2026-07-23T05:30:00Z',
  recordedAt: '2026-07-23T05:30:02Z',
  distanceMeters: 18.4,
  status: 'PROXIMITY_MATCHED',
} satisfies ApiSchema<'LocationCheckIn'>;

export const checkInPageFixture = {
  checkIns: [checkInFixture],
  page: 1,
  limit: 20,
  totalCount: 1,
  totalPages: 1,
  hasNext: false,
} satisfies ApiSchema<'LocationCheckInPage'>;

export const statusVoteFixture = {
  id: 7101,
  placeId: 17,
  checkInId: 7001,
  crowdLevel: 'MODERATE',
  waitTimeMinutes: 15,
  couponUsageStatus: 'AVAILABLE',
  observedAt: '2026-07-23T05:30:00Z',
  submittedAt: '2026-07-23T05:31:00Z',
  liveStatus,
} satisfies ApiSchema<'StatusVote'>;

export const placeClaimFixture = {
  id: 301,
  placeId: 17,
  claimType: 'INITIAL',
  status: 'PENDING',
  reason: 'Mock ownership proof',
  reviewReason: null,
  reviewedAt: null,
  createdAt: '2026-07-23T05:30:00Z',
  updatedAt: '2026-07-23T05:30:00Z',
} satisfies ApiSchema<'PlaceClaim'>;

export const placeClaimPageFixture = {
  claims: [placeClaimFixture],
  page: 1,
  limit: 20,
  totalCount: 1,
  totalPages: 1,
  hasNext: false,
} satisfies ApiSchema<'PlaceClaimPage'>;

export const conversionBatchResultFixture = {
  acceptedAt: '2026-07-23T05:30:02Z',
  results: [
    {
      eventId: '00000000-0000-4000-8000-000000000001',
      status: 'ACCEPTED',
      code: null,
    },
  ],
} satisfies ApiSchema<'ConversionEventBatchResult'>;

/**
 * Presentation-only projection until a merchant performance endpoint is added
 * to mvp.openapi.json. Values are synthetic aggregates of ConversionEventName.
 */
export type MerchantPerformanceFixture = {
  placeId: number;
  period: { from: string; to: string };
  metrics: {
    impressions: number;
    cardClicks: number;
    couponSaves: number;
    navigationStarts: number;
    reservationCreates: number;
    completedCheckIns: number;
  };
  trustScore: ApiSchema<'TrustSummary'>;
};

export const merchantPerformanceFixture = {
  placeId: 17,
  period: { from: '2026-07-17', to: '2026-07-23' },
  metrics: {
    impressions: 1240,
    cardClicks: 286,
    couponSaves: 74,
    navigationStarts: 53,
    reservationCreates: 18,
    completedCheckIns: 31,
  },
  trustScore: trustFixture,
} satisfies MerchantPerformanceFixture;

export const emptyPageFixtures = {
  checkIns: { ...checkInPageFixture, checkIns: [], totalCount: 0, totalPages: 0 },
  claims: { ...placeClaimPageFixture, claims: [], totalCount: 0, totalPages: 0 },
  places: emptyPlacePageFixture,
} satisfies {
  checkIns: ApiSchema<'LocationCheckInPage'>;
  claims: ApiSchema<'PlaceClaimPage'>;
  places: ApiSchema<'PlacePage'>;
};
