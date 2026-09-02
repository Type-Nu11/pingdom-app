import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '../../../../shared/api';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { placeMenuApi } from '../../api/placeMenuApi';
import type { PlaceMenus } from '../../model/placeMenu.types';
import PlaceMenuSection from '../PlaceMenuSection';

const menu = (overrides: PlaceMenus[number] = {}): PlaceMenus[number] => ({
  id: 1,
  placeId: 17,
  name: '시그니처 라테',
  description: '고소한 원두와 우유',
  priceAmount: 6500,
  currency: 'KRW',
  imageUrl: 'https://cdn.example.test/menu.jpg',
  status: 'AVAILABLE',
  displayOrder: 1,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...overrides,
});

describe('PlaceMenuSection', () => {
  test('does not request or render a loading state for an invalid place id', async () => {
    const request = jest.spyOn(placeMenuApi, 'listPlaceMenus');

    await renderWithProviders(<PlaceMenuSection placeId={0} />);

    expect(request).not.toHaveBeenCalled();
    expect(screen.queryByTestId('place-menu-loading')).toBeNull();
  });

  test('keeps the place detail visible while only the menu section loads', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockImplementation(() => new Promise(() => {}));

    await renderWithProviders(<PlaceMenuSection placeId={17} />);

    expect(screen.getByTestId('place-menu-loading')).toBeTruthy();
    expect(screen.getByText('메뉴를 불러오는 중입니다…')).toBeTruthy();
  });

  test('renders server order, nullable fields, price zero, sold-out text, and image fallback', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([
      menu({ id: 2, name: '먼저 온 메뉴', description: null, imageUrl: null, priceAmount: 0 }),
      menu({ id: 1, name: '품절 메뉴', currency: 'USD', priceAmount: 19, status: 'SOLD_OUT' }),
    ]);

    await renderWithProviders(<PlaceMenuSection placeId={17} />);

    await waitFor(() => expect(screen.getByTestId('place-menu-section')).toBeTruthy());
    const rows = screen.getAllByTestId(/^place-menu-\d+$/);
    expect(rows.map((row) => row.props.testID)).toEqual(['place-menu-2', 'place-menu-1']);
    expect(screen.getByText('₩0')).toBeTruthy();
    expect(screen.getByText('품절')).toBeTruthy();
    expect(screen.getByLabelText('품절 메뉴 상태: 품절')).toBeTruthy();
    expect(screen.getByLabelText('먼저 온 메뉴 메뉴 이미지 없음')).toBeTruthy();
  });

  test('hides the whole section for an empty successful response', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([]);

    await renderWithProviders(<PlaceMenuSection placeId={17} />);

    await waitFor(() => expect(screen.queryByTestId('place-menu-loading')).toBeNull());
    expect(screen.queryByTestId('place-menu-section')).toBeNull();
    expect(screen.queryByText('메뉴')).toBeNull();
  });

  test('contains API errors locally and retries only the current menu query', async () => {
    const request = jest.spyOn(placeMenuApi, 'listPlaceMenus')
      .mockRejectedValueOnce(new ApiError('missing', { status: 404 }))
      .mockResolvedValueOnce([menu()]);
    const { user } = await renderWithProviders(<PlaceMenuSection placeId={17} />);

    await waitFor(() => expect(screen.getByTestId('place-menu-error')).toBeTruthy());
    expect(screen.getByText(/장소 상세와 메뉴 데이터/)).toBeTruthy();
    await user.press(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(screen.getByText('시그니처 라테')).toBeTruthy());
    expect(request).toHaveBeenCalledTimes(2);
  });

  test('keeps menu information after an image loading failure', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([menu()]);
    await renderWithProviders(<PlaceMenuSection placeId={17} />);

    const image = await screen.findByLabelText('시그니처 라테 메뉴 이미지');
    await act(async () => fireEvent(image, 'onError'));

    expect(screen.getByText('시그니처 라테')).toBeTruthy();
    expect(screen.getByText('₩6,500')).toBeTruthy();
    await waitFor(() => expect(screen.getByLabelText('시그니처 라테 메뉴 이미지 없음')).toBeTruthy());
  });

  test('switching places never shows the previous place menu', async () => {
    let resolve17!: (value: PlaceMenus) => void;
    let resolve18!: (value: PlaceMenus) => void;
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockImplementation((placeId) =>
      new Promise((resolve) => {
        if (placeId === 17) resolve17 = resolve;
        if (placeId === 18) resolve18 = resolve;
      }));
    const result = await renderWithProviders(<PlaceMenuSection placeId={17} />);

    await result.rerender(<PlaceMenuSection placeId={18} />);
    await act(async () => {
      resolve17([menu({ name: '이전 장소 메뉴' })]);
      await Promise.resolve();
    });
    expect(screen.queryByText('이전 장소 메뉴')).toBeNull();
    expect(screen.getByTestId('place-menu-loading')).toBeTruthy();

    await act(async () => {
      resolve18([menu({ id: 2, placeId: 18, name: '현재 장소 메뉴' })]);
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByText('현재 장소 메뉴')).toBeTruthy());
    expect(screen.queryByText('이전 장소 메뉴')).toBeNull();
  });

  test('uses English locale and accessibility copy without translating user content', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([
      menu({ name: 'Original user menu', currency: 'EUR', priceAmount: 12, status: 'SOLD_OUT' }),
    ]);

    await renderWithProviders(<PlaceMenuSection placeId={17} />, { language: 'en' });

    await waitFor(() => expect(screen.getByText('Original user menu')).toBeTruthy());
    expect(screen.getByText('Menu')).toBeTruthy();
    expect(screen.getByText('Sold out')).toBeTruthy();
    expect(screen.getByLabelText('Original user menu status: Sold out')).toBeTruthy();
  });
});
