import type {
  MerchantEvent,
  MerchantProfileSummary,
  MerchantReview,
  MerchantStore,
} from '../model/types';

export const merchantProfileFixture: MerchantProfileSummary = {
  isVerified: true,
  profileImageUrl: null,
  username: 'woo._sm',
};

export const merchantStoreFixture: MerchantStore = {
  address: '대구광역시 달성군 구지면 창리로11길 79-3',
  businessHours: '09:00 ~ 20:00',
  category: '음식점',
  features: ['englishSupport', 'parking'],
  name: '대성반점',
  phoneNumber: '0507-1418-9977',
  photos: [
    { id: 'photo-1', url: 'https://cdn.pingdom.example/stores/1/1.jpg' },
    { id: 'photo-2', url: 'https://cdn.pingdom.example/stores/1/2.jpg' },
  ],
  verifiedCount: 23,
};

export const merchantReviewsFixture: MerchantReview[] = [
  {
    authorName: '이용인',
    authorProfileImageUrl: null,
    content: '암소 된장찌개가 더 맛있는 것 같아요...',
    id: 'review-1',
    photoUrls: [
      'https://cdn.pingdom.example/reviews/1/1.jpg',
      'https://cdn.pingdom.example/reviews/1/2.jpg',
    ],
    relativeTime: '26.08.18 · 2시간 전',
    tags: [{ kind: 'delicious', label: '음식이 맛있어요' }],
  },
  {
    authorName: '이용인',
    authorProfileImageUrl: null,
    content: '먼 옛날, 한 고을에 이용인이라 불리는 자가 있었다.',
    id: 'review-2',
    photoUrls: [],
    relativeTime: '26.08.18 · 2시간 전',
    tags: [
      { kind: 'delicious', label: '음식이 맛있어요' },
      { kind: 'photogenic', label: '사진 찍기 좋아요' },
      { kind: 'kind', label: '친절해요' },
      { kind: 'clean', label: '매장이 깨끗해요' },
    ],
  },
];

export const merchantEventsFixture: MerchantEvent[] = [
  {
    benefit: '4만원 이상 결제 시, 최대 10% 할인',
    id: 'event-ongoing',
    period: '26.08.18~27.08.18',
    status: 'ongoing',
    title: '여름 맞이 냉짬뽕 무료 이벤트',
  },
  {
    benefit: '4만원 이상 결제 시, 최대 10% 할인',
    id: 'event-ended',
    period: '26.08.18~27.08.18',
    status: 'ended',
    title: '여름 맞이 냉짬뽕 무료 이벤트',
  },
  {
    benefit: '4만원 이상 결제 시, 최대 10% 할인',
    id: 'event-upcoming',
    period: '26.08.18~27.08.18',
    status: 'upcoming',
    title: '여름 맞이 냉짬뽕 무료 이벤트',
  },
];
