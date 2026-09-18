import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../../shared/components';
import { resolveSettingsDestination } from '../model/settingsNavigation';
import AccountInformation from '../components/AccountInformation';
import { SettingsList, SettingsScreenLayout, SettingsTopBar } from '../components/SettingsLayout';
import type { SettingsDetailId } from '../model/settings.types';
import DataExportScreen from './DataExportScreen';
import LocationPrivacyScreen from './LocationPrivacyScreen';
import SettingsDetailPendingScreen from './SettingsDetailPendingScreen';

export default function SettingsDetailScreen({ detail, onBack }: { detail: SettingsDetailId; onBack: () => void }) {
  const { t } = useTranslation();
  const destination = resolveSettingsDestination(detail);
  if (destination.kind === 'route') return <SettingsScreenLayout testID="v2-settings-navigation-unavailable">
    <EmptyState fill title={t('settings.support.navigationUnavailable')}
      actionLabel={t('settings.pending.back')} onAction={onBack} />
  </SettingsScreenLayout>;
  if (detail === 'dataManagement') return <DataExportScreen onBack={onBack} />;
  if (detail === 'locationSettings' || detail === 'privacySettings') return <LocationPrivacyScreen onBack={onBack} />;
  if (detail === 'loginInformation') return <SettingsScreenLayout testID="v2-login-information-screen">
    <SettingsTopBar backLabel={t('settings.back')} onBack={onBack} title={t('settings.account.loginSection')} />
    <SettingsList><AccountInformation /></SettingsList>
  </SettingsScreenLayout>;
  if (destination.kind === 'unsupported' || destination.kind === 'logout') {
    return <SettingsDetailPendingScreen detail={destination.kind === 'logout' ? 'logout' : destination.detail} onBack={onBack} />;
  }
  return null;
}
