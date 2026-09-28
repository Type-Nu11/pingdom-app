import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { ApiError } from '../../../shared/api';
import { communityApi, type CommunityCommentPage, type CommunityPostDetail } from '..';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';

function detail(overrides: Partial<CommunityPostDetail> = {}): CommunityPostDetail {
  return {
    content: '즐거운 경험이었습니다.',
    places: [],
    postId: 1,
    title: '대소고 다녀왔어요',
    ...overrides,
  };
}

function commentPage(overrides: Partial<CommunityCommentPage> = {}): CommunityCommentPage {
  return {
    comments: [],
    hasNext: false,
    limit: 20,
    page: 1,
    totalCount: 0,
    totalPages: 0,
    ...overrides,
  };
}

async function renderDetail(props: Partial<React.ComponentProps<typeof CommunityDetailScreen>> = {}) {
  return renderWithProviders(
    <CommunityDetailScreen onBack={jest.fn()} onSignIn={jest.fn()} postId={1} {...props} />,
    { language: 'ko' },
  );
}

describe('CommunityDetailScreen 댓글', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    // The like row (#342) is out of scope for these cases — give it a settled
    // resolved status so it doesn't render its own error/retry UI here.
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue({ likeCount: 0, liked: false, postId: 1 });
  });

  test('댓글을 불러오는 동안 스켈레톤을 보여준다', async () => {
    jest.spyOn(communityApi, 'listComments').mockImplementation(() => new Promise(() => {}));

    await renderDetail();

    await waitFor(() => expect(screen.getByTestId('v2-community-comments-loading')).toBeVisible());
  });

  test('댓글이 없으면 빈 상태 문구를 보여준다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());

    await renderDetail();

    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());
    expect(screen.queryByTestId('v2-community-comments-loading')).toBeNull();
  });

  test('댓글 조회 실패는 빈 상태와 다른 오류 UI로 표시되고 재시도할 수 있다', async () => {
    const listComments = jest.spyOn(communityApi, 'listComments')
      .mockRejectedValueOnce(new ApiError('실패', { status: 500 }))
      .mockResolvedValueOnce(commentPage({
        comments: [{ authorId: 1, authorName: '핑덤', commentId: 1, content: '댓글', createdAt: new Date().toISOString() }],
        totalCount: 1,
        totalPages: 1,
      }));

    const { user } = await renderDetail();

    await waitFor(() => expect(screen.getByText('다시 시도')).toBeVisible());
    expect(screen.queryByTestId('v2-community-comments-empty')).toBeNull();

    await user.press(screen.getByText('다시 시도'));

    await waitFor(() => expect(screen.getByTestId('v2-community-comment-1')).toBeVisible());
    expect(listComments).toHaveBeenCalledTimes(2);
  });

  test('hasNext가 false면 더 보기 버튼을 보여주지 않는다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage({
      comments: [{ authorId: 1, authorName: '핑덤', commentId: 1, content: '유일한 댓글', createdAt: new Date().toISOString() }],
      hasNext: false,
      totalCount: 1,
      totalPages: 1,
    }));

    await renderDetail();

    await waitFor(() => expect(screen.getByText('유일한 댓글')).toBeVisible());
    expect(screen.queryByTestId('v2-community-comments-load-more')).toBeNull();
  });

  test('더 보기를 눌렀을 때만 다음 페이지를 조회하고, 끝에 닿아도 자동으로 요청하지 않는다', async () => {
    const listComments = jest.spyOn(communityApi, 'listComments')
      .mockResolvedValueOnce(commentPage({
        comments: [{ authorId: 1, authorName: '핑덤', commentId: 1, content: '첫 댓글', createdAt: new Date().toISOString() }],
        hasNext: true,
        totalCount: 2,
        totalPages: 2,
      }))
      .mockResolvedValueOnce(commentPage({
        comments: [{ authorId: 2, authorName: '커피러버', commentId: 2, content: '두번째 댓글', createdAt: new Date().toISOString() }],
        hasNext: false,
        page: 2,
        totalCount: 2,
        totalPages: 2,
      }));

    const { user } = await renderDetail();

    await waitFor(() => expect(screen.getByTestId('v2-community-comments-load-more')).toBeVisible());
    expect(listComments).toHaveBeenCalledTimes(1);

    await user.press(screen.getByTestId('v2-community-comments-load-more'));

    await waitFor(() => expect(screen.getByText('두번째 댓글')).toBeVisible());
    expect(listComments).toHaveBeenCalledTimes(2);
    expect(listComments).toHaveBeenLastCalledWith(1, { page: 2 }, expect.anything());
    expect(screen.queryByTestId('v2-community-comments-load-more')).toBeNull();
  });

  test('다음 페이지 조회 실패는 인라인 재시도를 보여주고 기존 댓글은 유지한다', async () => {
    const listComments = jest.spyOn(communityApi, 'listComments')
      .mockResolvedValueOnce(commentPage({
        comments: [{ authorId: 1, authorName: '핑덤', commentId: 1, content: '첫 댓글', createdAt: new Date().toISOString() }],
        hasNext: true,
        totalCount: 2,
        totalPages: 2,
      }))
      .mockRejectedValueOnce(new ApiError('실패', { status: 500 }));

    const { user } = await renderDetail();

    await waitFor(() => expect(screen.getByTestId('v2-community-comments-load-more')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-comments-load-more'));

    await waitFor(() => expect(screen.getByTestId('v2-community-comments-next-error')).toBeVisible());
    expect(screen.getByText('첫 댓글')).toBeVisible();
    expect(listComments).toHaveBeenCalledTimes(2);

    // Reaching the end again (or re-pressing load more) must not silently
    // retry — only the explicit inline retry button does.
    expect(screen.queryByTestId('v2-community-comments-load-more')).toBeNull();
  });

  test('게시글이 로드된 뒤 댓글 조회가 404면 상세 전체의 not-found 흐름과 동일하게 표시된다', async () => {
    jest.spyOn(communityApi, 'listComments').mockRejectedValue(
      new ApiError('게시글을 찾을 수 없습니다', { code: 'POST_NOT_FOUND', status: 404 }),
    );
    const onBack = jest.fn();

    const { user } = await renderDetail({ onBack });

    await waitFor(() => expect(screen.getByText('항목을 찾을 수 없습니다')).toBeVisible());
    await user.press(screen.getByText('목록으로'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('댓글을 등록하면 입력을 비우고 목록을 갱신한다', async () => {
    jest.spyOn(communityApi, 'listComments')
      .mockResolvedValueOnce(commentPage())
      .mockResolvedValueOnce(commentPage({
        comments: [{ authorId: 9, authorName: 'woo_sm', commentId: 500, content: '새 댓글입니다', createdAt: new Date().toISOString() }],
        totalCount: 1,
        totalPages: 1,
      }));
    const createComment = jest.spyOn(communityApi, 'createComment').mockResolvedValue({
      commentId: 500,
      content: '새 댓글입니다',
      postId: 1,
    });

    const { user } = await renderDetail();

    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    const input = screen.getByTestId('v2-community-comment-input');
    await user.type(input, '새 댓글입니다');
    await user.press(screen.getByTestId('v2-community-comment-send'));

    await waitFor(() => expect(createComment).toHaveBeenCalledWith(1, { content: '새 댓글입니다' }));
    await waitFor(() => expect(input.props.value).toBe(''));
    await waitFor(() => expect(screen.getByText('새 댓글입니다')).toBeVisible());
  });

  test('연타해도 등록 요청은 한 번만 보내고, 진행 중에는 전송 버튼이 비활성화된다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());
    let resolveCreate: (value: { commentId: number; content: string; postId: number }) => void = () => {};
    const createComment = jest.spyOn(communityApi, 'createComment').mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; }),
    );

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    const input = screen.getByTestId('v2-community-comment-input');
    await user.type(input, '연타 테스트');
    const sendButton = screen.getByTestId('v2-community-comment-send');

    await user.press(sendButton);
    await user.press(sendButton);
    await user.press(sendButton);

    await waitFor(() => expect(sendButton.props.accessibilityState).toMatchObject({ busy: true }));
    expect(createComment).toHaveBeenCalledTimes(1);

    resolveCreate({ commentId: 1, content: '연타 테스트', postId: 1 });
    await waitFor(() => expect(input.props.value).toBe(''));
    expect(createComment).toHaveBeenCalledTimes(1);
  });

  test('빈 내용으로 등록을 시도하면 요청 없이 검증 오류를 보여준다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());
    const createComment = jest.spyOn(communityApi, 'createComment');

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-comment-send'));

    expect(createComment).not.toHaveBeenCalled();
  });

  test('400 content 필드 오류는 입력 아래에 표시된다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());
    jest.spyOn(communityApi, 'createComment').mockRejectedValue(new ApiError('검증 실패', {
      code: 'VALIDATION_FAILED',
      fieldErrors: [{ field: 'content', reason: '댓글 내용을 확인해 주세요.' }],
      status: 400,
    }));

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    await user.type(screen.getByTestId('v2-community-comment-input'), '문제 있는 댓글');
    await user.press(screen.getByTestId('v2-community-comment-send'));

    await waitFor(() => expect(screen.getByTestId('v2-community-comment-input-error')).toHaveTextContent('입력한 정보를 확인한 후 다시 시도해 주세요.'));
    expect(screen.queryByTestId('v2-community-comment-error-banner')).toBeNull();
    // The failed content is kept so the user doesn't have to retype it.
    expect(screen.getByTestId('v2-community-comment-input').props.value).toBe('문제 있는 댓글');
  });

  test('401 오류는 로그인 유도 배너를 보여준다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());
    jest.spyOn(communityApi, 'createComment').mockRejectedValue(new ApiError('만료', { status: 401 }));
    const onSignIn = jest.fn();

    const { user } = await renderDetail({ onSignIn });
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    await user.type(screen.getByTestId('v2-community-comment-input'), '로그인 필요');
    await user.press(screen.getByTestId('v2-community-comment-send'));

    await waitFor(() => expect(screen.getByTestId('v2-community-comment-error-banner')).toBeVisible());
    await user.press(screen.getByText('다시 로그인'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  test('403 오류는 권한 안내 배너를 보여준다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());
    jest.spyOn(communityApi, 'createComment').mockRejectedValue(new ApiError('권한 없음', { status: 403 }));

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    await user.type(screen.getByTestId('v2-community-comment-input'), '권한 없음 테스트');
    await user.press(screen.getByTestId('v2-community-comment-send'));

    await waitFor(() => expect(screen.getByTestId('v2-community-comment-error-banner')).toBeVisible());
    expect(screen.queryByTestId('v2-community-comment-error-retry')).toBeNull();
  });

  test('작성 시점의 404 오류는 게시글 없음 안내를 보여준다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());
    jest.spyOn(communityApi, 'createComment').mockRejectedValue(
      new ApiError('없음', { code: 'POST_NOT_FOUND', status: 404 }),
    );

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    await user.type(screen.getByTestId('v2-community-comment-input'), '삭제된 게시글에 댓글');
    await user.press(screen.getByTestId('v2-community-comment-send'));

    await waitFor(() => expect(screen.getByText('게시글을 찾을 수 없어요. 삭제되었을 수 있어요.')).toBeVisible());
  });

  test('네트워크 오류 재시도 시 이미 등록된 댓글이 있으면 다시 전송하지 않는다', async () => {
    const listComments = jest.spyOn(communityApi, 'listComments')
      .mockResolvedValueOnce(commentPage())
      .mockResolvedValueOnce(commentPage({
        comments: [{ authorId: 9, authorName: 'woo_sm', commentId: 700, content: '중복 확인 댓글', createdAt: new Date().toISOString() }],
        totalCount: 1,
        totalPages: 1,
      }));
    const createComment = jest.spyOn(communityApi, 'createComment').mockRejectedValue(
      new ApiError('네트워크 실패', { isNetworkError: true }),
    );

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    await user.type(screen.getByTestId('v2-community-comment-input'), '중복 확인 댓글');
    await user.press(screen.getByTestId('v2-community-comment-send'));
    await waitFor(() => expect(screen.getByTestId('v2-community-comment-error-banner')).toBeVisible());
    expect(createComment).toHaveBeenCalledTimes(1);

    await user.press(screen.getByTestId('v2-community-comment-error-retry'));

    await waitFor(() => expect(screen.getByTestId('v2-community-comment-input').props.value).toBe(''));
    expect(listComments).toHaveBeenCalledTimes(2);
    // The refetch already found the comment, so no second POST is sent.
    expect(createComment).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('v2-community-comment-error-banner')).toBeNull();
  });

  test('네트워크 오류 재시도 시 등록된 댓글이 없으면 다시 전송한다', async () => {
    const listComments = jest.spyOn(communityApi, 'listComments')
      // 1) initial load, 2) dedupe-check refetch before retrying (still empty),
      // 3) cache invalidation after the resubmit succeeds.
      .mockResolvedValueOnce(commentPage())
      .mockResolvedValueOnce(commentPage())
      .mockResolvedValueOnce(commentPage({
        comments: [{ authorId: 9, authorName: 'woo_sm', commentId: 800, content: '재전송 댓글', createdAt: new Date().toISOString() }],
        totalCount: 1,
        totalPages: 1,
      }));
    const createComment = jest.spyOn(communityApi, 'createComment')
      .mockRejectedValueOnce(new ApiError('네트워크 실패', { isNetworkError: true }))
      .mockResolvedValueOnce({ commentId: 800, content: '재전송 댓글', postId: 1 });

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    await user.type(screen.getByTestId('v2-community-comment-input'), '재전송 댓글');
    await user.press(screen.getByTestId('v2-community-comment-send'));
    await waitFor(() => expect(screen.getByTestId('v2-community-comment-error-banner')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-comment-error-retry'));

    await waitFor(() => expect(createComment).toHaveBeenCalledTimes(2));
    expect(createComment).toHaveBeenLastCalledWith(1, { content: '재전송 댓글' });
    await waitFor(() => expect(listComments).toHaveBeenCalledTimes(3));
  });

  test('900자 이상 입력하면 글자 수 카운터를 보여준다', async () => {
    jest.spyOn(communityApi, 'listComments').mockResolvedValue(commentPage());

    await renderDetail();
    await waitFor(() => expect(screen.getByTestId('v2-community-comments-empty')).toBeVisible());

    const input = screen.getByTestId('v2-community-comment-input');
    expect(screen.queryByTestId('v2-community-comment-counter')).toBeNull();

    fireEvent.changeText(input, 'a'.repeat(900));

    await waitFor(() => expect(screen.getByTestId('v2-community-comment-counter')).toHaveTextContent('900/1000'));
  });
});
