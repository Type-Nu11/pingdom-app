import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { Text as AppText } from '../../../../shared/components/Typography';
import { HeaderBackButton, ErrorState, LoadingState } from '../../../../shared/components';
import NotificationSettingToggle from '../components/NotificationSettingToggle';
import { useNotificationSettings, useUpdateNotificationSettings } from '../hooks/useNotificationSettings';
import { notificationSettingsErrorKey, quietHoursPresentation } from '../model/settingsPresentation';
import {
  isNotificationPermissionGranted, notificationPermissionAdapter,
  type NotificationPermissionAdapter, type NotificationPermissionStatus,
} from '../services/notificationPermission';

const CATEGORY_FIELDS = ['newHotplaceEnabled', 'newLikeEnabled'] as const;
type CategoryField = typeof CATEGORY_FIELDS[number];
const DESIGN_SECTIONS = [
  { title: 'records', keys: ['firstRecordTrending', 'recordNewTags'] },
  { title: 'interests', keys: ['favoriteMoodChange', 'frequentAreaHotPlace', 'todayMissionArea'] },
  { title: 'reports', keys: ['weeklyReport'] },
  { title: 'other', keys: ['nightNotifications', 'marketingEvents'] },
] as const;

export type NotificationSettingsScreenProps = {
  onBack: () => void;
  permissionAdapter?: NotificationPermissionAdapter;
};

/** Single server-backed screen, composed by SettingsScreen's production detail page. */
export default function NotificationSettingsScreen({ onBack, permissionAdapter = notificationPermissionAdapter }: NotificationSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const query = useNotificationSettings();
  const mutation = useUpdateNotificationSettings();
  const [permission, setPermission] = useState<NotificationPermissionStatus | 'loading'>('loading');
  const [pending, setPending] = useState<Partial<Record<CategoryField, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<CategoryField, string>>>({});
  const locks = useRef(new Set<CategoryField>());
  const mounted = useRef(false);
  const permissionRevision = useRef(0);

  useEffect(() => {
    mounted.current = true;
    const refresh = async () => {
      const revision = ++permissionRevision.current;
      let status: NotificationPermissionStatus;
      try { status = await permissionAdapter.read(); } catch { status = 'error'; }
      if (mounted.current && permissionRevision.current === revision) setPermission(status);
    };
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => { mounted.current = false; ++permissionRevision.current; subscription.remove(); };
  }, [permissionAdapter]);

  const change = async (field: CategoryField, value: boolean) => {
    if (locks.current.has(field) || query.isError || typeof query.data?.[field] !== 'boolean') return;
    locks.current.add(field);
    setPending((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    try {
      if (value) {
        ++permissionRevision.current;
        let status: NotificationPermissionStatus;
        try {
          status = await permissionAdapter.read();
          if (!mounted.current) return;
          if (!isNotificationPermissionGranted(status) && (status === 'notDetermined' || status === 'denied')) {
            status = await permissionAdapter.request();
          }
        } catch { status = 'error'; }
        if (!mounted.current) return;
        ++permissionRevision.current;
        setPermission(status);
        if (!isNotificationPermissionGranted(status)) {
          setErrors((current) => ({ ...current, [field]: `notificationSettings.permission.${status}` }));
          return;
        }
      }
      if (!mounted.current) return;
      await mutation.mutateAsync({ [field]: value });
    } catch (error) {
      if (mounted.current) setErrors((current) => ({ ...current, [field]: notificationSettingsErrorKey(error) }));
    } finally {
      locks.current.delete(field);
      if (mounted.current) setPending((current) => ({ ...current, [field]: false }));
    }
  };

  const quiet = quietHoursPresentation(query.data, i18n.resolvedLanguage ?? i18n.language);
  const unsupported = (key: string) => key === 'pushAll' ? t('notificationSettings.contract.allUnsupported')
    : key === 'nightNotifications' ? t('notificationSettings.contract.nightUnsupported')
      : t('notificationSettings.contract.unsupported');

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-notification-settings-screen">
      <Header>
        <HeaderBackButton accessibilityLabel={t('notificationSettings.back')} onPress={onBack} />
        <Title>{t('notificationSettings.title')}</Title><Spacer />
      </Header>
      <Content contentContainerStyle={{ paddingBottom: 40 }}>
        <Section>
          <Title>{t('notificationSettings.permission.title')}</Title>
          <Description accessibilityLiveRegion="polite">{t(`notificationSettings.permission.${permission}`)}</Description>
          <Description>{t('notificationSettings.permission.description')}</Description>
          <Action accessibilityRole="button" accessibilityLabel={t('notificationSettings.permission.openSettings')}
            onPress={() => { void permissionAdapter.openSettings().catch(() => { if (mounted.current) setPermission('error'); }); }}>
            <ActionLabel>{t('notificationSettings.permission.openSettings')}</ActionLabel>
          </Action>
          <NotificationSettingToggle disabled label={t('notificationSettings.settings.pushAll.label')}
            description={unsupported('pushAll')} testID="notification-setting-pushAll" />
        </Section>
        {query.isPending ? <LoadingState description={t('notificationSettings.loading')} /> : query.isError ? (
          <ErrorState description={t(notificationSettingsErrorKey(query.error, 'notificationSettings.error'))}
            actionLabel={t('notificationSettings.retry')} onAction={() => { void query.refetch(); }} />
        ) : (
          <Section>
            <Title>{t('notificationSettings.contract.categories')}</Title>
            {CATEGORY_FIELDS.map((field) => (
              <NotificationSettingToggle key={field} label={t(`notificationSettings.contract.${field}`)}
                description={typeof query.data?.[field] === 'boolean' ? t('notificationSettings.contract.categoryHint') : t('notificationSettings.contract.unknown')}
                disabled={typeof query.data?.[field] !== 'boolean'} isLoading={pending[field]}
                errorMessage={errors[field] ? t(errors[field]) : undefined}
                value={typeof query.data?.[field] === 'boolean' ? query.data[field] : undefined}
                onValueChange={(value) => { void change(field, value); }} testID={`notification-setting-${field}`} />
            ))}
            <NotificationSettingToggle disabled label={t('notificationSettings.contract.quietHours')}
              description={t('notificationSettings.contract.quietReadOnly')}
              value={typeof query.data?.quietHoursEnabled === 'boolean' ? query.data.quietHoursEnabled : undefined}
              testID="notification-setting-quietHoursEnabled" />
            <Description>{quiet ?? t('notificationSettings.contract.quietIncomplete')}</Description>
            {typeof query.data?.quietHoursEnabled !== 'boolean' ? <Description>{t('notificationSettings.contract.unknown')}</Description> : null}
          </Section>
        )}
        {DESIGN_SECTIONS.map((section) => (
          <Section key={section.title}>
            <Title>{t(`notificationSettings.sections.${section.title}`)}</Title>
            {section.keys.map((key) => <NotificationSettingToggle key={key} disabled
              label={t(`notificationSettings.settings.${key}.label`)} description={unsupported(key)}
              testID={`notification-setting-${key}`} />)}
          </Section>
        ))}
      </Content>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`min-height: 56px; padding: 0 16px; flex-direction: row; align-items: center; justify-content: space-between;`;
const Spacer = styled.View`width: 44px;`;
const Content = styled.ScrollView`flex: 1;`;
const Section = styled.View`padding: 16px; border-bottom-width: 8px; border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted}; gap: 8px;`;
const Title = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 16px; font-weight: 600; flex-shrink: 1;`;
const Description = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 13px; line-height: 20px;`;
const Action = styled.Pressable`min-height: 44px; justify-content: center;`;
const ActionLabel = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; font-size: 14px;`;
