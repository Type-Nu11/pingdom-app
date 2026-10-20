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

  test('작성자 메타에 지역·작성 시각·조회수를 응답에 있는 것만 보여준다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      author: { authorId: 3, authorName: 'woo_sm' },
      createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
      region: '구지면',
      viewCount: 128,
    }));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    expect(await screen.findByTestId('v2-community-detail-author-meta')).toHaveTextContent('구지면 · 12분 전 · 조회 128');
  });

  test('지역과 조회수가 없으면 작성 시각만 보여주고 0으로 채우지 않는다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      author: { authorId: 3, authorName: 'woo_sm' },
      createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    }));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    expect(await screen.findByTestId('v2-community-detail-author-meta')).toHaveTextContent('12분 전');
  });

  test('연결 장소 카드에 썸네일·분류·지역을 응답 값으로 보여준다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      places: [
        {
          category: '카페',
          deleted: false,
          imageUrl: 'https://cdn.test/place.jpg',
          placeId: 17,
          placeName: '오아시스 팝업 스토어',
          region: '구지면',
        },
        { deleted: false, placeId: 18, placeName: '정보 없는 장소' },
        { deleted: true, placeName: '삭제된 장소예요' },
      ],
    }));

    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} onOpenPlace={jest.fn()} postId={1} />, { language: 'ko' });

    expect(await screen.findByTestId('v2-community-place-card-17-meta')).toHaveTextContent('카페 · 구지면');
    expect(screen.getByTestId('v2-community-place-card-17-thumbnail')).toHaveStyle({ height: 50, width: 50 });
    expect(screen.queryByTestId('v2-community-place-card-18-meta')).toBeNull();
    expect(screen.queryByTestId('v2-community-place-card-18-thumbnail')).toBeNull();
    expect(screen.getByText('삭제된 장소예요')).toBeTruthy();
  });

  test('게시글 사진이 있으면 본문 아래에 갤러리를 보여주고 없으면 숨긴다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      images: [
        { imageId: 1, imageUrl: 'https://cdn.test/1.jpg', position: 0 },
        { imageId: 2, imageUrl: 'https://cdn.test/2.jpg', position: 1 },
      ],
    }));

    const view = await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    expect(await screen.findByTestId('v2-community-detail-photo-1-count')).toHaveTextContent('2/2');
    view.unmount();

    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({ images: [] }));
    await renderWithProviders(<CommunityDetailScreen onBack={jest.fn()} postId={1} />, { language: 'ko' });

    await waitFor(() => expect(screen.getByText('대소고 다녀왔어요')).toBeVisible());
    expect(screen.queryByTestId('v2-community-detail-photos')).toBeNull();
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
