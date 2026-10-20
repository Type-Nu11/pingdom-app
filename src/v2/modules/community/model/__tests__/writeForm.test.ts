import {
  PLACE_CATEGORY_ID,
  WRITE_CONTENT_MAX_LENGTH,
  WRITE_TITLE_MAX_LENGTH,
  isPlaceCategory,
  isWriteFormValid,
  validateWriteForm,
  type WritePlaceTag,
} from '../writeForm';

const placeTag: WritePlaceTag = { address: '서울', category: '카페', id: 1, name: '대소고' };

function input(overrides: Partial<Parameters<typeof validateWriteForm>[0]> = {}) {
  return {
    categoryId: 'TRAVEL',
    content: '내용입니다',
    placeTags: [],
    title: '제목입니다',
    ...overrides,
  };
}

describe('isPlaceCategory', () => {
  test('PLACE 카테고리만 true를 반환한다', () => {
    expect(isPlaceCategory(PLACE_CATEGORY_ID)).toBe(true);
    expect(isPlaceCategory('TRAVEL')).toBe(false);
    expect(isPlaceCategory(null)).toBe(false);
  });
});

describe('validateWriteForm', () => {
  test('일반 카테고리는 장소 없이도 유효하다', () => {
    expect(validateWriteForm(input())).toEqual({});
    expect(isWriteFormValid(input())).toBe(true);
  });

  test('카테고리 미선택은 categoryId 오류를 반환한다', () => {
    expect(validateWriteForm(input({ categoryId: null }))).toEqual({ categoryId: 'categoryRequired' });
  });

  test('제목이 공백뿐이면 titleRequired를 반환한다', () => {
    expect(validateWriteForm(input({ title: '   ' }))).toEqual({ title: 'titleRequired' });
  });

  test('제목이 50자를 초과하면 titleTooLong을 반환한다', () => {
    const title = 'a'.repeat(WRITE_TITLE_MAX_LENGTH + 1);
    expect(validateWriteForm(input({ title }))).toEqual({ title: 'titleTooLong' });
  });

  test('제목이 정확히 50자면 유효하다', () => {
    const title = 'a'.repeat(WRITE_TITLE_MAX_LENGTH);
    expect(validateWriteForm(input({ title }))).toEqual({});
  });

  test('본문이 공백뿐이면 contentRequired를 반환한다', () => {
    expect(validateWriteForm(input({ content: '  ' }))).toEqual({ content: 'contentRequired' });
  });

  test('본문이 5000자를 초과하면 contentTooLong을 반환한다', () => {
    const content = 'a'.repeat(WRITE_CONTENT_MAX_LENGTH + 1);
    expect(validateWriteForm(input({ content }))).toEqual({ content: 'contentTooLong' });
  });

  test('PLACE 카테고리는 장소가 없으면 placeIds 오류를 반환한다', () => {
    expect(validateWriteForm(input({ categoryId: PLACE_CATEGORY_ID }))).toEqual({ placeIds: 'placeRequired' });
  });

  test('PLACE 카테고리에 장소가 있으면 유효하다', () => {
    expect(validateWriteForm(input({ categoryId: PLACE_CATEGORY_ID, placeTags: [placeTag] }))).toEqual({});
  });

  test('일반 카테고리로 전환하면 이미 선택된 장소가 있어도 오류가 아니다', () => {
    expect(validateWriteForm(input({ categoryId: 'TRAVEL', placeTags: [placeTag] }))).toEqual({});
  });

  test('여러 필드가 동시에 잘못되면 모두 반환한다', () => {
    expect(validateWriteForm({ categoryId: PLACE_CATEGORY_ID, content: '', placeTags: [], title: '' })).toEqual({
      content: 'contentRequired',
      placeIds: 'placeRequired',
      title: 'titleRequired',
    });
  });
});
