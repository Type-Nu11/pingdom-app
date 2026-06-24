import { useSyncExternalStore } from 'react';
import {
  consumePendingNotificationRoute,
  getNotificationState,
  setLastBackgroundNotificationRoute,
  setPendingNotificationRoute,
  subscribeNotification,
} from '../../../app/store/notificationStore';

export function useNotificationState() {
  const state = useSyncExternalStore(
    subscribeNotification,
    getNotificationState,
    getNotificationState
  );

  return {
    ...state,
    consumePendingNotificationRoute,
    setPendingNotificationRoute,
    setLastBackgroundNotificationRoute,
  };
}

export default useNotificationState;
