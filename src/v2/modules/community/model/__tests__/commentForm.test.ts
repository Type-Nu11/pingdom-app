import { COMMENT_CONTENT_MAX_LENGTH, validateCommentContent } from '../commentForm';

describe('validateCommentContent', () => {
  test('빈 문자열은 필수 오류를 반환한다', () => {
    expect(validateCommentContent('')).toBe('contentRequired');
  });

  test('공백만 있으면 필수 오류를 반환한다', () => {
    expect(validateCommentContent('   ')).toBe('contentRequired');
  });

  test(`${COMMENT_CONTENT_MAX_LENGTH}자를 초과하면 길이 오류를 반환한다`, () => {
    const content = 'a'.repeat(COMMENT_CONTENT_MAX_LENGTH + 1);
    expect(validateCommentContent(content)).toBe('contentTooLong');
  });

  test(`${COMMENT_CONTENT_MAX_LENGTH}자는 통과한다`, () => {
    const content = 'a'.repeat(COMMENT_CONTENT_MAX_LENGTH);
    expect(validateCommentContent(content)).toBeUndefined();
  });

  test('앞뒤 공백은 트림 후 검증한다', () => {
    expect(validateCommentContent('  안녕하세요  ')).toBeUndefined();
  });
});
