import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMyReviews, useProfile } from '../../../modules/user/profile';
import { useCoupons } from '../../offers-coupons/hooks/useOffersCoupons';
import { useCheckIns } from '../../../modules/place/check-ins';
import AccountInformation from '../components/AccountInformation';
import { SettingsList, SettingsRow, SettingsScreenLayout, SettingsSection, SettingsTopBar } from '../components/SettingsLayout';
import { useSettingsLogout } from '../hooks/useSettingsLogout';
import { SETTINGS_DETAIL_IDS, type SettingsDetailId } from '../model/settings.types';

export type AccountManagementScreenProps = {
  onBack: () => void;
  onOpenDetail: (detail: SettingsDetailId) => void;
  onLogout?: () => Promise<void>;
};

export default function AccountManagementScreen({ onBack, onOpenDetail, onLogout }: AccountManagementScreenProps) {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const reviews = useMyReviews({ limit: 1, page: 1 });
  const coupons = useCoupons();
  const checkIns = useCheckIns({ limit: 4 });
  const { logout, isLoggingOut, failed } = useSettingsLogout(onLogout);
  const count = (loading: boolean, error: boolean, value?: number) => loading
    ? t('settings.support.loading') : error ? t('settings.support.error')
      : typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
        ? String(value) : t('settings.support.empty');
  const unsupported = (detail: SettingsDetailId) => t(`settings.details.${detail}.description`);

  return (
    <SettingsScreenLayout testID="v2-account-management-screen">
      <SettingsTopBar backLabel={t('settings.back')} onBack={onBack} title={t('settings.account.title')} />
      <SettingsList>
        <SettingsSection title={t('settings.account.sections.account')}>
          {profile && profile.role !== 'MERCHANT_OWNER' ? <>
            <SettingsRow label={t('settings.rows.profileEdit')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.ProfileEdit)} />
            <SettingsRow label={t('settings.rows.password')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.PasswordChange)} />
          </> : null}
        </SettingsSection>
        <AccountInformation />
        <SettingsSection title={t('settings.account.sections.activity')}>
          <SettingsRow label={t('settings.account.items.myRecords')}
            subtitle={unsupported(SETTINGS_DETAIL_IDS.MyRecords)}
            accessibilityHint={t('settings.support.guide')}
            onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.MyRecords)} />
          <SettingsRow label={t('settings.support.reviewCount')} value={count(reviews.isLoading, reviews.isError, reviews.serverReviewCount)}
            onPress={reviews.isError ? () => { void reviews.refetch(); } : undefined} />
          <SettingsRow label={t('settings.account.items.coupons')}
            value={count(coupons.isLoading, coupons.isError, coupons.data?.totalElements)}
            onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.Coupons)} />
          <SettingsRow label={t('settings.support.checkInCount')} value={count(checkIns.isLoading, checkIns.isError, checkIns.data?.serverTotalElements)}
            onPress={checkIns.isError ? () => { void checkIns.refetch(); } : undefined} />
          <SettingsRow disabled label={t('settings.support.verifiedCount')} subtitle={t('settings.support.verifiedReason')} />
        </SettingsSection>
        <SettingsSection title={t('settings.account.sections.session')}>
          <SettingsRow label={t('settings.account.items.logout')} disabled={!onLogout || isLoggingOut} busy={isLoggingOut}
            subtitle={!onLogout ? t('settings.details.logout.description') : failed ? t('settings.support.logoutError') : undefined}
            onPress={() => { void logout(); }} />
          <SettingsRow danger label={t('settings.account.items.deleteAccount')}
            subtitle={unsupported(SETTINGS_DETAIL_IDS.DeleteAccount)} accessibilityHint={t('settings.support.guide')}
            onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.DeleteAccount)} />
        </SettingsSection>
      </SettingsList>
    </SettingsScreenLayout>
  );
}
