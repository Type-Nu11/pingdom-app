import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { notificationPermissionAdapter, isNotificationPermissionGranted } from '../../modules/user/notifications';
import { foregroundPermission } from '../../shared/location/foregroundPermission';
import { microphonePermissionSnapshot, runStartupPermissions, type StartupPermission, type StartupPermissionResult } from './startupPermissionFlow';

const key = (permission: StartupPermission) => `v2:startup-permission-requested:${permission}`;

async function requestStartupPermissions(): Promise<StartupPermissionResult> {
  return runStartupPermissions({
    gates: {
      notifications: {
        read: async () => {
          const status = await notificationPermissionAdapter.read();
          return {
            granted: isNotificationPermissionGranted(status),
            canAskAgain: status === 'notDetermined' || (Platform.OS === 'android' && status === 'denied'),
          };
        },
        request: async () => ({
          granted: isNotificationPermissionGranted(await notificationPermissionAdapter.request()),
          canAskAgain: false,
        }),
      },
      location: {
        read: async () => {
          const status = await foregroundPermission.get();
          return { granted: status.granted, canAskAgain: status.canAskAgain };
        },
        request: async () => {
          const status = await foregroundPermission.request();
          return { granted: status.granted, canAskAgain: status.canAskAgain };
        },
      },
      microphone: {
        read: async () => {
          const status = await getRecordingPermissionsAsync();
          return microphonePermissionSnapshot(status, Platform.OS);
        },
        request: async () => {
          const status = await requestRecordingPermissionsAsync();
          return { granted: status.granted, canAskAgain: status.canAskAgain };
        },
      },
    },
    wasRequested: async (permission) => await AsyncStorage.getItem(key(permission)) === '1',
    markRequested: async (permission) => { await AsyncStorage.setItem(key(permission), '1'); },
  });
}

let pendingStartupPermissions: Promise<StartupPermissionResult> | null = null;

export function useStartupPermissions() {
  const [result, setResult] = useState<{ ready: boolean; notificationsGranted: boolean }>({
    ready: false,
    notificationsGranted: false,
  });

  useEffect(() => {
    let mounted = true;
    if (!pendingStartupPermissions) pendingStartupPermissions = requestStartupPermissions();
    void pendingStartupPermissions.then((permissions) => {
      if (mounted) setResult({ ready: true, ...permissions });
    }).catch(() => {
      if (mounted) setResult({ ready: true, notificationsGranted: false });
    }).finally(() => { pendingStartupPermissions = null; });
    return () => { mounted = false; };
  }, []);

  return result;
}
