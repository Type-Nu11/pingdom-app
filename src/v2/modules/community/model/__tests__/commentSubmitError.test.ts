import { ApiError } from '../../../../shared/api';
import {
  communityCommentBannerAction,
  communityCommentErrorKind,
  communityCommentFieldError,
} from '../commentSubmitError';

describe('communityCommentFieldError', () => {
  test('content 필드 오류만 매핑한다', () => {
    const error = new ApiError('검증 실패', {
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ field: 'content', reason: '내용을 입력해 주세요.' }],
      status: 400,
    });
    expect(communityCommentFieldError(error)).toBe('내용을 입력해 주세요.');
  });

  test('알 수 없는 필드는 무시한다', () => {
    const error = new ApiError('검증 실패', {
      fieldErrors: [{ field: 'unknownField', reason: '알 수 없는 필드' }],
      status: 400,
    });
    expect(communityCommentFieldError(error)).toBeUndefined();
  });

  test('fieldErrors가 없으면 undefined를 반환한다', () => {
    expect(communityCommentFieldError(new ApiError('실패', { status: 500 }))).toBeUndefined();
  });
});

describe('communityCommentErrorKind', () => {
  test('404를 notFound로 분류한다', () => {
    expect(communityCommentErrorKind(new ApiError('없음', { status: 404 }))).toBe('notFound');
  });

  test('401을 authentication으로 분류한다', () => {
    expect(communityCommentErrorKind(new ApiError('만료', { status: 401 }))).toBe('authentication');
  });

  test('403을 authorization으로 분류한다', () => {
    expect(communityCommentErrorKind(new ApiError('권한 없음', { status: 403 }))).toBe('authorization');
  });
});

describe('communityCommentBannerAction', () => {
  test('401은 signIn을 반환한다', () => {
    expect(communityCommentBannerAction(new ApiError('만료', { status: 401 }))).toBe('signIn');
  });

  test('403은 none을 반환한다', () => {
    expect(communityCommentBannerAction(new ApiError('권한 없음', { status: 403 }))).toBe('none');
  });

  test('404는 none을 반환한다 (상세 화면 안내 문구로 처리)', () => {
    expect(communityCommentBannerAction(new ApiError('없음', { status: 404 }))).toBe('none');
  });

  test('네트워크 오류와 5xx는 retry를 반환한다', () => {
    expect(communityCommentBannerAction(new ApiError('네트워크 실패', { isNetworkError: true }))).toBe('retry');
    expect(communityCommentBannerAction(new ApiError('서버 오류', { status: 500 }))).toBe('retry');
  });

  test('content 필드 오류가 있는 400은 인라인 표시로 처리하므로 none을 반환한다', () => {
    const error = new ApiError('검증 실패', {
      fieldErrors: [{ field: 'content', reason: '내용을 입력해 주세요.' }],
      status: 400,
    });
    expect(communityCommentBannerAction(error)).toBe('none');
  });

  test('필드 정보 없는 400은 배너에서 재시도를 제공한다', () => {
    expect(communityCommentBannerAction(new ApiError('검증 실패', { status: 400 }))).toBe('retry');
  });
});
