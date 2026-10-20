import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMyReviews, useProfile } from '../../profile';
import { useCoupons } from '../../../booking/offers-coupons';
import { useCheckIns } from '../../../place/check-ins';
import AccountInformation from '../components/AccountInformation';
import { SettingsList, SettingsRow, SettingsScreenLayout, SettingsSection, SettingsTopBar } from '../components/SettingsLayout';
import { SETTINGS_DETAIL_IDS, type SettingsDetailId } from '../model/settings.types';

export type AccountManagementScreenProps = {
  onBack: () => void;
  onOpenDetail: (detail: SettingsDetailId) => void;
  onLogout?: () => Promise<void>;
};

export default function AccountManagementScreen({ onBack, onOpenDetail }: AccountManagementScreenProps) {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const reviews = useMyReviews({ limit: 1, page: 1 });
  const coupons = useCoupons();
  const checkIns = useCheckIns({ limit: 4 });
  const count = (loading: boolean, error: boolean, value?: number) => loading
    ? t('settings.support.loading') : error ? t('settings.support.error')
      : typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
        ? String(value) : t('settings.support.empty');

  return (
    <SettingsScreenLayout testID="v2-account-management-screen">
      <SettingsTopBar backLabel={t('settings.back')} onBack={onBack} title={t('settings.account.title')} />
      <SettingsList>
        {profile && profile.role !== 'MERCHANT_OWNER' ? <SettingsSection title={t('settings.account.sections.account')}>
          <SettingsRow label={t('settings.rows.profileEdit')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.ProfileEdit)} />
        </SettingsSection> : null}
        <AccountInformation />
        <SettingsSection title={t('settings.account.sections.activity')}>
          <SettingsRow label={t('settings.support.reviewCount')} valueLoading={reviews.isLoading} value={count(reviews.isLoading, reviews.isError, reviews.serverReviewCount)}
            onPress={reviews.isError ? () => { void reviews.refetch(); } : undefined} />
          <SettingsRow label={t('settings.account.items.coupons')}
            valueLoading={coupons.isLoading} value={count(coupons.isLoading, coupons.isError, coupons.data?.totalElements)}
            onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.Coupons)} />
          <SettingsRow label={t('settings.support.checkInCount')} valueLoading={checkIns.isLoading} value={count(checkIns.isLoading, checkIns.isError, checkIns.data?.serverTotalElements)}
            onPress={checkIns.isError ? () => { void checkIns.refetch(); } : undefined} />
        </SettingsSection>
      </SettingsList>
    </SettingsScreenLayout>
  );
}
