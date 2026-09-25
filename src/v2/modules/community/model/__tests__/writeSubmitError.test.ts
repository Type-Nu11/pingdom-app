import { ApiError } from '../../../../shared/api';
import { communityWriteErrorKind, communityWriteServerFieldErrors } from '../writeSubmitError';

describe('communityWriteServerFieldErrors', () => {
  test('알려진 필드만 매핑한다', () => {
    const error = new ApiError('검증 실패', {
      code: 'VALIDATION_FAILED',
      fieldErrors: [
        { field: 'title', reason: '제목을 입력해 주세요.' },
        { field: 'placeIds', reason: '장소를 1개 이상 선택해 주세요.' },
        { field: 'unknownField', reason: '알 수 없는 필드' },
      ],
      status: 400,
    });

    expect(communityWriteServerFieldErrors(error)).toEqual({
      placeIds: '장소를 1개 이상 선택해 주세요.',
      title: '제목을 입력해 주세요.',
    });
  });

  test('fieldErrors가 없으면 빈 객체를 반환한다', () => {
    const error = new ApiError('실패', { status: 500 });
    expect(communityWriteServerFieldErrors(error)).toEqual({});
  });

  test('필드 오류가 하나뿐이어도 매핑한다', () => {
    const error = new ApiError('검증 실패', {
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ field: 'content', reason: '내용을 입력해 주세요.' }],
      status: 400,
    });

    expect(communityWriteServerFieldErrors(error)).toEqual({ content: '내용을 입력해 주세요.' });
  });
});

describe('communityWriteErrorKind', () => {
  test('404를 notFound로 분류한다', () => {
    expect(communityWriteErrorKind(new ApiError('없음', { status: 404 }))).toBe('notFound');
  });

  test('401을 authentication으로 분류한다', () => {
    expect(communityWriteErrorKind(new ApiError('만료', { status: 401 }))).toBe('authentication');
  });
});
