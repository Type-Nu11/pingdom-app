import { getVerifiedPlaceGridCardWidth } from '../verifiedPlaceLayout';

describe('getVerifiedPlaceGridCardWidth', () => {
  test.each([[240, 90], [280, 110], [320, 130], [375, 157.5], [402, 171], [414, 177], [768, 354], [375.5, 157.75]])(
    '%s 가용 폭을 같은 두 열로 나눈다', (width, expected) => {
      const cardWidth = getVerifiedPlaceGridCardWidth(width);
      expect(cardWidth).toBe(expected);
      expect(cardWidth! * 2 + 12 + 48).toBeLessThanOrEqual(width);
      expect(cardWidth).toBeGreaterThan(0);
    },
  );
  test.each([NaN, Infinity, -Infinity, -1, 0, 48, 60, 61])('%s는 렌더링 가능한 측정값이 아니다', (width) => {
    expect(getVerifiedPlaceGridCardWidth(width)).toBeNull();
  });
  test('최소 양수 폭 경계', () => {
    expect(getVerifiedPlaceGridCardWidth(62)).toBe(1);
  });
});
