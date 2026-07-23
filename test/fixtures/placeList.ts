import type { PlaceListPage } from '../../src/v2/features/place-list/model/placeList.types';

export const emptyPlaceListPage: PlaceListPage = {
  hasNext: false,
  limit: 10,
  page: 1,
  places: [],
  totalCount: 0,
  totalPages: 0,
};

export const placeListPage: PlaceListPage = {
  ...emptyPlaceListPage,
  places: [
    {
      address: '경상남도 진주시 남강로 626',
      category: 'ATTRACTION',
      distanceMeters: 128,
      englishName: 'Jinjuseong Fortress',
      id: 17,
      latitude: 35.1894,
      liveStatus: {
        couponUsageStatus: 'AVAILABLE',
        crowdLevel: 'MODERATE',
        expiresAt: '2026-07-23T06:00:00Z',
        observedAt: '2026-07-23T05:30:00Z',
        openNow: true,
        operatingStatus: 'OPERATING',
        source: 'VISITOR_VOTE',
        waitTimeMinutes: 15,
      },
      longitude: 128.0789,
      name: '진주성',
      thumbnailUrl: 'https://cdn.pingdom.example/places/17/thumb.jpg',
      touristCategories: ['CULTURE'],
      touristSummary: '남강을 따라 걷기 좋은 역사 명소',
      touristSupport: {
        couponAvailable: true,
        englishMenu: 'AVAILABLE',
        foreignCard: 'AVAILABLE',
        freeWifi: 'AVAILABLE',
        lastVerifiedAt: '2026-07-22T12:00:00Z',
        reservationAvailable: true,
        supportedLanguages: ['ko', 'en'],
        taxRefund: 'UNKNOWN',
      },
      trustSummary: {
        confidence: 'HIGH',
        evidenceCount: 12,
        lastVerifiedAt: '2026-07-23T05:30:00Z',
        score: 84,
        uniqueContributors: 9,
        verificationStatus: 'VERIFIED',
      },
    },
  ],
  totalCount: 1,
  totalPages: 1,
};
