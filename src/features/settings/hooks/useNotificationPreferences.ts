import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pingdom/notification-preferences:v1';

export type NotificationPreferences = {
  activityEnabled: boolean;
  marketingEnabled: boolean;
  nightModeEnabled: boolean;
  pushEnabled: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  activityEnabled: true,
  marketingEnabled: false,
  nightModeEnabled: false,
  pushEnabled: true,
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(saved) });
        }
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  const setPreference = <TKey extends keyof NotificationPreferences>(
    key: TKey,
    value: NotificationPreferences[TKey]
  ) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: value };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return {
    isHydrated,
    preferences,
    setPreference,
  };
};

export default useNotificationPreferences;
