import { extraPhotoCount, joinMeta, MAX_POST_PHOTOS } from '../photoCount';

describe('extraPhotoCount', () => {
  test.each([
    [undefined, 0],
    [null, 0],
    [Number.NaN, 0],
    [-3, 0],
    [0, 0],
    [1, 0],
    [2, 1],
    [4, 3],
    [MAX_POST_PHOTOS, 9],
  ])('imageCount %p leaves %p photos behind the thumbnail', (imageCount, expected) => {
    expect(extraPhotoCount(imageCount)).toBe(expected);
  });
});

describe('joinMeta', () => {
  test('joins only the parts that are present', () => {
    expect(joinMeta(['카페', '구지면'])).toBe('카페 · 구지면');
    expect(joinMeta([undefined, '구지면', null, '  '])).toBe('구지면');
    expect(joinMeta([undefined, null, ''])).toBe('');
  });
});
