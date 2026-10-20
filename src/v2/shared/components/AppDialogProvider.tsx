import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import styled from 'styled-components/native';
import AppModal from './AppModal';
import Button from './Button';
import { Text } from './Typography';
import { textStyleCss } from '../theme/typography';

export type AppDialogAction = { text?: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
type DialogOptions = { cancelable?: boolean; onDismiss?: () => void };
type Entry = { owner: string; title: string; message?: string; actions?: AppDialogAction[]; options?: DialogOptions };
type DialogHost = {
  show: (entry: Entry) => void;
  removeOwner: (owner: string) => void;
  toast: (message: string) => void;
};
const Context = createContext<DialogHost | null>(null);

export function AppDialogProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const queue = useRef<Entry[]>([]);
  const [active, setActive] = useState<Entry | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closing = useRef(false);
  const pendingAction = useRef<(() => void) | undefined>(undefined);
  const sync = useCallback(() => setActive(queue.current[0] ?? null), []);
  const show = useCallback((entry: Entry) => {
    // One pending interaction per caller; repeated hardware back / taps cannot stack dialogs.
    if (queue.current.some(item => item.owner === entry.owner && item.title === entry.title)) return;
    queue.current.push(entry); if (!closing.current) sync();
  }, [sync]);
  const removeOwner = useCallback((owner: string) => {
    queue.current = queue.current.filter(item => item.owner !== owner);
    if (!closing.current) sync();
  }, [sync]);
  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimer.current); setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  }, []);
  useEffect(() => () => { clearTimeout(toastTimer.current); }, []);
  const host = useMemo(() => ({ show, removeOwner, toast: showToast }), [show, removeOwner, showToast]);
  const close = (action?: AppDialogAction) => {
    if (!active || queue.current[0] !== active) return;
    queue.current.shift(); setActive(null);
    const callback = action ? action.onPress : active.options?.onDismiss;
    // iOS camera/library presentation must wait until the dialog's native host closes.
    if (Platform.OS === 'ios') {
      closing.current = true;
      pendingAction.current = callback;
    } else {
      callback?.(); sync();
    }
  };
  const didDismiss = () => {
    if (!closing.current) return;
    closing.current = false;
    const callback = pendingAction.current;
    pendingAction.current = undefined;
    callback?.(); sync();
  };
  const dismiss = () => { if (active?.options?.cancelable !== false) close(); };
  return <Context.Provider value={host}>
    {children}
    <AppModal visible={active !== null} onClose={dismiss} onDismiss={didDismiss} dismissLabel={t('common.navigation.close')}
      testID="app-dialog">
      <Content bounces={false}>
        <Title accessibilityRole="header">{active?.title}</Title>
        {!!active?.message && <Message>{active.message}</Message>}
        <Actions>
          {(active?.actions?.length ? active.actions : [{ text: t('common.navigation.confirm') }]).map((action, index) =>
            <Button key={index} fullWidth shape="pill" size="medium" label={action.text ?? t('common.navigation.confirm')}
              variant={action.style === 'cancel' ? 'ghost' : 'primary'}
              onPress={() => close(action)} testID={`app-dialog-action-${index}`} />)}
        </Actions>
      </Content>
    </AppModal>
    {!!toast && <Toast pointerEvents="none" accessibilityLiveRegion="polite" testID="app-toast"><ToastText>{toast}</ToastText></Toast>}
  </Context.Provider>;
}

export function useAppDialog() {
  const host = useContext(Context);
  if (!host) throw new Error('AppDialogProvider is required');
  const owner = useId();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; host.removeOwner(owner); };
  }, [host, owner]);
  return useMemo(() => ({
    show: (title: string, message?: string, actions?: AppDialogAction[], options?: DialogOptions) => {
      if (mounted.current) host.show({ owner, title, message,
        actions: actions?.map(action => ({ ...action, onPress: () => { if (mounted.current) action.onPress?.(); } })),
        options: { ...options, onDismiss: () => { if (mounted.current) options?.onDismiss?.(); } },
      });
    },
    toast: host.toast,
  }), [host, owner]);
}
const Content = styled.ScrollView`flex-shrink: 1;`;
const Title = styled(Text)`color: ${({ theme }) => theme.colors.textStrong}; ${({ theme }) => textStyleCss(theme.typography.title)}`;
const Message = styled(Text)`color: ${({ theme }) => theme.colors.text}; ${({ theme }) => textStyleCss(theme.typography.body)} margin-top: 12px;`;
const Actions = styled.View`gap: 8px; margin-top: 24px;`;
const Toast = styled.View`
  position: absolute; bottom: 112px; left: 24px; right: 24px; align-self: center;
  padding: 14px 20px; border-radius: 24px; background-color: ${({ theme }) => theme.colors.textStrong};
`;
const ToastText = styled(Text)`color: ${({ theme }) => theme.colors.background}; text-align: center; ${({ theme }) => textStyleCss(theme.typography.labelMedium)}`;
