import type { Offer, PlaceReview, RegularOperatingHour } from '../../api/merchantOwnerApi';
import {
  formatBusinessHours,
  toEventStatus,
  toMerchantEvents,
  toMerchantReviews,
} from '../mappers';

function hour(dayOfWeek: RegularOperatingHour['dayOfWeek'], opensAt: string, closesAt: string): RegularOperatingHour {
  return { closesAt, dayOfWeek, opensAt };
}

describe('formatBusinessHours', () => {
  test('모든 요일이 같은 시간대면 하나로 합친다', () => {
    const hours = [
      hour('MONDAY', '09:00:00', '20:00:00'),
      hour('TUESDAY', '09:00:00', '20:00:00'),
      hour('WEDNESDAY', '09:00:00', '20:00:00'),
    ];
    expect(formatBusinessHours(hours)).toBe('09:00 ~ 20:00');
  });

  test('요일마다 다르면 가장 이른 요일 기준으로 보여준다', () => {
    const hours = [
      hour('WEDNESDAY', '10:00:00', '22:00:00'),
      hour('MONDAY', '09:00:00', '20:00:00'),
    ];
    expect(formatBusinessHours(hours)).toBe('09:00 ~ 20:00');
  });

  test('시간 정보가 없으면 빈 문자열', () => {
    expect(formatBusinessHours([])).toBe('');
  });
});

describe('toEventStatus', () => {
  const now = new Date('2026-08-20T00:00:00Z');
  const base: Offer = {
    benefitDescription: 'b',
    description: 'd',
    endsAt: '2026-08-25T00:00:00Z',
    id: 1,
    placeId: 10,
    startsAt: '2026-08-18T00:00:00Z',
    status: 'PUBLISHED',
    title: 't',
  };

  test('게시 상태이고 기간 안이면 ongoing', () => {
    expect(toEventStatus(base, now)).toBe('ongoing');
  });

  test('종료 상태면 ended', () => {
    expect(toEventStatus({ ...base, status: 'CLOSED' }, now)).toBe('ended');
  });

  test('종료일이 지났으면 ended', () => {
    expect(toEventStatus({ ...base, endsAt: '2026-08-19T00:00:00Z' }, now)).toBe('ended');
  });

  test('시작 전이면 upcoming', () => {
    expect(toEventStatus({ ...base, startsAt: '2026-08-22T00:00:00Z' }, now)).toBe('upcoming');
  });

  test('DRAFT면 upcoming', () => {
    expect(toEventStatus({ ...base, status: 'DRAFT' }, now)).toBe('upcoming');
  });
});

describe('toMerchantEvents', () => {
  test('다른 장소의 Offer는 제외하고 기간 라벨을 만든다', () => {
    const offers: Offer[] = [
      {
        benefitDescription: '음료 무료',
        description: 'd',
        endsAt: '2027-08-18T00:00:00Z',
        id: 1,
        placeId: 10,
        startsAt: '2026-08-18T00:00:00Z',
        status: 'PUBLISHED',
        title: '여름 이벤트',
      },
      {
        benefitDescription: 'x',
        description: 'd',
        endsAt: '2027-08-18T00:00:00Z',
        id: 2,
        placeId: 99,
        startsAt: '2026-08-18T00:00:00Z',
        status: 'PUBLISHED',
        title: '다른 가게',
      },
    ];

    const events = toMerchantEvents(offers, 10, new Date('2026-09-01T00:00:00Z'));

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      benefit: '음료 무료',
      id: '1',
      period: '26.08.18~27.08.18',
      status: 'ongoing',
      title: '여름 이벤트',
    });
  });
});

describe('toMerchantReviews', () => {
  const translate = (key: string, values: Record<string, unknown>) => key.endsWith('.time')
    ? `${values.date} · ${values.relative}`
    : `이용인 #${values.id}`;
  const review = (overrides: Partial<PlaceReview>): PlaceReview => ({
    content: 'c',
    createdAt: '2026-08-18T10:00:00Z',
    imageUrls: [],
    placeId: 10,
    reviewId: 1,
    userId: 1,
    ...overrides,
  });
  const now = new Date('2026-08-18T12:00:00Z');

  test('recommendReasons를 서버 순서대로 옮기고 상대 시간과 사진을 만든다', () => {
    const [mapped] = toMerchantReviews(
      [review({
        content: '맛있어요',
        imageUrls: ['https://cdn/1.jpg'],
        recommendReasons: ['GOOD_FOOD', 'PHOTO_SPOT', 'FRIENDLY'],
        reviewId: 5,
        userId: 42,
      })],
      now, 'ko', translate,
    );

    expect(mapped.id).toBe('5');
    expect(mapped.reasons).toEqual(['delicious', 'photoSpot', 'kind']);
    expect(mapped.relativeTime).toContain('2시간 전');
    expect(mapped.photoUrls).toEqual(['https://cdn/1.jpg']);
  });

  test('필드가 없거나 null이거나 비어 있으면 태그가 없다', () => {
    const mapped = toMerchantReviews(
      [
        review({ reviewId: 1 }),
        review({ recommendReasons: null, reviewId: 2 }),
        review({ recommendReasons: [], reviewId: 3 }),
        review({ recommendReason: '', reviewId: 4 }),
      ],
      now, 'ko', translate,
    );

    expect(mapped.map((item) => item.reasons)).toEqual([[], [], [], []]);
  });

  test('중복 코드는 하나로 합치고 알 수 없는 코드와 자유 문구는 표시하지 않는다', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const mapped = toMerchantReviews(
      [
        review({ recommendReasons: ['CLEAN', 'CLEAN', 'SOMETHING_NEW', 'PARKING'], reviewId: 1 }),
        review({ recommendReason: '음식이 맛있어요', reviewId: 2 }),
      ],
      now, 'ko', translate,
    );
    warn.mockRestore();

    expect(mapped.map((item) => item.reasons)).toEqual([['clean', 'parking'], []]);
  });
});
