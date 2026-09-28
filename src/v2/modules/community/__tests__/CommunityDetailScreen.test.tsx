import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

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

  test('불러오는 동안 로딩 상태를 보여준다', async () => {
    jest.spyOn(communityApi, 'getPost').mockImplementation(() => new Promise(() => {}));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    await waitFor(() => expect(screen.getByTestId('v2-community-detail-loading')).toBeVisible());
  });

  test('게시글 제목과 본문을 문단으로 표시한다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      content: '첫 문단입니다.\n두번째 문단입니다.',
    }));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    await waitFor(() => expect(screen.getByText('대소고 다녀왔어요')).toBeVisible());
    expect(screen.getByText('첫 문단입니다.')).toBeVisible();
    expect(screen.getByText('두번째 문단입니다.')).toBeVisible();
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
