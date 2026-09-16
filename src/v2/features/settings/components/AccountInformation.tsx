import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../my-page/hooks/useProfile';
import { SettingsRow, SettingsSection } from './SettingsLayout';

export default function AccountInformation() {
  const { t } = useTranslation();
  const { profile, isLoading, isError, refetch } = useProfile();
  return <SettingsSection title={t('settings.account.loginSection')}>
    {isLoading || isError || !profile ? (
      <SettingsRow label={t(`settings.support.${isLoading ? 'loading' : isError ? 'error' : 'empty'}`)}
        onPress={isError ? () => { void refetch(); } : undefined} />
    ) : <>
      {profile.username ? <SettingsRow label={t('settings.account.username')} value={profile.username} /> : null}
      {profile.email ? <SettingsRow label={t('settings.account.email')} value={profile.email} /> : null}
      {!profile.username && !profile.email ? <SettingsRow label={t('settings.support.empty')} /> : null}
    </>}
    <SettingsRow disabled label={t('settings.support.emailEdit')} subtitle={t('settings.support.emailReason')} />
    <SettingsRow disabled label={t('settings.support.oauth')} subtitle={t('settings.support.oauthReason')} />
  </SettingsSection>;
}
