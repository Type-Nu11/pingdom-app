import React from 'react';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import { usePlaceAutocomplete } from '../../../place/search';
import CommunityPlacePicker from '../CommunityPlacePicker';

jest.mock('../../../place/search', () => ({
  ...jest.requireActual('../../../place/search'),
  usePlaceAutocomplete: jest.fn(),
}));

function autocomplete(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isError: false,
    isFetching: false,
    refetch: jest.fn(),
    ...overrides,
  } as never;
}

describe('CommunityPlacePicker', () => {
  beforeEach(() => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue(autocomplete());
  });

  test('검색어가 없으면 안내 문구를 보여주고 조회하지 않는다', async () => {
    await renderWithProviders(
      <CommunityPlacePicker onClose={jest.fn()} onSelect={jest.fn()} />,
      { language: 'ko' },
    );

    expect(screen.getByText('태그할 등록된 장소를 검색해 주세요')).toBeVisible();
    expect(jest.mocked(usePlaceAutocomplete)).toHaveBeenLastCalledWith(
      { keyword: '', limit: 20 },
      expect.objectContaining({ enabled: false }),
    );
  });

  test('검색 결과를 누르면 onSelect가 호출되고 화면이 닫힌다', async () => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue(autocomplete({
      data: { places: [{ address: '서울 종로구', category: 'CAFE', id: 17, name: '대소고' }] },
    }));
    const onSelect = jest.fn();
    const onClose = jest.fn();

    const { user } = await renderWithProviders(
      <CommunityPlacePicker onClose={onClose} onSelect={onSelect} />,
      { language: 'ko' },
    );

    await user.type(screen.getByTestId('v2-community-place-picker-input'), '대소고');
    await waitFor(() => expect(screen.getByTestId('v2-community-place-picker-result-17')).toBeVisible());
    await user.press(screen.getByTestId('v2-community-place-picker-result-17'));

    expect(onSelect).toHaveBeenCalledWith({ address: '서울 종로구', category: 'CAFE', id: 17, name: '대소고' });
  });

  test('결과가 없으면 빈 상태를 보여준다', async () => {
    jest.mocked(usePlaceAutocomplete).mockReturnValue(autocomplete({ data: { places: [] } }));

    const { user } = await renderWithProviders(
      <CommunityPlacePicker onClose={jest.fn()} onSelect={jest.fn()} />,
      { language: 'ko' },
    );

    await user.type(screen.getByTestId('v2-community-place-picker-input'), '없는장소');
    await waitFor(() => expect(screen.getByTestId('v2-community-place-picker-empty')).toBeVisible());
  });

  test('오류가 나면 다시 시도할 수 있다', async () => {
    const refetch = jest.fn();
    jest.mocked(usePlaceAutocomplete).mockReturnValue(autocomplete({ isError: true, refetch }));

    const { user } = await renderWithProviders(
      <CommunityPlacePicker onClose={jest.fn()} onSelect={jest.fn()} />,
      { language: 'ko' },
    );

    await user.type(screen.getByTestId('v2-community-place-picker-input'), '카페');
    await waitFor(() => expect(screen.getByTestId('v2-community-place-picker-error')).toBeVisible());
    await user.press(screen.getByText('다시 시도'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('닫기 버튼을 누르면 onClose가 호출된다', async () => {
    const onClose = jest.fn();
    const { user } = await renderWithProviders(
      <CommunityPlacePicker onClose={onClose} onSelect={jest.fn()} />,
      { language: 'ko' },
    );

    await user.press(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
