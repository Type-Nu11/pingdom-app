import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { ApiError } from '../../../shared/api';
import { communityApi, type CommunityLikeStatus, type CommunityPostDetail } from '..';
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

function likeStatus(overrides: Partial<CommunityLikeStatus> = {}): CommunityLikeStatus {
  return { likeCount: 8, liked: false, postId: 1, ...overrides };
}

async function renderDetail(props: Partial<React.ComponentProps<typeof CommunityDetailScreen>> = {}) {
  return renderWithProviders(
    <CommunityDetailScreen onBack={jest.fn()} onSignIn={jest.fn()} postId={1} {...props} />,
    { language: 'ko' },
  );
}

describe('CommunityDetailScreen 좋아요', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    jest.spyOn(communityApi, 'listComments').mockResolvedValue({
      comments: [], hasNext: false, limit: 20, page: 1, totalCount: 0, totalPages: 0,
    });
  });

  test('조회 중에는 스켈레톤을 보여준다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus').mockImplementation(() => new Promise(() => {}));

    await renderDetail();

    await waitFor(() => expect(screen.getByTestId('v2-community-like-loading')).toBeVisible());
  });

  test('좋아요 수와 상태를 표시한다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue(likeStatus());

    await renderDetail();

    await waitFor(() => expect(screen.getByText('좋아요 8')).toBeVisible());
    expect(screen.getByTestId('v2-community-like-button').props.accessibilityState).toMatchObject({ selected: false });
  });

  test('좋아요를 누르면 즉시 활성 상태로 바뀌고 서버 응답으로 확정된다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue(likeStatus());
    const likePost = jest.spyOn(communityApi, 'likePost').mockResolvedValue(likeStatus({ likeCount: 9, liked: true }));

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByText('좋아요 8')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-like-button'));

    await waitFor(() => expect(screen.getByText('좋아요 9')).toBeVisible());
    expect(likePost).toHaveBeenCalledWith(1);
    expect(screen.getByTestId('v2-community-like-button').props.accessibilityState).toMatchObject({ selected: true });
  });

  test('연타해도 요청은 한 번만 보내고, 처리 중에는 버튼이 busy 상태다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue(likeStatus());
    let resolveLike: (value: CommunityLikeStatus) => void = () => {};
    const likePost = jest.spyOn(communityApi, 'likePost').mockImplementation(
      () => new Promise((resolve) => { resolveLike = resolve; }),
    );

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByText('좋아요 8')).toBeVisible());
    const button = screen.getByTestId('v2-community-like-button');

    await user.press(button);
    await user.press(button);
    await user.press(button);

    await waitFor(() => expect(button.props.accessibilityState).toMatchObject({ busy: true }));
    expect(likePost).toHaveBeenCalledTimes(1);

    resolveLike(likeStatus({ likeCount: 9, liked: true }));
    await waitFor(() => expect(screen.getByText('좋아요 9')).toBeVisible());
    expect(likePost).toHaveBeenCalledTimes(1);
  });

  test('네트워크 오류 시 이전 상태로 롤백하고 재시도할 수 있다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus')
      .mockResolvedValueOnce(likeStatus())
      .mockResolvedValueOnce(likeStatus());
    const likePost = jest.spyOn(communityApi, 'likePost')
      .mockRejectedValueOnce(new ApiError('네트워크 실패', { isNetworkError: true }))
      .mockResolvedValueOnce(likeStatus({ likeCount: 9, liked: true }));

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByText('좋아요 8')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-like-button'));

    // Rolled back: the count/label go back to the pre-tap value.
    await waitFor(() => expect(screen.getByTestId('v2-community-like-retry')).toBeVisible());
    expect(screen.getByText('좋아요 8')).toBeVisible();

    await user.press(screen.getByTestId('v2-community-like-retry'));

    await waitFor(() => expect(screen.getByText('좋아요 9')).toBeVisible());
    expect(likePost).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId('v2-community-like-retry')).toBeNull();
  });

  test('네트워크 오류 재시도 시 서버에 이미 반영돼 있으면 다시 보내지 않는다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus')
      .mockResolvedValueOnce(likeStatus())
      .mockResolvedValueOnce(likeStatus({ likeCount: 9, liked: true }));
    const likePost = jest.spyOn(communityApi, 'likePost')
      .mockRejectedValueOnce(new ApiError('네트워크 실패', { isNetworkError: true }));

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByText('좋아요 8')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-like-button'));
    await waitFor(() => expect(screen.getByTestId('v2-community-like-retry')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-like-retry'));

    await waitFor(() => expect(screen.getByText('좋아요 9')).toBeVisible());
    expect(likePost).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('v2-community-like-retry')).toBeNull();
  });

  test('401 오류는 로그인 유도를 보여준다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue(likeStatus());
    jest.spyOn(communityApi, 'likePost').mockRejectedValue(new ApiError('만료', { status: 401 }));
    const onSignIn = jest.fn();

    const { user } = await renderDetail({ onSignIn });
    await waitFor(() => expect(screen.getByText('좋아요 8')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-like-button'));

    await waitFor(() => expect(screen.getByTestId('v2-community-like-sign-in')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-like-sign-in'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
    // Rolled back, not left in the optimistic liked state.
    expect(screen.getByText('좋아요 8')).toBeVisible();
  });

  test('403 오류는 권한 안내만 보여주고 재시도 버튼은 없다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue(likeStatus());
    jest.spyOn(communityApi, 'likePost').mockRejectedValue(new ApiError('권한 없음', { status: 403 }));

    const { user } = await renderDetail();
    await waitFor(() => expect(screen.getByText('좋아요 8')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-like-button'));

    await waitFor(() => expect(screen.getByText('이 계정에는 해당 작업을 수행할 권한이 없습니다.')).toBeVisible());
    expect(screen.queryByTestId('v2-community-like-retry')).toBeNull();
    expect(screen.queryByTestId('v2-community-like-sign-in')).toBeNull();
  });

  test('좋아요 조회 자체가 401이면 비활성 상태로 표시하고 탭하면 로그인을 유도한다', async () => {
    jest.spyOn(communityApi, 'getLikeStatus').mockRejectedValue(new ApiError('만료', { status: 401 }));
    const onSignIn = jest.fn();

    const { user } = await renderDetail({ onSignIn });
    await waitFor(() => expect(screen.getByTestId('v2-community-like-button')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-like-button'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});
