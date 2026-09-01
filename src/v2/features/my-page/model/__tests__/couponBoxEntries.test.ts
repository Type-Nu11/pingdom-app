import type { Coupon } from '../../../offers-coupons';
import {
  formatCouponInstant,
  formatOfferPeriod,
  isCouponUsable,
  toCouponBoxEntries,
  toCouponBoxListState,
} from '../couponBoxEntries';

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    benefitDescription: '4만원 이상 결제 시, 최대 10% 할인',
    code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    expiresAt: '2027-08-18T23:59:59',
    id: 1,
    issuedAt: '2026-08-18T09:00:00',
    offerId: 10,
    offerTitle: '생일 10% 할인 쿠폰',
    placeId: 100,
    placeName: '대성반점',
    redeemedAt: null,
    status: 'ISSUED',
    ...overrides,
  } as Coupon;
}

const FALLBACK = { description: '할인 쿠폰', title: '쿠폰' } as const;

describe('toCouponBoxEntries', () => {
  test('쿠폰 응답에 담긴 매장·쿠폰명·혜택을 그대로 쓰고 순서를 지킨다', () => {
    const entries = toCouponBoxEntries(
      [
        coupon({ id: 1, offerTitle: 'A', placeName: '대성반점' }),
        coupon({ benefitDescription: null, id: 2, offerTitle: null, placeName: null }),
      ],
      FALLBACK,
    );

    expect(entries.map((entry) => entry.couponId)).toEqual([1, 2]);
    expect(entries[0].title).toBe('A');
    expect(entries[0].placeName).toBe('대성반점');
    // 서버가 null을 주면 대체 카피를 쓰되, 매장명은 지어내지 않는다.
    expect(entries[1].title).toBe('쿠폰');
    expect(entries[1].description).toBe('할인 쿠폰');
    expect(entries[1].placeName).toBeUndefined();
  });

  test('nullable redeemedAt을 null로 정규화한다', () => {
    const [entry] = toCouponBoxEntries(
      [coupon({ redeemedAt: undefined as unknown as null })],
      FALLBACK,
    );
    expect(entry.redeemedAt).toBeNull();
  });
});

describe('isCouponUsable', () => {
  test('ISSUED만 사용 가능하다', () => {
    expect(isCouponUsable('ISSUED')).toBe(true);
    expect(isCouponUsable('REDEEMED')).toBe(false);
    expect(isCouponUsable('EXPIRED')).toBe(false);
  });
});

describe('toCouponBoxListState', () => {
  test('조회 실패는 빈 목록이 아니라 error로 구분한다', () => {
    expect(toCouponBoxListState(true, []).kind).toBe('error');
  });

  test('실패가 아니고 항목이 없으면 empty', () => {
    expect(toCouponBoxListState(false, []).kind).toBe('empty');
  });

  test('항목이 있으면 ready', () => {
    const state = toCouponBoxListState(false, toCouponBoxEntries([coupon()], FALLBACK));
    expect(state.kind).toBe('ready');
  });
});

describe('formatCouponInstant', () => {
  test('locale에 맞춰 날짜를 변환한다', () => {
    const ko = formatCouponInstant('2026-08-18T09:00:00', 'ko');
    const en = formatCouponInstant('2026-08-18T09:00:00', 'en');
    expect(ko).toMatch(/2026/);
    expect(en).toMatch(/2026/);
    expect(ko).not.toBe(en);
  });

  test('withTime이면 시각까지 포함한다', () => {
    const withDate = formatCouponInstant('2026-08-18T09:00:00', 'en');
    const withTime = formatCouponInstant('2026-08-18T09:00:00', 'en', { withTime: true });
    expect(withTime.length).toBeGreaterThan(withDate.length);
  });

  test('빈 값과 잘못된 값은 빈 문자열', () => {
    expect(formatCouponInstant(null, 'ko')).toBe('');
    expect(formatCouponInstant('not-a-date', 'ko')).toBe('');
  });
});

describe('formatOfferPeriod', () => {
  test('디자인 표기대로 마침표 구분 날짜를 ~로 잇는다', () => {
    expect(formatOfferPeriod('2026-08-18T09:00:00', '2027-08-18T23:59:59', 'ko'))
      .toBe('2026.08.18 ~ 2027.08.18');
  });

  test('compact면 두 자리 연도에 공백 없는 구분자를 쓴다', () => {
    expect(formatOfferPeriod('2026-08-18T09:00:00', '2027-08-18T23:59:59', 'ko', { compact: true }))
      .toBe('26.08.18~27.08.18');
  });

  test('weekday면 요일을 붙이고, 요일 이름만 locale을 따른다', () => {
    // 2026-08-18은 화요일, 2027-08-18은 수요일.
    expect(formatOfferPeriod('2026-08-18T09:00:00', '2027-08-18T23:59:59', 'ko', { weekday: true }))
      .toBe('2026.08.18(화) ~ 2027.08.18(수)');
    expect(formatOfferPeriod('2026-08-18T09:00:00', '2027-08-18T23:59:59', 'en', { weekday: true }))
      .toBe('2026.08.18(Tue) ~ 2027.08.18(Wed)');
  });

  test('한쪽만 유효하면 그 값만 반환하고 구분자를 붙이지 않는다', () => {
    expect(formatOfferPeriod('2026-08-18T09:00:00', null, 'ko')).toBe('2026.08.18');
    expect(formatOfferPeriod(null, null, 'ko')).toBe('');
    expect(formatOfferPeriod('not-a-date', 'also-bad', 'ko')).toBe('');
  });
});
