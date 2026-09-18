import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { usePlaceAutocomplete } from '../../../exploration';
import { renderWithProviders } from '../../../../../shared/testing/testProviders';
import { useKakaoLocalSearch } from '../../hooks/useKakaoLocalSearch';
import { usePlaceRegistrantUsernames } from '../../../detail/hooks/usePlaceRegistrantUsernames';
import { useRecentSearchStore } from '../../store/recentSearchStore';
import MapSearchOverlay from '../MapSearchOverlay';

jest.mock('../../../exploration', () => ({
  ...jest.requireActual('../../../exploration'),
  usePlaceAutocomplete: jest.fn(),
}));
jest.mock('../../hooks/useKakaoLocalSearch', () => ({ useKakaoLocalSearch: jest.fn() }));
jest.mock('../../../detail/hooks/usePlaceRegistrantUsernames', () => ({
  usePlaceRegistrantUsernames: jest.fn(),
}));

const autocompleteQuery = (overrides: Record<string, unknown> = {}) => ({
  data: { places: [] },
  isError: false,
  isFetching: false,
  ...overrides,
}) as never;

describe('MapSearchOverlay registered-place search', () => {
  const recentSearchOwner = { kind: 'user' as const, userId: 101 };
  const searchPlaces = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    useRecentSearchStore.getState().deactivateOwner();
    jest.mocked(usePlaceAutocomplete).mockReturnValue(autocompleteQuery());
    jest.mocked(useKakaoLocalSearch).mockReturnValue({
      clearSearchResults: jest.fn(),
      isSearchingAddress: false,
      resolveAddressFromCoordinate: jest.fn(),
      searchPlaces,
      searchResults: [],
      searchStatusMessage: '',
    });
    jest.mocked(usePlaceRegistrantUsernames).mockReturnValue({
      isLoadingByPlaceId: {},
      usernamesByPlaceId: {},
    });
  });

  function renderOverlay() {
    return renderWithProviders(
      <MapSearchOverlay
        centerLat={37.5}
        centerLng={127}
        onClose={jest.fn()}
        onSelectPlace={jest.fn()}
        recentSearchOwner={recentSearchOwner}
      />,
    );
  }

  test('검색 제출 시 V2 autocomplete Hook을 실제 좌표와 검색어로 활성화한다', async () => {
    const { user } = await renderOverlay();

    await user.type(screen.getByPlaceholderText('검색하기'), '카페');
    fireEvent(screen.getByPlaceholderText('검색하기'), 'submitEditing');

    await waitFor(() => expect(usePlaceAutocomplete).toHaveBeenLastCalledWith({
      keyword: '카페',
      latitude: 37.5,
      longitude: 127,
    }, { enabled: true }));
    expect(searchPlaces).toHaveBeenCalledWith('카페', { centerLat: 37.5, centerLng: 127 });
    expect(screen.getByTestId('registered-place-status-empty')).toBeVisible();
  });

  test('등록 장소 요청 오류를 외부 검색 결과와 별도 상태로 표시한다', async () => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue(autocompleteQuery({ isError: true }));
    const { user } = await renderOverlay();

    await user.type(screen.getByPlaceholderText('검색하기'), '카페');
    fireEvent(screen.getByPlaceholderText('검색하기'), 'submitEditing');

    await waitFor(() => expect(screen.getByTestId('registered-place-status-error')).toBeVisible());
  });

  test('검색 후 Overlay를 닫았다 다시 열어도 최근 검색을 선택해 한 번만 재검색한다', async () => {
    const first = await renderOverlay();
    await first.user.type(screen.getByPlaceholderText('검색하기'), '  성수 카페  ');
    fireEvent(screen.getByPlaceholderText('검색하기'), 'submitEditing');
    await waitFor(() => expect(searchPlaces).toHaveBeenCalledWith(
      '성수 카페', { centerLat: 37.5, centerLng: 127 },
    ));
    first.unmount();

    searchPlaces.mockClear();
    const reopened = await renderOverlay();
    const recentSearch = await screen.findByLabelText('성수 카페 검색');
    await reopened.user.press(recentSearch);

    await waitFor(() => expect(searchPlaces).toHaveBeenCalledTimes(1));
    expect(searchPlaces).toHaveBeenCalledWith('성수 카페', { centerLat: 37.5, centerLng: 127 });
  });

  test('개별 삭제와 전체 삭제를 저장해 재진입 뒤 되살리지 않는다', async () => {
    const first = await renderOverlay();
    for (const query of ['카페', '전시']) {
      await first.user.clear(screen.getByPlaceholderText('검색하기'));
      await first.user.type(screen.getByPlaceholderText('검색하기'), query);
      fireEvent(screen.getByPlaceholderText('검색하기'), 'submitEditing');
      await waitFor(() => expect(searchPlaces).toHaveBeenCalledWith(
        query, { centerLat: 37.5, centerLng: 127 },
      ));
      fireEvent.changeText(screen.getByPlaceholderText('검색하기'), '');
    }

    await first.user.press(await screen.findByLabelText('전시 최근 검색어 삭제'));
    expect(screen.queryByLabelText('전시 검색')).toBeNull();
    first.unmount();

    const second = await renderOverlay();
    expect(await screen.findByLabelText('카페 검색')).toBeVisible();
    expect(screen.queryByLabelText('전시 검색')).toBeNull();
    await second.user.press(screen.getByLabelText('최근 검색 전체 삭제'));
    second.unmount();

    await renderOverlay();
    await waitFor(() => expect(screen.queryByLabelText('카페 검색')).toBeNull());
  });

  test('hydration 중에는 빈 기록 대신 복원 중 상태를 표시하고 저장하지 않는다', async () => {
    let finishRead: ((value: string | null) => void) | undefined;
    jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(
      () => new Promise((resolve) => { finishRead = resolve; }),
    );
    const setItem = jest.spyOn(AsyncStorage, 'setItem');

    await renderOverlay();

    expect(screen.getByLabelText('최근 검색 불러오는 중')).toBeVisible();
    expect(setItem).not.toHaveBeenCalled();
    await act(async () => {
      finishRead?.(JSON.stringify({
        items: [{
          category: 'cafe', id: '카페', query: '카페', searchedAt: '2026-09-12T00:00:00.000Z',
        }],
        version: 1,
      }));
      await Promise.resolve();
    });
    expect(await screen.findByLabelText('카페 검색')).toBeVisible();
  });

  test('빠른 연속 최근 검색 선택은 진행 중인 동일 검색을 중복 실행하지 않는다', async () => {
    let finishSearch: (() => void) | undefined;
    await useRecentSearchStore.getState().activateOwner(recentSearchOwner);
    await useRecentSearchStore.getState().recordSearch({
      category: 'cafe', query: '카페', searchedAt: '2026-09-12T00:00:00.000Z',
    });
    searchPlaces.mockImplementationOnce(
      () => new Promise<void>((resolve) => { finishSearch = resolve; }),
    );
    await renderOverlay();
    const recent = await screen.findByLabelText('카페 검색');

    fireEvent.press(recent);
    await Promise.resolve();
    fireEvent.press(recent);
    expect(searchPlaces).toHaveBeenCalledTimes(1);
    finishSearch?.();
    await Promise.resolve();
    await Promise.resolve();
  });

  test('영어 locale에서도 전체 삭제 접근성 문구와 날짜를 번역한다', async () => {
    const englishOwner = { kind: 'user' as const, userId: 303 };
    await useRecentSearchStore.getState().activateOwner(englishOwner);
    await useRecentSearchStore.getState().recordSearch({
      category: 'art', query: 'Museum', searchedAt: '2026-09-12T00:00:00.000Z',
    });
    await renderWithProviders(
      <MapSearchOverlay
        centerLat={37.5}
        centerLng={127}
        onClose={jest.fn()}
        onSelectPlace={jest.fn()}
        recentSearchOwner={englishOwner}
      />,
      { language: 'en' },
    );

    expect(await screen.findByLabelText('Clear all recent searches')).toBeVisible();
    expect(screen.getByText('09/12')).toBeVisible();
  });
});
