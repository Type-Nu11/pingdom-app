import { Linking, PermissionsAndroid, Platform } from 'react-native';

import { getFirebaseMessagingRuntime } from './firebaseMessaging';

export type NotificationPermissionStatus =
  | 'authorized' | 'provisional' | 'notDetermined' | 'denied'
  | 'blocked' | 'unavailable' | 'error';

export type NotificationPermissionAdapter = {
  read: () => Promise<NotificationPermissionStatus>;
  request: () => Promise<NotificationPermissionStatus>;
  openSettings: () => Promise<void>;
};

type PermissionDependencies = {
  platform: string;
  version: number;
  available: () => boolean;
  readNative: () => Promise<number>;
  requestNative: () => Promise<number>;
  checkAndroid: () => Promise<boolean>;
  requestAndroid: () => Promise<string>;
  openSettings: () => Promise<void>;
};

export function isNotificationPermissionGranted(status: NotificationPermissionStatus) {
  return status === 'authorized' || status === 'provisional';
}

export function createNotificationPermissionAdapter(deps: PermissionDependencies): NotificationPermissionAdapter {
  let permanentlyDenied = false;
  let pending: Promise<NotificationPermissionStatus> | undefined;
  const fromNative = (value: number): NotificationPermissionStatus => {
    if (value === 1) return 'authorized';
    if (value === 2) return 'provisional';
    if (value === -1) return 'notDetermined';
    if (value === 0) return 'denied';
    return 'unavailable';
  };
  const read = async (): Promise<NotificationPermissionStatus> => {
    try {
      if (!deps.available() || !['ios', 'android'].includes(deps.platform)) return 'unavailable';
      if (deps.platform === 'android' && deps.version >= 33) {
        if (await deps.checkAndroid()) {
          permanentlyDenied = false;
          return fromNative(await deps.readNative());
        }
        return permanentlyDenied ? 'blocked' : 'denied';
      }
      // Android <=32 has no POST_NOTIFICATIONS dialog. The native read uses
      // NotificationManagerCompat.areNotificationsEnabled(), including Settings denial.
      return fromNative(await deps.readNative());
    } catch { return 'error'; }
  };
  const request = (): Promise<NotificationPermissionStatus> => {
    if (pending) return pending;
    pending = (async () => {
      const current = await read();
      if (isNotificationPermissionGranted(current)
        || ['unavailable', 'error', 'blocked'].includes(current)) return current;
      try {
        if (deps.platform === 'android' && deps.version >= 33) {
          const result = await deps.requestAndroid();
          if (result === 'never_ask_again') { permanentlyDenied = true; return 'blocked'; }
          return result === 'granted' ? await read() : 'denied';
        }
        if (deps.platform === 'ios' && current === 'notDetermined') {
          return fromNative(await deps.requestNative());
        }
        return current;
      } catch { return 'error'; }
    })().finally(() => { pending = undefined; });
    return pending;
  };
  return { read, request, openSettings: deps.openSettings };
}

export const notificationPermissionAdapter = createNotificationPermissionAdapter({
  platform: Platform.OS,
  version: Number(Platform.Version),
  available: () => getFirebaseMessagingRuntime() !== null,
  readNative: async () => {
    const runtime = getFirebaseMessagingRuntime();
    if (!runtime) throw new Error('Native messaging unavailable');
    return runtime.hasPermission(runtime.messaging);
  },
  requestNative: async () => {
    const runtime = getFirebaseMessagingRuntime();
    if (!runtime) throw new Error('Native messaging unavailable');
    return runtime.requestPermission(runtime.messaging);
  },
  checkAndroid: () => PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS),
  requestAndroid: () => PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS),
  openSettings: () => Linking.openSettings(),
});

let permissionPromise: Promise<boolean> | null = null;

async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

      if (await PermissionsAndroid.check(permission)) {
        return true;
      }

      return await PermissionsAndroid.request(permission)
        === PermissionsAndroid.RESULTS.GRANTED;
    }

    const firebaseMessaging = getFirebaseMessagingRuntime();

    if (!firebaseMessaging) {
      return false;
    }

    const status = await firebaseMessaging.requestPermission(firebaseMessaging.messaging);
    return status === firebaseMessaging.AuthorizationStatus.AUTHORIZED
      || status === firebaseMessaging.AuthorizationStatus.PROVISIONAL;
  } catch {
    console.warn('[V2 FCM] Notification permission failed.');
    return false;
  }
}

export function ensureNotificationPermission(): Promise<boolean> {
  if (!permissionPromise) {
    permissionPromise = requestNotificationPermission().finally(() => {
      permissionPromise = null;
    });
  }

  return permissionPromise;
}
