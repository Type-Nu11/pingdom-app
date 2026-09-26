import React from 'react';
import ApiErrorState from '../../../../shared/components/ApiErrorState';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../profile';
import { SettingsRow, SettingsSection } from './SettingsLayout';

export default function AccountInformation() {
  const { t } = useTranslation();
  const { profile, error, isFetching, isLoading, isError, refetch } = useProfile();
  return <SettingsSection title={t('settings.account.loginSection')}>
    {isError ? <ApiErrorState error={error} busy={isFetching} onRetry={() => refetch({ cancelRefetch: false })} /> : null}
    {isError && !profile ? null : isLoading || !profile ? (
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
