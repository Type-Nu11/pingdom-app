import React from 'react';
import { screen, waitFor, within } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { bookmarkApi } from '../../api/bookmarkApi';
import { checkInApi } from '../../../check-ins/api/checkInApi';
import { placeDetailApi } from '../../../place-detail/api/placeDetailApi';
import VerifiedPlacesScreen from '../VerifiedPlacesScreen';

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
});

describe('VerifiedPlacesScreen', () => {
  test('체크인이 없으면 빈 상태를 보여준다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([]));

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('아직 검증한 장소가 없어요')).toBeTruthy());
  });

  test('체크인 조회가 실패하면 오류와 재시도를 보여준다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockRejectedValue(new Error('실패'));

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} />);

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

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('촉석루')).toBeTruthy());

    // 가장 늦게 응답한 촉석루(11)가 여전히 맨 앞이어야 한다.
    const renderedNames = screen
      .getAllByTestId('v2-verified-place-card')
      .map((card) => within(card).getAllByText(/촉석루|진주성|남강/)[0].props.children);
    expect(renderedNames).toEqual(['촉석루', '진주성', '남강']);
  });

  test('모든 장소 조회가 실패하면 빈 상태가 아니라 오류를 보여준다', async () => {
    jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(checkInPage([11, 22]));
    jest.spyOn(placeDetailApi, 'getPlaceDetail').mockRejectedValue(new Error('실패'));

    await renderWithProviders(<VerifiedPlacesScreen onBack={jest.fn()} />);

    await waitFor(() => expect(screen.getByText('인증한 장소를 불러오지 못했어요.')).toBeTruthy());
    expect(screen.queryByText('아직 검증한 장소가 없어요')).toBeNull();
  });
});
