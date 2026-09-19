import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import { bookmarkApi } from '../../api/bookmarkApi';
import { checkInApi } from '../../../../../place/check-ins';
import { placeDetailApi } from '../../../../../place/detail';
import { placeExplorationApi } from '../../../../../place/exploration';
import VerifiedPlacesScreen from '../screens/VerifiedPlacesScreen';

function checkInPage(placeIds: number[]) {
  return {
    checkIns: placeIds.map((placeId, index) => ({ id: index + 1, placeId })),
    hasNext: false,
    limit: 10,
    page: 1,
    totalCount: placeIds.length,
    totalPages: 1,
  } as never;
}

function place(id: number, name: string) {
  return { address: '진주시', id, name, thumbnailUrl: null } as never;
}

beforeEach(() => {
  jest.spyOn(bookmarkApi, 'listBookmarks').mockResolvedValue({
    hasNext: false, limit: 100, page: 1, places: [], totalCount: 0, totalPages: 1,
  });
  jest.spyOn(placeExplorationApi, 'getPlaceExplorationMedia').mockImplementation(
    async (placeId) => ({
      media: [{ displayOrder: 0, id: placeId, imageUrl: `https://cdn.test/${placeId}.jpg` }],
      placeId,
    } as never),
  );
});

async function measureList(width = 402) {
  const list = screen.queryByTestId('v2-verified-places-list');
  if (list) await fireEvent(list, 'layout', { nativeEvent: { layout: { width, height: 600, x: 0, y: 0 } } });
}

describe('VerifiedPlacesScreen', () => {
  test.each([375, 402])('폭 %s에서 홀수 마지막 카드도 같은 열 폭을 사용한다', async (width) => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([11, 22, 33]));
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockImplementation(async (id) => place(id, `장소 ${id}`));
    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} onOpenPlace={jest.fn()} />);
    await measureList(width);
    await waitFor(() => expect(screen.getAllByTestId('v2-verified-place-card')).toHaveLength(3));
    for (const card of screen.getAllByTestId('v2-verified-place-card')) {
      expect(card).toHaveStyle({ width: width === 375 ? 157.5 : 171, flexGrow: 0 });
    }
  });

  test.each([375, 402])('측정 전에는 카드를 숨기고 %s에서 로딩 슬롯과 실제 카드 폭을 유지한다', async (width) => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([11, 22, 33]));
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockImplementation(async (id) => {
      if (id === 22) return new Promise(() => {});
      return place(id, `장소 ${id}`);
    });
    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} onOpenPlace={jest.fn()} />);
    expect(screen.queryAllByTestId('v2-verified-place-card')).toHaveLength(0);
    expect(screen.queryAllByTestId('v2-verified-place-card-skeleton')).toHaveLength(0);
    await measureList(width);
    await waitFor(() => expect(screen.getAllByTestId('v2-verified-place-card')).toHaveLength(2));
    for (const card of [...screen.getAllByTestId('v2-verified-place-card'), ...screen.getAllByTestId('v2-verified-place-card-skeleton')]) {
      expect(card).toHaveStyle({ width: width === 375 ? 157.5 : 171, height: 222, flexGrow: 0 });
    }
    await measureList(320);
    for (const card of [...screen.getAllByTestId('v2-verified-place-card'), ...screen.getAllByTestId('v2-verified-place-card-skeleton')]) {
      expect(card).toHaveStyle({ width: 130, height: 222 });
    }
    await measureList(0);
    expect(screen.queryAllByTestId('v2-verified-place-card')).toHaveLength(0);
  });

  test('체크인이 없으면 빈 상태를 보여준다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([]));

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} onOpenPlace={jest.fn()} />);
    await measureList();

    await waitFor(() => expect(screen.getByText('아직 검증한 장소가 없어요')).toBeTruthy());
  });

  test('체크인 조회가 실패하면 오류와 재시도를 보여준다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockRejectedValue(new Error('실패'));

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} onOpenPlace={jest.fn()} />);
    await measureList();

    await waitFor(() => expect(screen.getByText('인증한 장소를 불러오지 못했어요.')).toBeTruthy());
    expect(screen.getByText('다시 시도')).toBeTruthy();
  });

  test('장소 조회 순서와 무관하게 체크인 순서대로 보여준다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([11, 22, 33]));
    // 첫 장소를 가장 늦게 응답시켜 순서가 흔들리는지 본다.
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockImplementation(async (placeId) => {
      if (placeId === 11) {
        await new Promise((resolve) => setTimeout(resolve, 30));
        return place(11, '촉석루');
      }
      if (placeId === 22) return place(22, '진주성');
      return place(33, '남강');
    });

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} onOpenPlace={jest.fn()} />);
    await measureList();

    await waitFor(() => expect(screen.getByText('촉석루')).toBeTruthy());

    // 가장 늦게 응답한 촉석루(11)가 여전히 맨 앞이어야 한다.
    const renderedNames = screen
      .getAllByTestId('v2-verified-place-card')
      .map((card) => within(card).getAllByText(/촉석루|진주성|남강/)[0].props.children);
    expect(renderedNames).toEqual(['촉석루', '진주성', '남강']);
  });

  test('검증 장소 카드가 서버 이미지를 표시하고 해당 장소를 연다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([11]));
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockResolvedValue(place(11, '촉석루'));
    const onOpenPlace = jest.fn();
    const { user } = await renderWithProviders(
      <VerifiedPlacesScreen onBack={jest.fn()} onOpenPlace={onOpenPlace} />,
    );

    await measureList();
    const card = await screen.findByTestId('v2-verified-place-card');
    expect(screen.getByTestId('v2-verified-place-card-image').props.source).toEqual({
      uri: 'https://cdn.test/11.jpg',
    });
    await user.press(card);
    expect(onOpenPlace).toHaveBeenCalledWith(11);
  });

  test('모든 장소 조회가 실패하면 빈 상태가 아니라 오류를 보여준다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([11, 22]));
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockRejectedValue(new Error('실패'));

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} onOpenPlace={jest.fn()} />);
    await measureList();

    await waitFor(() => expect(screen.getByText('인증한 장소를 불러오지 못했어요.')).toBeTruthy());
    expect(screen.queryByText('아직 검증한 장소가 없어요')).toBeNull();
  });
});
