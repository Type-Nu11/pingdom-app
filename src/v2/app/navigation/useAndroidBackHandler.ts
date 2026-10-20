import { useAppDialog } from '../../shared/components/AppDialogProvider';
import type {
  NavigationContainerRefWithCurrent,
  ParamListBase,
} from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Platform } from 'react-native';

import { getAndroidBackAction } from './androidBack';

export function useAndroidBackHandler<ParamList extends ParamListBase>(
  navigationRef: NavigationContainerRefWithCurrent<ParamList>,
) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const lastRootBackPressAt = useRef(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
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
      dialog.toast(t('common.navigation.exitHint'));
      return true;
    });

    return () => subscription.remove();
  }, [dialog, navigationRef, t]);
}
