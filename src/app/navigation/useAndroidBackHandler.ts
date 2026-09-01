import type {
  NavigationContainerRefWithCurrent,
  ParamListBase,
} from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { runAndroidBackOverride } from '../../shared/navigation/androidBackOverride';
import { getAndroidBackAction } from './androidBack';

export function useAndroidBackHandler<ParamList extends ParamListBase>(
  navigationRef: NavigationContainerRefWithCurrent<ParamList>,
) {
  const { t } = useTranslation();
  const lastRootBackPressAt = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (runAndroidBackOverride()) {
        lastRootBackPressAt.current = 0;
        return true;
      }

      const now = Date.now();
      const canGoBack = navigationRef.isReady() && navigationRef.canGoBack();
      const action = getAndroidBackAction(canGoBack, lastRootBackPressAt.current, now);

      if (action === 'go-back') {
        lastRootBackPressAt.current = 0;
        navigationRef.goBack();
        return true;
      }

      if (action === 'exit-app') {
        lastRootBackPressAt.current = 0;
        BackHandler.exitApp();
        return true;
      }

      lastRootBackPressAt.current = now;
      ToastAndroid.show(t('common.navigation.exitHint'), ToastAndroid.SHORT);
      return true;
    });

    return () => subscription.remove();
  }, [navigationRef, t]);
}
