import React from 'react';
import { renderWithProviders } from '../../../v2/app/testing/testProviders';
import { createProductionMainNavigator } from '../MainNavigator';
import { MAIN_ROUTES, type MainScreenProps } from '../types';
import type { VoiceNavigationTarget } from '../../../v2/modules/voice-assistant';

let mockNavigate: ((target: VoiceNavigationTarget) => boolean) | undefined;
let mockProfile: { role: string } | null = { role: 'USER' };
jest.mock('../../../v2/modules/user/profile', () => ({
  ...jest.requireActual('../../../v2/modules/user/profile'),
  useProfile: () => ({ profile: mockProfile }),
}));
afterEach(() => { mockProfile = { role: 'USER' }; });
jest.mock('../../../v2/modules/place/map', () => ({
  MapScreen: ({ onNavigateAssistantPage }: { onNavigateAssistantPage: typeof mockNavigate }) => {
    mockNavigate = onNavigateAssistantPage; return null;
  },
}));
const { MapRouteScreen } = createProductionMainNavigator({
  useAuthStore: selector => selector({ isLoggedIn: true, isHydrating: false, logout: async () => {} }),
  CheckInScreen: () => null, RoutePlaceholderScreen: () => null,
});

test.each([
  [{ page: 'reservations' }, MAIN_ROUTES.ReservationBox, undefined],
  [{ page: 'myPage' }, MAIN_ROUTES.MyPage, undefined],
  [{ page: 'settings' }, MAIN_ROUTES.Settings, undefined],
  [{ page: 'coupons' }, MAIN_ROUTES.CouponBox, undefined],
  [{ page: 'verifiedPlaces' }, MAIN_ROUTES.VerifiedPlaces, undefined],
  [{ page: 'accountManagement' }, MAIN_ROUTES.AccountManagement, undefined],
  [{ page: 'notificationSettings' }, MAIN_ROUTES.NotificationSettings, undefined],
  [{ page: 'loginInformation' }, MAIN_ROUTES.SettingsDetail, { detail: 'loginInformation' }],
  [{ page: 'locationSettings' }, MAIN_ROUTES.SettingsDetail, { detail: 'locationSettings' }],
  [{ page: 'privacySettings' }, MAIN_ROUTES.SettingsDetail, { detail: 'privacySettings' }],
  [{ page: 'dataManagement' }, MAIN_ROUTES.SettingsDetail, { detail: 'dataManagement' }],
  [{ page: 'communityPost', postId: 71 }, MAIN_ROUTES.CommunityDetail, { postId: 71 }],
  [{ page: 'createReservation', placeId: 42 }, MAIN_ROUTES.CreateReservation, { placeId: 42 }],
  [{ page: 'placeDetail', placeId: 42 }, MAIN_ROUTES.Map, { focusedPlaceId: 42 }],
] as const)('assistant %p reuses the existing production route', async (target, name, params) => {
  const navigate = jest.fn();
  const navigation = { navigate, setParams: jest.fn() } as unknown as MainScreenProps<'Map'>['navigation'];
  const route = { name: 'Map', key: 'map', params: undefined } as MainScreenProps<'Map'>['route'];
  const view = await renderWithProviders(<MapRouteScreen navigation={navigation} route={route} />);
  expect(mockNavigate?.(target)).toBe(true);
  expect(navigate.mock.calls).toEqual([params ? [name, params] : [name]]);
  await view.unmount();
});

test.each([{ role: 'MERCHANT_OWNER' }, null])('verified places rejects an unsupported or unresolved profile %p', async profile => {
  mockProfile = profile;
  const navigate = jest.fn();
  const navigation = { navigate, setParams: jest.fn() } as unknown as MainScreenProps<'Map'>['navigation'];
  const route = { name: 'Map', key: 'map', params: undefined } as MainScreenProps<'Map'>['route'];
  const view = await renderWithProviders(<MapRouteScreen navigation={navigation} route={route} />);
  expect(mockNavigate?.({ page: 'verifiedPlaces' })).toBe(false);
  expect(navigate).not.toHaveBeenCalled();
  await view.unmount();
});

test('invalid detail IDs and local sheet targets never dispatch a production route', async () => {
  const navigate = jest.fn();
  const navigation = { navigate, setParams: jest.fn() } as unknown as MainScreenProps<'Map'>['navigation'];
  const route = { name: 'Map', key: 'map', params: undefined } as MainScreenProps<'Map'>['route'];
  const view = await renderWithProviders(<MapRouteScreen navigation={navigation} route={route} />);
  for (const target of [{ page: 'createReservation', placeId: 0 }, { page: 'placeDetail', placeId: 0 }, { page: 'map' }, { page: 'search' }, { page: 'favorites' }] as const) {
    expect(mockNavigate?.(target)).toBe(false);
  }
  expect(navigate).not.toHaveBeenCalled(); await view.unmount();
});
