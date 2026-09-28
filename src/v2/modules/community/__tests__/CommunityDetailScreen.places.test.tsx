import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../app/testing/testProviders';
import { ApiError } from '../../../shared/api';
import { placeDetailApi, placeDetailQueryKeys, usePlaceDetail } from '../../place/detail';
import { communityApi, type CommunityPostDetail } from '..';
import type { RecordPlaceViewResponse } from '../api/communityApi';
import { placeViewFixture } from '../mock/fixtures';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';

function detail(overrides: Partial<CommunityPostDetail> = {}): CommunityPostDetail {
  return {
    content: '즐거운 경험이었습니다.',
    places: [{ deleted: false, placeId: 17, placeName: '대소고' }],
    postId: 1,
    title: '대소고 다녀왔어요',
    ...overrides,
  };
}

// Mounts usePlaceDetail against the same QueryClient the screen used, so a
// seeded cache entry can be proven fresh (no follow-up GET) the same way the
// production place-detail screen would consume it.
function PlaceDetailProbe({ placeId }: { placeId: number }) {
  usePlaceDetail(placeId);
  return null;
}

async function renderDetail(props: Partial<React.ComponentProps<typeof CommunityDetailScreen>> = {}) {
  return renderWithProviders(
    <CommunityDetailScreen onBack={jest.fn()} postId={1} {...props} />,
    { language: 'ko' },
  );
}

describe('CommunityDetailScreen 연결 장소 진입', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(communityApi, 'getLikeStatus').mockResolvedValue({ likeCount: 0, liked: false, postId: 1 });
    jest.spyOn(communityApi, 'listComments').mockResolvedValue({
      comments: [], hasNext: false, limit: 20, page: 1, totalCount: 0, totalPages: 0,
    });
  });

  test('탭하면 view endpoint 응답이 온 뒤에만 장소로 이동한다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    let resolveView: (value: RecordPlaceViewResponse) => void = () => {};
    const recordPlaceView = jest.spyOn(communityApi, 'recordPlaceView').mockImplementation(
      () => new Promise((resolve) => { resolveView = resolve; }),
    );
    const onOpenPlace = jest.fn();

    const { user } = await renderDetail({ onOpenPlace });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-place-17'));

    expect(recordPlaceView).toHaveBeenCalledWith(1, 17);
    expect(onOpenPlace).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('v2-community-place-busy-17')).toBeVisible());

    resolveView(placeViewFixture);

    await waitFor(() => expect(onOpenPlace).toHaveBeenCalledWith(17));
    expect(recordPlaceView).toHaveBeenCalledTimes(1);
  });

  test('연타해도 요청은 한 번만 보내고 처리 중에는 카드가 busy 상태다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    let resolveView: (value: RecordPlaceViewResponse) => void = () => {};
    const recordPlaceView = jest.spyOn(communityApi, 'recordPlaceView').mockImplementation(
      () => new Promise((resolve) => { resolveView = resolve; }),
    );

    const { user } = await renderDetail({ onOpenPlace: jest.fn() });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());
    const row = screen.getByTestId('v2-community-place-17');

    await user.press(row);
    await user.press(row);
    await user.press(row);

    await waitFor(() => expect(row.props.accessibilityState).toMatchObject({ busy: true }));
    expect(recordPlaceView).toHaveBeenCalledTimes(1);

    resolveView(placeViewFixture);
    await waitFor(() => expect(row.props.accessibilityState).toMatchObject({ busy: false }));
    expect(recordPlaceView).toHaveBeenCalledTimes(1);
  });

  test('서로 다른 연결 장소를 연속으로 탭하면 각각 한 번씩만 호출된다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail({
      places: [
        { deleted: false, placeId: 17, placeName: '대소고' },
        { deleted: false, placeId: 21, placeName: '오아시스 영화관' },
      ],
    }));
    const recordPlaceView = jest.spyOn(communityApi, 'recordPlaceView').mockImplementation(
      (postId: number, placeId: number) => Promise.resolve({ ...placeViewFixture, id: placeId, name: `place-${placeId}` }),
    );
    const onOpenPlace = jest.fn();

    const { user } = await renderDetail({ onOpenPlace });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-place-17'));
    await user.press(screen.getByTestId('v2-community-place-21'));

    await waitFor(() => expect(onOpenPlace).toHaveBeenCalledWith(17));
    await waitFor(() => expect(onOpenPlace).toHaveBeenCalledWith(21));
    expect(recordPlaceView).toHaveBeenCalledTimes(2);
    expect(recordPlaceView).toHaveBeenCalledWith(1, 17);
    expect(recordPlaceView).toHaveBeenCalledWith(1, 21);
  });

  test('성공 응답은 장소 상세 캐시에 기록되어 이후 일반 GET을 다시 부르지 않는다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    jest.spyOn(communityApi, 'recordPlaceView').mockResolvedValue(placeViewFixture);
    const getPlaceDetail = jest.spyOn(placeDetailApi, 'getPlaceDetail');
    const onOpenPlace = jest.fn();

    const { queryClient, user } = await renderDetail({ onOpenPlace });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-place-17'));
    await waitFor(() => expect(onOpenPlace).toHaveBeenCalledWith(17));

    expect(queryClient.getQueryData(placeDetailQueryKeys.detail(17))).toMatchObject({
      communityViewCount: 13, id: 17,
    });

    await renderWithProviders(<PlaceDetailProbe placeId={17} />, { queryClient });
    expect(getPlaceDetail).not.toHaveBeenCalled();
  });

  test('401 오류는 로그인 유도를 보여주고 이동하지 않는다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    jest.spyOn(communityApi, 'recordPlaceView').mockRejectedValue(
      new ApiError('만료', { code: 'INVALID_TOKEN', status: 401 }),
    );
    const onOpenPlace = jest.fn();
    const onSignIn = jest.fn();

    const { user } = await renderDetail({ onOpenPlace, onSignIn });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-place-17'));

    await waitFor(() => expect(screen.getByTestId('v2-community-place-sign-in-17')).toBeVisible());
    expect(onOpenPlace).not.toHaveBeenCalled();

    await user.press(screen.getByTestId('v2-community-place-sign-in-17'));
    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  test('403 오류는 권한 안내만 보여주고 재시도·로그인 버튼은 없다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    jest.spyOn(communityApi, 'recordPlaceView').mockRejectedValue(
      new ApiError('권한 없음', { code: 'ACCESS_DENIED', status: 403 }),
    );

    const { user } = await renderDetail({ onOpenPlace: jest.fn() });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-place-17'));

    await waitFor(() => expect(screen.getByText('이 계정에는 해당 작업을 수행할 권한이 없습니다.')).toBeVisible());
    expect(screen.queryByTestId('v2-community-place-retry-17')).toBeNull();
    expect(screen.queryByTestId('v2-community-place-sign-in-17')).toBeNull();
  });

  test('네트워크 오류는 인라인 재시도로 이어서 이동할 수 있다', async () => {
    jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    const recordPlaceView = jest.spyOn(communityApi, 'recordPlaceView')
      .mockRejectedValueOnce(new ApiError('네트워크 실패', { isNetworkError: true }))
      .mockResolvedValueOnce(placeViewFixture);
    const onOpenPlace = jest.fn();

    const { user } = await renderDetail({ onOpenPlace });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());

    await user.press(screen.getByTestId('v2-community-place-17'));
    await waitFor(() => expect(screen.getByTestId('v2-community-place-retry-17')).toBeVisible());
    expect(onOpenPlace).not.toHaveBeenCalled();

    await user.press(screen.getByTestId('v2-community-place-retry-17'));

    await waitFor(() => expect(onOpenPlace).toHaveBeenCalledWith(17));
    expect(recordPlaceView).toHaveBeenCalledTimes(2);
  });

  test('그 외 오류는 장소를 불러올 수 없다는 안내를 보여주고 게시글을 다시 조회한다', async () => {
    const getPost = jest.spyOn(communityApi, 'getPost').mockResolvedValue(detail());
    jest.spyOn(communityApi, 'recordPlaceView').mockRejectedValue(
      new ApiError('알 수 없는 오류', { status: 500 }),
    );

    const { user } = await renderDetail({ onOpenPlace: jest.fn() });
    await waitFor(() => expect(screen.getByText('대소고')).toBeVisible());
    expect(getPost).toHaveBeenCalledTimes(1);

    await user.press(screen.getByTestId('v2-community-place-17'));

    await waitFor(() => expect(screen.getByText('장소를 불러올 수 없어요')).toBeVisible());
    await waitFor(() => expect(getPost).toHaveBeenCalledTimes(2));
  });
});
