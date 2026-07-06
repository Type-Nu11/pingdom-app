import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { ensureNotificationPermission } from '../../firebase/utils/notificationPermission';

export type DevicePermissionStatus = '거부됨' | '알 수 없음' | '일부 허용' | '허용됨';

export type DevicePermissionsState = {
  camera: DevicePermissionStatus;
  location: DevicePermissionStatus;
  notification: DevicePermissionStatus;
  photoLibrary: DevicePermissionStatus;
};

const DEFAULT_STATE: DevicePermissionsState = {
  camera: '알 수 없음',
  location: '알 수 없음',
  notification: '알 수 없음',
  photoLibrary: '알 수 없음',
};

function toStatusLabel(status: ImagePicker.PermissionStatus | Location.PermissionStatus): DevicePermissionStatus {
  if (status === 'granted') return '허용됨';
  if (status === 'denied') return '거부됨';
  return '알 수 없음';
}

export const useDevicePermissions = () => {
  const [permissions, setPermissions] = useState<DevicePermissionsState>(DEFAULT_STATE);

  const refresh = useCallback(async () => {
    const [locationResult, cameraResult, mediaResult, notificationGranted] = await Promise.all([
      Location.getForegroundPermissionsAsync(),
      ImagePicker.getCameraPermissionsAsync(),
      ImagePicker.getMediaLibraryPermissionsAsync(),
      ensureNotificationPermission().catch(() => false),
    ]);

    setPermissions({
      camera: toStatusLabel(cameraResult.status),
      location: toStatusLabel(locationResult.status),
      notification: notificationGranted ? '허용됨' : '거부됨',
      photoLibrary: mediaResult.status === 'granted'
        ? (mediaResult.accessPrivileges === 'limited' ? '일부 허용' : '허용됨')
        : toStatusLabel(mediaResult.status),
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { permissions, refresh };
};

export default useDevicePermissions;
