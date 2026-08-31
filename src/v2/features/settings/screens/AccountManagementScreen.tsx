import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  SettingsList,
  SettingsRow,
  SettingsScreenLayout,
  SettingsSection,
  SettingsTopBar,
} from '../components/SettingsLayout';
import { SETTINGS_DETAIL_IDS, type SettingsDetailId } from '../model/settings.types';

export type AccountManagementScreenProps = {
  onBack: () => void;
  onOpenDetail: (detail: SettingsDetailId) => void;
};

export default function AccountManagementScreen({ onBack, onOpenDetail }: AccountManagementScreenProps) {
  const { t } = useTranslation();

  return (
    <SettingsScreenLayout testID="v2-account-management-screen">
      <SettingsTopBar backLabel={t('settings.back')} onBack={onBack} title={t('settings.account.title')} />
      <SettingsList>
        <SettingsSection title={t('settings.account.sections.account')}>
          <SettingsRow
            label={t('settings.account.items.loginInformation')}
            onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.LoginInformation)}
            subtitle={t('settings.account.items.loginInformationDescription')}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.account.sections.activity')}>
          <SettingsRow label={t('settings.account.items.myRecords')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.MyRecords)} />
          <SettingsRow label={t('settings.account.items.coupons')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.Coupons)} />
        </SettingsSection>

        <SettingsSection title={t('settings.account.sections.session')}>
          <SettingsRow label={t('settings.account.items.logout')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.Logout)} />
          <SettingsRow danger label={t('settings.account.items.deleteAccount')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.DeleteAccount)} />
        </SettingsSection>
      </SettingsList>
    </SettingsScreenLayout>
  );
}
