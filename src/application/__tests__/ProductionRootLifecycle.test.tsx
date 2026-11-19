import React from 'react';
import { MutationObserver, type QueryClient } from '@tanstack/react-query';
import { act, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../v2/app/testing/testProviders';
import { useFcmTokenSync, useForegroundNotifications } from '../../v2/modules/user/notifications/lifecycle';
import RootNavigator from '../navigation/RootNavigator';

const mockBootstrap = jest.fn(async () => {});
const mockHydrate = jest.fn(async () => {});
const mockMapHydrate = jest.fn(async () => {});
const mockClearVisitSession = jest.fn();
let mockProtectedClient: QueryClient;
let mockSession = { isHydrating: true, isLoggedIn: false, hasAuthenticated: false, bootstrapAuth: mockBootstrap };
let mockOnboarding: { kind: string; completion?: object } = { kind: 'hydrating' };
let mockStartupPermissions = { ready: true, notificationsGranted: true };

jest.mock('../../v2/app/permissions', () => ({ useStartupPermissions: () => mockStartupPermissions }));

jest.mock('../../app/store/authStore', () => ({
  useAuthStore: (selector: (state: typeof mockSession) => unknown) => selector(mockSession),
}));
jest.mock('../../app/navigation/AuthNavigator', () => ({
  __esModule: true,
  default: ({ completion, returningUser }: { completion?: object; returningUser?: boolean }) => require('react').createElement(
    require('react-native').Text, null, completion || returningUser ? 'auth landing' : 'first onboarding',
  ),
}));
jest.mock('../../app/navigation/MainNavigator', () => ({
  __esModule: true,
  default: function MockMainNavigator() {
    mockProtectedClient = require('@tanstack/react-query').useQueryClient();
    return require('react').createElement(require('react-native').Text, null, 'protected map');
  },
}));
jest.mock('../../v2/modules/onboarding', () => ({
  ...jest.requireActual('../../v2/modules/onboarding'),
  useOnboardingEntry: () => ({ state: mockOnboarding, hydrate: mockHydrate, complete: jest.fn() }),
}));
jest.mock('../../v2/modules/place/map/settings', () => ({
  useMapSettingsStore: (selector: (state: object) => unknown) => selector({ hydrateMapSettings: mockMapHydrate }),
}));
jest.mock('../../v2/modules/user/notifications/lifecycle', () => ({
  useFcmTokenSync: jest.fn(), useForegroundNotifications: jest.fn(), useNotificationOpenSync: jest.fn(),
}));
jest.mock('../../v2/modules/place/visit-verification/session', () => ({
  clearActiveForegroundVisitVerificationSession: () => mockClearVisitSession(),
}));

beforeEach(() => {
  mockSession = { isHydrating: true, isLoggedIn: false, hasAuthenticated: false, bootstrapAuth: mockBootstrap };
  mockOnboarding = { kind: 'hydrating' };
  mockStartupPermissions = { ready: true, notificationsGranted: true };
});

test('production root waits for startup permission prompts before mounting the map', async () => {
  mockSession = { ...mockSession, isHydrating: false, isLoggedIn: true };
  mockOnboarding = { kind: 'completed', completion: { country: 'KR', language: 'ko', birthYear: 2000 } };
  mockStartupPermissions = { ready: false, notificationsGranted: false };
  const view = await renderWithProviders(<RootNavigator />);
  expect(screen.queryByText('protected map')).toBeNull();
  expect(useFcmTokenSync).toHaveBeenLastCalledWith(false);
  expect(useForegroundNotifications).toHaveBeenLastCalledWith(false);
  mockStartupPermissions = { ready: true, notificationsGranted: true };
  await view.rerender(<RootNavigator />);
  expect(await screen.findByText('protected map')).toBeVisible();
  expect(useFcmTokenSync).toHaveBeenLastCalledWith(true);
  expect(useForegroundNotifications).toHaveBeenLastCalledWith(true);
});

test('actual production root hides routes until both hydration gates finish', async () => {
  const view = await renderWithProviders(<RootNavigator />);
  expect(screen.queryByText('auth landing')).toBeNull();
  expect(screen.queryByText('first onboarding')).toBeNull();
  expect(screen.queryByText('protected map')).toBeNull();
  mockSession = { ...mockSession, isHydrating: false };
  await view.rerender(<RootNavigator />);
  expect(screen.queryByText('first onboarding')).toBeNull();
  mockOnboarding = { kind: 'incomplete' };
  await view.rerender(<RootNavigator />);
  expect(await screen.findByText('first onboarding')).toBeVisible();
  expect(mockBootstrap).toHaveBeenCalledTimes(1);
  expect(mockHydrate).toHaveBeenCalledTimes(1);
});

test('logout/refresh failure removes protected navigation, queries and active visit session', async () => {
  mockSession = { ...mockSession, isHydrating: false, isLoggedIn: true };
  mockOnboarding = { kind: 'completed', completion: { country: 'KR', language: 'ko', birthYear: 2000 } };
  const view = await renderWithProviders(<RootNavigator />);
  expect(await screen.findByText('protected map')).toBeVisible();
  const key = ['users', 'me'];
  const previousClient = mockProtectedClient;
  previousClient.setQueryData(key, { username: 'previous-user' });
  let previousSignal!: AbortSignal;
  let finishPrevious!: (data: { username: string }) => void;
  const previous = previousClient.fetchQuery({
    staleTime: 0,
    queryKey: key,
    queryFn: ({ signal }) => {
      previousSignal = signal;
      return new Promise<{ username: string }>(resolve => { finishPrevious = resolve; });
    },
  }).catch(error => error);
  let finishMutation!: () => void;
  const mutation = new MutationObserver(previousClient, {
    mutationFn: () => new Promise<void>(resolve => { finishMutation = resolve; }),
    onSuccess: () => { previousClient.setQueryData(key, { username: 'late-mutation' }); },
  }).mutate();
  await act(async () => {});
  mockSession = { ...mockSession, isHydrating: true, isLoggedIn: false };
  await view.rerender(<RootNavigator />);
  expect(screen.queryByText('protected map')).toBeNull();
  expect(previousClient.getQueryCache().getAll()).toHaveLength(0);
  expect(mockClearVisitSession).toHaveBeenCalledTimes(1);
  mockSession = { ...mockSession, isHydrating: false };
  await view.rerender(<RootNavigator />);
  expect(await screen.findByText('auth landing')).toBeVisible();
  expect(screen.queryByText('first onboarding')).toBeNull();
  expect(previousSignal.aborted).toBe(true);

  mockSession = { ...mockSession, isLoggedIn: true };
  await view.rerender(<RootNavigator />);
  const nextClient = mockProtectedClient;
  expect(nextClient).not.toBe(previousClient);
  expect(nextClient.getQueryData(key)).toBeUndefined();
  await nextClient.fetchQuery({
    queryKey: key,
    queryFn: async () => ({ username: 'next-user' }),
  });
  await act(async () => {
    finishPrevious({ username: 'late-previous-user' });
    finishMutation();
    await Promise.all([previous, mutation]);
  });
  expect(previousClient.getQueryData(key)).toEqual({ username: 'late-mutation' });
  expect(nextClient.getQueryData(key)).toEqual({ username: 'next-user' });
  previousClient.clear();
});


test('a returning legacy account with no onboarding completion exits to auth landing on logout', async () => {
  mockSession = { ...mockSession, isHydrating: false, isLoggedIn: true, hasAuthenticated: true };
  mockOnboarding = { kind: 'incomplete' };
  const view = await renderWithProviders(<RootNavigator />);
  expect(await screen.findByText('protected map')).toBeVisible();
  mockSession = { ...mockSession, isLoggedIn: false };
  await view.rerender(<RootNavigator />);
  expect(await screen.findByText('auth landing')).toBeVisible();
  expect(screen.queryByText('first onboarding')).toBeNull();
});
