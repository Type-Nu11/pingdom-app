import * as Location from 'expo-location';

/** The only native foreground permission access point. Never obtains coordinates. */
export const foregroundPermission = {
  get: () => Location.getForegroundPermissionsAsync(),
  request: () => Location.requestForegroundPermissionsAsync(),
  servicesEnabled: () => Location.hasServicesEnabledAsync(),
};

export type ForegroundPermissionState = 'loading' | 'granted' | 'denied' | 'restricted' | 'unavailable' | 'error';
export type PermissionResponse = { status: string; canAskAgain: boolean };
export type ForegroundPermissionAdapter = {
  get: () => Promise<PermissionResponse>;
  request: () => Promise<PermissionResponse>;
  servicesEnabled: () => Promise<boolean>;
};

export async function readForegroundPermission(
  adapter: ForegroundPermissionAdapter,
  request = false,
): Promise<ForegroundPermissionState> {
  try {
    let permission = await adapter.get();
    if (!(await adapter.servicesEnabled())) return 'unavailable';
    // Recheck at the action boundary: settings may have changed since rendering.
    if (request && permission.status !== 'granted' && permission.status !== 'restricted' && permission.canAskAgain) {
      permission = await adapter.request();
    }
    if (permission.status === 'granted') return 'granted';
    if (permission.status === 'restricted' || !permission.canAskAgain) return 'restricted';
    return 'denied';
  } catch {
    return 'error';
  }
}
