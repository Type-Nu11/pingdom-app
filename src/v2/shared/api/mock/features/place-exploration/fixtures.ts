import type { PlaceExplorationSchema } from '../../../placeExplorationContract';

export const placeAutocompleteFixture = {
  keyword: 'PingDom',
  limit: 10,
  totalCount: 1,
  places: [{
    id: 17,
    name: 'PingDom Test Place',
    address: 'Jinju-si',
    roadAddress: null,
    category: 'CAFE',
    latitude: 35.18,
    longitude: 128.1,
    distanceMeters: 128,
  }],
} satisfies PlaceExplorationSchema<'PlaceAutocompleteResponse'>;

export const mapViewportFixture = {
  mode: 'MARKERS',
  zoom: 15,
  clusters: [],
  markers: [{
    placeId: 17,
    name: 'PingDom Test Place',
    category: 'CAFE',
    imageUrl: 'https://cdn.example.test/places/17.jpg',
    latitude: 35.18,
    longitude: 128.1,
    photoCount: 3,
  }],
  truncated: false,
} satisfies PlaceExplorationSchema<'MapViewportResponse'>;

export const placeCardFixture = {
  id: 17,
  name: 'PingDom Test Place',
  englishName: 'PingDom Test Place',
  imageUrl: 'https://cdn.example.test/places/17.jpg',
  address: 'Jinju-si',
  roadAddress: null,
  geocodingSource: 'KAKAO',
  operatingStatus: 'OPERATING',
  currentlyOperating: true,
  currentlyOperatingCheckedAt: '2026-08-11T03:00:00Z',
  category: 'CAFE',
  touristSummary: 'Synthetic place used by the V2 mock transport.',
  touristCategories: ['CAFE'],
  primaryInformationSource: 'ADMIN',
  informationVerificationStatus: 'ADMIN_VERIFIED',
  informationVerifiedAt: '2026-08-10T03:00:00Z',
  informationEvidenceUpdatedAt: '2026-08-10T03:00:00Z',
  verifiedEvidenceCount: 1,
  lastVerifiedAt: '2026-08-10T03:00:00Z',
  lastVerifiedSourceType: 'ADMIN',
  latitude: 35.18,
  longitude: 128.1,
} satisfies PlaceExplorationSchema<'TouristPlaceCardResponse'>;

export const operatingNoticesFixture = {
  placeId: 17,
  currentlyOperating: true,
  checkedAt: '2026-08-11T03:00:00Z',
  notices: [{
    id: 71,
    placeId: 17,
    noticeType: 'HOURS_CHANGE',
    severity: 'INFO',
    status: 'ACTIVE',
    message: 'Synthetic extended-hours notice.',
    startsAt: '2026-08-11T00:00:00Z',
    expiresAt: '2026-08-12T00:00:00Z',
    expiredAt: null,
    canceledAt: null,
    cancelReason: null,
    visibleNow: true,
  }],
} satisfies PlaceExplorationSchema<'PlaceOperatingNoticeListResponse'>;

export const verificationMediaFixture = {
  placeId: 17,
  media: [{
    id: 81,
    placeId: 17,
    purpose: 'VERIFICATION',
    imageUrl: 'https://cdn.example.test/places/17/verification.jpg',
    s3Key: null,
    thumbnailUrl: null,
    thumbnailS3Key: null,
    sourceMapImageId: null,
    displayOrder: 0,
    createdAt: '2026-08-10T03:00:00Z',
    updatedAt: '2026-08-10T03:00:00Z',
  }],
} satisfies PlaceExplorationSchema<'PlaceMediaResponse'>;

export const recommendationExplanationFixture = {
  requestId: '9f7263d5-65f1-4834-9ca3-86ad2fc4e7d0',
  items: [{
    placeId: 17,
    placeName: 'PingDom Test Place',
    ranking: 1,
    source: 'PERSONAL',
    distanceMeters: 128,
    finalScore: 0.74,
  }],
} satisfies PlaceExplorationSchema<'PlaceRecommendationExplanationResponse'>;

export const visitDecisionFixture = {
  place: {
    id: 17,
    name: 'PingDom Test Place',
    englishName: 'PingDom Test Place',
    address: 'Jinju-si',
    roadAddress: null,
    jibunAddress: null,
    postalCode: null,
    geocodingSource: 'KAKAO',
    operatingStatus: 'OPERATING',
    operatingStatusCheckedAt: '2026-08-11T03:00:00Z',
    currentlyOperating: true,
    currentlyOperatingCheckedAt: '2026-08-11T03:00:00Z',
    regularHours: [],
    operatingExceptions: [],
    activeOperatingNotices: operatingNoticesFixture.notices,
    touristSummary: 'Synthetic place used by the V2 mock transport.',
    touristCategories: ['CAFE'],
    primaryInformationSource: 'ADMIN',
    informationVerificationStatus: 'ADMIN_VERIFIED',
    informationVerifiedAt: '2026-08-10T03:00:00Z',
    informationEvidenceUpdatedAt: '2026-08-10T03:00:00Z',
    verifiedEvidenceCount: 1,
    lastVerifiedAt: '2026-08-10T03:00:00Z',
    lastVerifiedSourceType: 'ADMIN',
    latitude: 35.18,
    longitude: 128.1,
    registrant: 'mock-user',
    merchantOwner: null,
  },
  merchantInformation: null,
  ongoingEvents: [],
  reservableAvailabilities: [],
  availableOffers: {
    offers: [],
    page: 0,
    limit: 20,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
  },
  checkedAt: '2026-08-11T03:00:00Z',
} satisfies PlaceExplorationSchema<'PlaceVisitDecisionResponse'>;

export const emptyPlaceExplorationFixtures = {
  autocomplete: { ...placeAutocompleteFixture, places: [], totalCount: 0 },
  mapViewport: { ...mapViewportFixture, clusters: [], markers: [] },
  operatingNotices: { ...operatingNoticesFixture, notices: [] },
  verificationMedia: { ...verificationMediaFixture, media: [] },
  recommendationExplanation: { ...recommendationExplanationFixture, items: [] },
  visitDecision: {
    ...visitDecisionFixture,
    ongoingEvents: [],
    reservableAvailabilities: [],
    availableOffers: { ...visitDecisionFixture.availableOffers, offers: [] },
  },
};
