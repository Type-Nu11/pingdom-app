import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { profileApi } from '../../../my-page/api/profileApi';
import { offerCouponApi } from '../../../offers-coupons/api/offerCouponApi';
import { checkInApi, normalizeLocationCheckInPage } from '../../../../modules/place/check-ins';
import AccountManagementScreen from '../AccountManagementScreen';

beforeEach(() => {
  jest.spyOn(checkInApi, 'listCheckIns').mockResolvedValue(normalizeLocationCheckInPage({ items: [], totalElements: 24 }));
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue({ id: 1, username: 'server_user', email: 'server@example.com', birthYear: 1998, country: 'KR', language: 'ko', profileImageUrl: null });
  jest.spyOn(profileApi, 'listMyReviews').mockResolvedValue({ reviews: [], page: 1, limit: 1, totalElements: 37, totalPages: 37, hasNext: true });
  jest.spyOn(offerCouponApi, 'listCoupons').mockResolvedValue({ coupons: [], page: 1, limit: 20, totalElements: 12, totalPages: 1, hasNext: false });
});

test('shows server identity and server totals, never the current page length', async () => {
  await renderWithProviders(<AccountManagementScreen onBack={jest.fn()} onOpenDetail={jest.fn()} />);
  expect(await screen.findByText('server_user')).toBeVisible();
  expect(await screen.findByText('server@example.com')).toBeVisible();
  expect(await screen.findByText('37')).toBeVisible();
  expect(await screen.findByText('12')).toBeVisible();
  expect(await screen.findByText('24')).toBeVisible();
  expect(profileApi.listMyReviews).toHaveBeenCalledTimes(1);
  expect(offerCouponApi.listCoupons).toHaveBeenCalledTimes(1);
});

test('does not invent zero for missing server totals', async () => {
  jest.mocked(checkInApi.listCheckIns).mockResolvedValue(normalizeLocationCheckInPage({ items: [] }));
  jest.mocked(profileApi.listMyReviews).mockResolvedValue({ reviews: [] } as never);
  jest.mocked(offerCouponApi.listCoupons).mockResolvedValue({ coupons: [] } as never);
  await renderWithProviders(<AccountManagementScreen onBack={jest.fn()} onOpenDetail={jest.fn()} />);
  expect(await screen.findByText('server_user')).toBeVisible();
  expect(screen.queryByText('0')).toBeNull();
  expect((await screen.findAllByText('정보 없음')).length).toBeGreaterThanOrEqual(2);
});

test('distinguishes query failure from loading and missing data', async () => {
  jest.mocked(profileApi.listMyReviews).mockRejectedValue(new Error('offline'));
  jest.mocked(offerCouponApi.listCoupons).mockImplementation(() => new Promise(() => {}));
  await renderWithProviders(<AccountManagementScreen onBack={jest.fn()} onOpenDetail={jest.fn()} />);
  expect(await screen.findByText('불러오지 못했습니다')).toBeVisible();
  expect(screen.getByText('불러오는 중')).toBeVisible();
  expect(screen.queryByText('0')).toBeNull();
});

test('shows an actual zero and keeps the existing cache identity', async () => {
  jest.mocked(profileApi.listMyReviews).mockResolvedValue({ reviews: [], totalElements: 0 } as never);
  jest.mocked(offerCouponApi.listCoupons).mockResolvedValue({ coupons: [], totalElements: 0 } as never);
  const view = await renderWithProviders(<AccountManagementScreen onBack={jest.fn()} onOpenDetail={jest.fn()} />);
  expect(await screen.findAllByText('0')).toHaveLength(2);
  expect(view.queryClient.getQueryData(['v2', 'users', 'me', 'reviews', { limit: 1, page: 1 }])).toEqual({ reviews: [], totalElements: 0 });
  expect(view.queryClient.getQueryData(['v2', 'coupons', {}])).toEqual({ coupons: [], totalElements: 0 });
  expect(view.queryClient.getQueryData(['v2', 'check-ins', 'list', { limit: 4 }])).toBeDefined();
});

test.each(['ko', 'en'] as const)('%s explains unavailable mutations with disabled accessibility state in dark mode', async (language) => {
  await renderWithProviders(<AccountManagementScreen onBack={jest.fn()} onOpenDetail={jest.fn()} />, { language, appearancePreference: 'DARK' });
  await screen.findByText('server_user');
  const email = screen.getByRole('button', { name: language === 'ko' ? /이메일 수정, 이메일 직접 수정 계약/ : /Edit email, Direct email editing/ });
  expect(email).toBeDisabled();
  expect(screen.getByRole('button', { name: language === 'ko' ? /연결된 계정, 서버에서/ : /Connected accounts, The server/ })).toBeDisabled();
  expect(screen.getByTestId('v2-account-management-screen')).toHaveStyle({ backgroundColor: '#0F0F11' });
});
