import { useCallback, useEffect, useRef } from 'react';
import { resolveSettingsDestination } from '../model/settingsNavigation';
import type { SettingsDetailId } from '../model/settings.types';

type SettingsNavigation = {
  addListener: (event: 'focus', listener: () => void) => () => void;
  navigate: {
    (route: 'ProfileEdit' | 'AccountManagement' | 'CouponBox' | 'NotificationSettings'): void;
    (route: 'SettingsDetail', params: { detail: SettingsDetailId }): void;
  };
};

/** Shared by both composition roots. Reset only when the source regains focus. */
export function useSettingsNavigation(navigation: SettingsNavigation) {
  const navigating = useRef(false);
  useEffect(() => navigation.addListener('focus', () => { navigating.current = false; }), [navigation]);
  return useCallback((detail: SettingsDetailId) => {
    const destination = resolveSettingsDestination(detail);
    // Logout is an authenticated action, never a successful placeholder route.
    if (destination.kind === 'logout' || navigating.current) return;
    navigating.current = true;
    if (destination.kind === 'route') navigation.navigate(destination.route);
    else navigation.navigate('SettingsDetail', { detail: destination.detail });
  }, [navigation]);
}

/** Preserve old detail params while replacing their former placeholder entry. */
export function useSettingsDetailRedirect(
  navigation: { replace: (route: 'ProfileEdit' | 'AccountManagement' | 'CouponBox' | 'NotificationSettings') => void },
  detail: SettingsDetailId,
) {
  const destination = resolveSettingsDestination(detail);
  const route = destination.kind === 'route' ? destination.route : undefined;
  useEffect(() => { if (route) navigation.replace(route); }, [navigation, route]);
  return Boolean(route);
}
