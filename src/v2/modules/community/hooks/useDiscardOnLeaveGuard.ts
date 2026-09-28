import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

type BeforeRemoveEvent<Action> = {
  data: { action: Action };
  preventDefault: () => void;
};

// Generic over the dispatched action type so this structurally matches
// react-navigation's real `NativeStackNavigationProp` (whose `dispatch`
// takes a specific action union, not `unknown`) without depending on it.
export type LeaveGuardNavigation<Action = unknown> = {
  addListener: (event: 'beforeRemove', callback: (event: BeforeRemoveEvent<Action>) => void) => () => void;
  dispatch: (action: Action) => void;
};

/**
 * Confirms discarding a draft before the write screen is removed from the
 * stack — back button, swipe gesture, or hardware back. A successful submit
 * sets the returned ref back to `false` right before navigating away, so
 * that replace never triggers the confirmation.
 */
export function useDiscardOnLeaveGuard<Action>(navigation: LeaveGuardNavigation<Action>) {
  const hasUnsavedInput = useRef(false);
  const { t } = useTranslation();

  useEffect(() => navigation.addListener('beforeRemove', (event) => {
    if (!hasUnsavedInput.current) return;
    event.preventDefault();
    Alert.alert(
      t('community.write_screen.discard.title'),
      t('community.write_screen.discard.body'),
      [
        { style: 'cancel', text: t('community.write_screen.discard.cancel') },
        {
          onPress: () => navigation.dispatch(event.data.action),
          style: 'destructive',
          text: t('community.write_screen.discard.confirm'),
        },
      ],
    );
  }), [navigation, t]);

  return hasUnsavedInput;
}
