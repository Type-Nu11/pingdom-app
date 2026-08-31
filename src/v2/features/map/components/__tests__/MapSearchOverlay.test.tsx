import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import { usePlaceAutocomplete } from '../../../place-exploration';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { useKakaoLocalSearch } from '../../hooks/useKakaoLocalSearch';
import { usePlaceRegistrantUsernames } from '../../hooks/usePlaceRegistrantUsernames';
import MapSearchOverlay from '../MapSearchOverlay';

jest.mock('../../../place-exploration', () => ({
  ...jest.requireActual('../../../place-exploration'),
  usePlaceAutocomplete: jest.fn(),
}));
jest.mock('../../hooks/useKakaoLocalSearch', () => ({ useKakaoLocalSearch: jest.fn() }));
jest.mock('../../hooks/usePlaceRegistrantUsernames', () => ({
  usePlaceRegistrantUsernames: jest.fn(),
}));

const autocompleteQuery = (overrides: Record<string, unknown> = {}) => ({
  data: { places: [] },
  isError: false,
  isFetching: false,
  ...overrides,
}) as never;

describe('MapSearchOverlay registered-place search', () => {
  const searchPlaces = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
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
});
