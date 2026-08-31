import React from 'react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '../../../shared/components';
import { SettingsScreenLayout, SettingsTopBar } from '../components/SettingsLayout';
import type { SettingsDetailId } from '../model/settings.types';

export type SettingsDetailPendingScreenProps = {
  detail: SettingsDetailId;
  onBack: () => void;
};

export default function SettingsDetailPendingScreen({ detail, onBack }: SettingsDetailPendingScreenProps) {
  const { t } = useTranslation();
  const title = t(`settings.details.${detail}.title`);

  return (
    <SettingsScreenLayout testID="v2-settings-detail-pending-screen">
      <SettingsTopBar backLabel={t('settings.back')} onBack={onBack} title={title} />
      <EmptyState
        actionLabel={t('settings.pending.back')}
        description={t(`settings.details.${detail}.description`)}
        fill
        onAction={onBack}
        title={t('settings.pending.title')}
      />
    </SettingsScreenLayout>
  );
}
