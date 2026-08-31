import type { Coupon, Offer } from '../../../offers-coupons';
import {
  COUPON_STATUS_FILTERS,
  formatCouponDateRange,
  formatCouponInstant,
  isCouponUsable,
  toCouponBoxEntries,
  toCouponBoxListState,
} from '../couponBoxEntries';

function coupon(overrides: Partial<Coupon> = {}): Coupon {
  return {
    code: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    expiresAt: '2027-08-18T23:59:59',
    id: 1,
    issuedAt: '2026-08-18T09:00:00',
    offerId: 10,
    redeemedAt: null,
    status: 'ISSUED',
    ...overrides,
  } as Coupon;
}

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    benefitDescription: '4만원 이상 결제 시, 최대 10% 할인',
    id: 10,
    placeId: 100,
    title: '생일 10% 할인 쿠폰',
    ...overrides,
  } as Offer;
}

const FALLBACK = { description: '할인 쿠폰', title: '쿠폰' } as const;

describe('toCouponBoxEntries', () => {
  test('쿠폰에 offer 정보를 결합하고 순서를 유지한다', () => {
    const entries = toCouponBoxEntries(
      [coupon({ id: 1, offerId: 10 }), coupon({ id: 2, offerId: 20 })],
      new Map([[10, offer({ id: 10, title: 'A' })]]),
      FALLBACK,
    );

    expect(entries.map((entry) => entry.couponId)).toEqual([1, 2]);
    expect(entries[0].title).toBe('A');
    // offer 미로딩 행은 사라지지 않고 fallback 카피를 쓴다.
    expect(entries[1].title).toBe('쿠폰');
    expect(entries[1].description).toBe('할인 쿠폰');
  });

  test('nullable redeemedAt을 null로 정규화한다', () => {
    const [entry] = toCouponBoxEntries(
      [coupon({ redeemedAt: undefined as unknown as null })],
      new Map(),
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
    const state = toCouponBoxListState(false, toCouponBoxEntries([coupon()], new Map(), FALLBACK));
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

describe('formatCouponDateRange', () => {
  test('시작과 끝을 ~로 잇는다', () => {
    const range = formatCouponDateRange('2026-08-18T09:00:00', '2027-08-18T23:59:59', 'ko');
    expect(range).toMatch(/2026.*~.*2027/);
  });

  test('weekday면 양 끝에 요일을 괄호로 붙인다', () => {
    const range = formatCouponDateRange(
      '2026-08-18T09:00:00',
      '2027-08-18T23:59:59',
      'ko',
      { weekday: true },
    );
    // 2026-08-18은 화요일, 2027-08-18은 수요일.
    expect(range).toContain('(화)');
    expect(range).toContain('(수)');
  });

  test('한쪽만 유효하면 그 값만 반환하고 ~를 붙이지 않는다', () => {
    expect(formatCouponDateRange('2026-08-18T09:00:00', null, 'ko')).not.toContain('~');
    expect(formatCouponDateRange(null, null, 'ko')).toBe('');
    expect(formatCouponDateRange('not-a-date', 'also-bad', 'ko')).toBe('');
  });
});

test('상태 필터 목록은 전체 + 서버 enum 3종', () => {
  expect(COUPON_STATUS_FILTERS).toEqual(['ALL', 'ISSUED', 'REDEEMED', 'EXPIRED']);
});
