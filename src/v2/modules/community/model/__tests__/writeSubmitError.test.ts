import { ApiError } from '../../../../shared/api';
import {
  communityWriteBannerAction,
  communityWriteErrorKind,
  communityWriteHasUnmappedFieldError,
  communityWriteServerFieldErrors,
} from '../writeSubmitError';

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

describe('communityWriteHasUnmappedFieldError', () => {
  test('필드 없이 순수 400 ErrorResponse면 매핑되지 않은 오류로 본다', () => {
    expect(communityWriteHasUnmappedFieldError(new ApiError('실패', { status: 400 }))).toBe(true);
  });

  test('모두 알려진 필드로 매핑되면 false를 반환한다', () => {
    const error = new ApiError('검증 실패', {
      fieldErrors: [{ field: 'title', reason: '제목을 입력해 주세요.' }],
      status: 400,
    });
    expect(communityWriteHasUnmappedFieldError(error)).toBe(false);
  });

  test('알 수 없는 필드가 섞여 있으면 true를 반환한다', () => {
    const error = new ApiError('검증 실패', {
      fieldErrors: [
        { field: 'title', reason: '제목을 입력해 주세요.' },
        { field: 'unknownField', reason: '알 수 없는 필드' },
      ],
      status: 400,
    });
    expect(communityWriteHasUnmappedFieldError(error)).toBe(true);
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

describe('communityWriteBannerAction', () => {
  test('404는 목록으로 돌아가지 않고 none을 반환한다', () => {
    expect(communityWriteBannerAction(new ApiError('없음', { status: 404 }))).toBe('none');
  });

  test('401은 signIn을 반환한다', () => {
    expect(communityWriteBannerAction(new ApiError('만료', { status: 401 }))).toBe('signIn');
  });

  test('네트워크 오류와 5xx는 retry를 반환한다', () => {
    expect(communityWriteBannerAction(new ApiError('네트워크 실패', { isNetworkError: true }))).toBe('retry');
    expect(communityWriteBannerAction(new ApiError('서버 오류', { status: 500 }))).toBe('retry');
  });

  test('403은 none을 반환한다', () => {
    expect(communityWriteBannerAction(new ApiError('권한 없음', { status: 403 }))).toBe('none');
  });

  test('필드 정보 없는 400은 다른 수단이 없으므로 retry를 반환한다', () => {
    expect(communityWriteBannerAction(new ApiError('검증 실패', { status: 400 }))).toBe('retry');
  });
});
