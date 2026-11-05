import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { ApiError } from '../../../../../shared/api';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { placeMenuApi } from '../../api/placeMenuApi';
import type { PlaceMenus } from '../../model/placeMenu.types';
import PlaceMenuSection from '../PlaceMenuSection';
import { useProfile } from '../../../../user/profile';
import { offlineTranslation } from '../../../translation/service';

jest.mock('../../../translation/service', () => ({ offlineTranslation: {
  available: jest.fn(() => false), models: jest.fn(), download: jest.fn(), delete: jest.fn(), translate: jest.fn(),
} }));

jest.mock('../../../../user/profile', () => ({ useProfile: jest.fn() }));
import * as exchangeApi from '../../api/menuExchangeRateApi';

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
  beforeEach(() => {
    jest.mocked(offlineTranslation.available).mockReturnValue(false);
    jest.mocked(useProfile).mockReturnValue({
      error: null, isFetching: false, isError: false, isLoading: false, refetch: jest.fn(),
      profile: {
      id: 1, username: 'user', email: 'user@example.com', country: 'KR', language: 'ko',
      birthYear: 1998, profileImageUrl: null,
      },
    });
  });

  test('상품명과 설명을 함께 번역하며 원화 가격과 실제 사진은 유지한다', async () => {
    await AsyncStorage.clear();
    jest.mocked(offlineTranslation.available).mockReturnValue(true);
    jest.mocked(offlineTranslation.models).mockResolvedValue(['ko', 'ja']);
    jest.mocked(offlineTranslation.translate).mockImplementation(async (text, target) => `${target}: ${text}`);
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([menu(), menu({ id: 2, name: '차', description: null })]);
    await AsyncStorage.setItem('@pingdom/place-translation/target/1', 'en');
    await renderWithProviders(<PlaceMenuSection placeId={17} presentation="mapDetail" />);
    expect(await screen.findByText('en: 시그니처 라테')).toBeTruthy();
    expect(await screen.findByText('en: 고소한 원두와 우유')).toBeTruthy();
    expect(await screen.findByText('en: 차')).toBeTruthy();
    expect(screen.getAllByText('₩6,500')).toHaveLength(2);
    expect(screen.getByLabelText('시그니처 라테 메뉴 이미지').props.source).toEqual({ uri: 'https://cdn.example.test/menu.jpg' });
    expect(screen.getAllByLabelText('Translated by Google')).toHaveLength(2);
    expect(offlineTranslation.translate).not.toHaveBeenCalledWith(null, expect.anything());
    expect(offlineTranslation.download).not.toHaveBeenCalled();
    await fireEvent(screen.getByText('en: 시그니처 라테'), 'longPress');
    expect(await screen.findByText('고소한 원두와 우유')).toBeVisible();
    await fireEvent.press(screen.getByRole('radio', { name: '日本語' }));
    await screen.findByText('ja: 시그니처 라테');
    await screen.findByText('ja: 고소한 원두와 우유');
    await screen.findByText('ja: 차');
    await fireEvent.press(screen.getByRole('radio', { name: '한국어' }));
    await fireEvent.press(screen.getByRole('button', { name: '닫기' }));
    expect(await screen.findByText('시그니처 라테')).toBeTruthy();
    expect(await screen.findByText('차')).toBeTruthy();
    expect(screen.queryByLabelText('Translated by Google')).toBeNull();
    await AsyncStorage.clear();
  });

  test('설명 번역 실패 시 원문 전체를 유지하고 재시도할 수 있다', async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('@pingdom/place-translation/target/1', 'en');
    jest.mocked(offlineTranslation.available).mockReturnValue(true);
    jest.mocked(offlineTranslation.models).mockResolvedValue(['ko']);
    jest.mocked(offlineTranslation.translate).mockImplementation(async text => {
      if (text === '고소한 원두와 우유') throw new Error('translation failed');
      return 'Signature latte';
    });
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([menu()]);
    await renderWithProviders(<PlaceMenuSection placeId={17} />);
    expect(await screen.findByRole('button', { name: '다시 확인' })).toBeTruthy();
    expect(screen.getByText('시그니처 라테')).toBeTruthy();
    expect(screen.getByText('고소한 원두와 우유')).toBeTruthy();
    expect(screen.queryByText('Signature latte')).toBeNull();
    expect(screen.getByText('₩6,500')).toBeTruthy();
    expect(screen.queryByLabelText('Translated by Google')).toBeNull();
    await AsyncStorage.clear();
  });

  test('언어팩은 동의한 한 번만 내려받고 현재 보이는 모든 상품을 번역한다', async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('@pingdom/place-translation/target/1', 'en');
    jest.mocked(offlineTranslation.available).mockReturnValue(true);
    jest.mocked(offlineTranslation.models).mockResolvedValue([]);
    jest.mocked(offlineTranslation.translate).mockImplementation(async text => `번역: ${text}`);
    jest.mocked(offlineTranslation.download).mockImplementationOnce(async () => {
      jest.mocked(offlineTranslation.models).mockResolvedValue(['ko']);
    });
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([menu(), menu({ id: 2, name: '차', description: null })]);
    await renderWithProviders(<PlaceMenuSection placeId={17} />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: '언어팩 다운로드 필요' })).toHaveLength(2));
    expect(offlineTranslation.translate).not.toHaveBeenCalled();
    expect(offlineTranslation.download).not.toHaveBeenCalled();
    await fireEvent.press(screen.getAllByRole('button', { name: '언어팩 다운로드 필요' })[0]);
    await fireEvent.press(screen.getByRole('button', { name: 'Wi-Fi로 다운로드' }));
    expect(await screen.findByText('번역: 시그니처 라테')).toBeTruthy();
    expect(await screen.findByText('번역: 고소한 원두와 우유')).toBeTruthy();
    expect(await screen.findByText('번역: 차')).toBeTruthy();
    expect(offlineTranslation.download).toHaveBeenCalledTimes(1);
    await AsyncStorage.clear();
  });

  test('map detail presentation uses Figma menu geometry with server-provided content', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([menu()]);
    await renderWithProviders(<PlaceMenuSection placeId={17} presentation="mapDetail" />);
    await waitFor(() => expect(screen.getByText('시그니처 라테')).toBeTruthy());
    expect(screen.getByText('시그니처 라테')).toHaveStyle({ fontSize: 18, lineHeight: 24 });
    expect(screen.getByText('고소한 원두와 우유')).toHaveStyle({ fontSize: 16 });
    expect(screen.getByLabelText('시그니처 라테 메뉴 이미지')).toHaveStyle({ width: 104, height: 104 });
  });

  test('map products open the existing gallery at the tapped server image and missing images stay inert', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([
      menu(), menu({ id: 2, name: '차', imageUrl: 'https://cdn.example.test/tea.jpg' }), menu({ id: 3, name: '이미지 없는 상품', imageUrl: null }),
    ]);
    const onOpenImages = jest.fn();
    await renderWithProviders(<PlaceMenuSection placeId={17} presentation="mapDetail" onOpenImages={onOpenImages} />);
    await waitFor(() => expect(screen.getByRole('button', { name: '차 상품 사진 확대' })).toBeTruthy());
    expect(screen.getByText('상품')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '차 상품 사진 확대' }));
    expect(onOpenImages).toHaveBeenCalledWith(['https://cdn.example.test/menu.jpg', 'https://cdn.example.test/tea.jpg'], 1);
    expect(screen.queryByRole('button', { name: '이미지 없는 상품 상품 사진 확대' })).toBeNull();
    await fireEvent(screen.getByLabelText('시그니처 라테 메뉴 이미지'), 'error');
    expect(screen.queryByRole('button', { name: '시그니처 라테 상품 사진 확대' })).toBeNull();
  });

  test.each([
    ['US', 'USD', 0.00074], ['JP', 'JPY', 0.1], ['CN', 'CNY', 0.005],
    ['TH', 'THB', 0.025], ['VN', 'VND', 18],
  ] as const)('automatically displays %s user currency below the original price', async (country, quote, rate) => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([
      menu({ priceAmount: 9000 }), menu({ id: 2, name: '두 번째 메뉴', priceAmount: 4500 }),
    ]);
    jest.mocked(useProfile).mockReturnValue({
      error: null, isFetching: false, isError: false, isLoading: false, refetch: jest.fn(),
      profile: {
      id: 1, username: 'user', email: 'user@example.com', country, language: 'ko',
      birthYear: 1998, profileImageUrl: null,
      },
    });
    const request = jest.spyOn(exchangeApi, 'getMenuExchangeRate').mockResolvedValue({
      base: 'KRW', quote, date: '2026-09-01', rate, fetchedAt: Date.now(),
    });
    await renderWithProviders(<PlaceMenuSection placeId={17} />);
    expect(await screen.findByTestId('place-menu-converted-1')).toBeTruthy();
    expect(screen.getByTestId('place-menu-converted-2')).toBeTruthy();
    expect(screen.getByText('₩9,000')).toBeTruthy();
    expect(request).toHaveBeenCalledWith(quote);
    expect(request).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Frankfurter/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'USD로 보기' })).toBeNull();
    const body = screen.getByTestId('place-menu-1').children[0];
    expect(typeof body).not.toBe('string');
    if (typeof body !== 'string') {
      const children = body.children.filter((child) => typeof child !== 'string');
      const priceIndex = children.findIndex((child) => child.props.accessibilityLabel === '가격: ₩9,000');
      expect(children[priceIndex + 1].props.testID).toBe('place-menu-converted-1');
    }
  });

  test('does not convert prices for a Korean user', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([menu()]);
    const request = jest.spyOn(exchangeApi, 'getMenuExchangeRate');
    await renderWithProviders(<PlaceMenuSection placeId={17} />);
    await screen.findByText('₩6,500');
    expect(screen.queryByTestId('place-menu-converted-1')).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

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
    expect(screen.getByRole('progressbar', { name: '메뉴를 불러오는 중입니다…' })).toBeTruthy();
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

  test('shows a normal empty state for an empty successful response', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([]);

    await renderWithProviders(<PlaceMenuSection placeId={17} />);

    await waitFor(() => expect(screen.queryByTestId('place-menu-loading')).toBeNull());
    expect(screen.queryByTestId('place-menu-section')).toBeNull();
    expect(screen.getByTestId('place-menu-empty')).toBeTruthy();
    expect(screen.getByText('메뉴')).toBeTruthy();
    expect(screen.getByText('등록된 메뉴가 없습니다.')).toBeTruthy();
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

  test('uses English copy for the empty state', async () => {
    jest.spyOn(placeMenuApi, 'listPlaceMenus').mockResolvedValue([]);

    await renderWithProviders(<PlaceMenuSection placeId={17} />, { language: 'en' });

    expect(await screen.findByText('No menu has been added yet.')).toBeTruthy();
  });
});
