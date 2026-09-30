import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { ApiError } from '../../../shared/api';
import { communityApi, type CommunityPostDetail } from '..';
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

describe('CommunityDetailScreen', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    // The like row (#342) is out of scope for these cases — give it a settled
    // resolved status so it doesn't render its own error/retry UI here.
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue({ likeCount: 0, liked: false, postId: 1 });
  });

  test('작성자·작성 시각·카테고리를 제목 위에 보여준다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      author: { authorId: 3, authorName: 'woo_sm' },
      category: { categoryId: 'PLACE', categoryName: '스팟' },
      createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    }));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    await waitFor(() => expect(screen.getByTestId('v2-community-detail-author')).toBeVisible());
    expect(screen.getByText('woo_sm')).toBeVisible();
    expect(screen.getByText('12분 전')).toBeVisible();
    expect(screen.getByTestId('v2-community-detail-category')).toHaveTextContent('스팟');
    expect(screen.queryByTestId('v2-community-detail-author-image')).toBeNull();
  });

  test('프로필 이미지가 있으면 보여주고 불러오지 못하면 기본 아바타로 바꾼다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      author: { authorId: 3, authorName: 'woo_sm', profileImageUrl: 'https://example.com/a.png' },
    }));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    const image = await screen.findByTestId('v2-community-detail-author-image');
    fireEvent(image, 'error');
    await waitFor(() => expect(screen.queryByTestId('v2-community-detail-author-image')).toBeNull());
  });

  test('작성자·카테고리가 없는 이전 응답도 제목부터 보여준다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    await waitFor(() => expect(screen.getByText('대소고 다녀왔어요')).toBeVisible());
    expect(screen.queryByTestId('v2-community-detail-author')).toBeNull();
    expect(screen.queryByTestId('v2-community-detail-category')).toBeNull();
  });

  test('불러오는 동안 로딩 상태를 보여준다', async () => {
    jest.spyOn(communityApi, 'getPost').mockImplementation(() => new Promise(() => {}));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    await waitFor(() => expect(screen.getByTestId('v2-community-detail-loading')).toBeVisible());
  });

  test('게시글 제목과 본문을 작성자가 넣은 빈 줄까지 그대로 표시한다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      content: '첫 문단입니다.\n\n두번째 문단입니다.',
    }));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    await waitFor(() => expect(screen.getByText('대소고 다녀왔어요')).toBeVisible());
    expect(screen.getByTestId('v2-community-detail-body').props.children).toBe('첫 문단입니다.\n\n두번째 문단입니다.');
  });

  test('삭제된 연결 장소는 안내 문구만 보여주고 이동할 수 없다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      places: [{ deleted: true, placeId: 17, placeName: '삭제된 장소입니다' }],
    }));
    const onOpenPlace = jest.fn();
    const recordPlaceView = jest.spyOn(communityApi, 'recordPlaceView');

    const { user } = await renderWithProviders(
      <CommunityDetailScreen onBack={jest.fn()} onOpenPlace={onOpenPlace} postId={1} />,
      { language: 'ko' },
    );

    await waitFor(() => expect(screen.getByText('삭제된 장소입니다')).toBeVisible());
    const row = screen.getByLabelText('삭제된 장소입니다');
    expect(row.props.accessibilityState).toMatchObject({ disabled: true });

    await user.press(row);
    expect(recordPlaceView).not.toHaveBeenCalled();
    expect(onOpenPlace).not.toHaveBeenCalled();
  });

  // The full view-endpoint → cache-seed → navigation flow (including busy
  // state, dedup, and error handling) is covered in
  // CommunityDetailScreen.places.test.tsx.

  test('찾을 수 없는 게시글은 오류와 뒤로가기를 보여준다', async () => {
    jest.spyOn(communityApi, 'getPost').mockRejectedValue(
      new ApiError('not found', { status: 404, code: 'POST_NOT_FOUND' }),
    );
    const onBack = jest.fn();

    const { user } = await renderWithProviders(
      <CommunityDetailScreen onBack={onBack} postId={999} />,
      { language: 'ko' },
    );

    await waitFor(() => expect(screen.getByText('항목을 찾을 수 없습니다')).toBeVisible());
    await user.press(screen.getByText('목록으로'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('일반 오류는 재시도로 다시 조회한다', async () => {
    const getPost = jest.spyOn(communityApi, 'getPost')
      .mockRejectedValueOnce(new ApiError('실패', { status: 500 }))
      .mockResolvedValueOnce(detail());

    const { user } = await renderWithProviders(
      <CommunityDetailScreen onBack={jest.fn()} postId={1} />,
      { language: 'ko' },
    );

    await waitFor(() => expect(screen.getByText('다시 시도')).toBeVisible());
    await user.press(screen.getByText('다시 시도'));

    await waitFor(() => expect(screen.getByText('대소고 다녀왔어요')).toBeVisible());
    expect(getPost).toHaveBeenCalledTimes(2);
  });
});
