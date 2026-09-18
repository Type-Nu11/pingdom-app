import { Text as AppText } from '../../../shared/components/Typography';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import { useProfile } from '../../../modules/user/profile';
import NotificationSettingsScreen from '../../notifications/screens/NotificationSettingsScreen';
import { HeaderBackButton } from '../../../shared/components';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-24.svg';
import { SETTINGS_DETAIL_IDS, type SettingsDetailId } from '../model/settings.types';
import LocationPrivacyScreen from './LocationPrivacyScreen';
import LanguageSettingsScreen from './LanguageSettingsScreen';
import AppearanceSettingsScreen from './AppearanceSettingsScreen';
import AccountManagementScreen from './AccountManagementScreen';
import SettingsDetailScreen from './SettingsDetailScreen';
import { useAppearance, type AppearancePreference } from '../../../shared/theme';

type SettingsPage = 'account' | 'appearance' | 'language' | 'location' | 'notifications' | 'root';

export type SettingsScreenProps = {
  initialPage?: 'root' | 'notifications';
  onBack: () => void;
  onLogout?: () => Promise<void>;
  onOpenAccountManagement?: () => void;
  onOpenDetail?: (detail: SettingsDetailId) => void;
  onOpenNotificationSettings?: () => void;
  onOpenProfileEdit?: () => void;
};

type RowProps = {
  accessibilityLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  value?: string;
  hint?: string;
};

function SettingsRow({
  accessibilityLabel,
  destructive = false,
  disabled = false,
  label,
  onPress,
  value,
  hint,
}: RowProps) {
  const actionable = Boolean(onPress) && !disabled;

  return (
    <Row
      accessibilityLabel={accessibilityLabel ?? [label, hint].filter(Boolean).join(', ')}
      accessibilityHint={hint}
      accessibilityRole={actionable ? 'button' : 'text'}
      accessibilityState={{ disabled: !actionable }}
      disabled={!actionable}
      onPress={onPress}
    >
      <RowLabel $destructive={destructive} $disabled={disabled}>{label}</RowLabel>
      <RowTrailing>
        {value ? <RowValue numberOfLines={1}>{value}</RowValue> : null}
        {actionable ? <ChevronIcon height={20} width={20} /> : null}
      </RowTrailing>
    </Row>
  );
}

type HeaderProps = {
  onBack: () => void;
  title: string;
};

function SettingsHeader({ onBack, title }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <Header>
      <HeaderBackButton accessibilityLabel={t('settings.back')} onPress={onBack} />
      <HeaderTitle numberOfLines={1}>{title}</HeaderTitle>
      <HeaderSpacer />
    </Header>
  );
}

type SectionProps = React.PropsWithChildren<{ title?: string }>;

function SettingsSection({ children, title }: SectionProps) {
  return (
    <Section>
      <SectionInner>
        {title ? <SectionTitle>{title}</SectionTitle> : null}
        {children}
      </SectionInner>
    </Section>
  );
}

export default function SettingsScreen({
  initialPage = 'root',
  onBack,
  onLogout,
  onOpenAccountManagement,
  onOpenDetail: navigateDetail,
  onOpenNotificationSettings,
  onOpenProfileEdit,
}: SettingsScreenProps) {
  const theme = useTheme();
  const { preference } = useAppearance();
  const { i18n, t } = useTranslation();
  const { profile } = useProfile();
  const [page, setPage] = useState<SettingsPage>(initialPage);
  const [localDetail, setLocalDetail] = useState<SettingsDetailId | null>(null);
  const onOpenDetail = useCallback((detail: SettingsDetailId) => {
    if (navigateDetail) {
      navigateDetail(detail);
    } else if ((detail === SETTINGS_DETAIL_IDS.ProfileEdit || detail === SETTINGS_DETAIL_IDS.PasswordChange) && onOpenProfileEdit) {
      onOpenProfileEdit();
    } else {
      setLocalDetail(detail);
    }
  }, [navigateDetail, onOpenProfileEdit]);
  const logoutLock = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const goBack = useCallback(() => {
    if (localDetail) { setLocalDetail(null); return; }
    if (page !== initialPage) {
      setPage('root');
      return;
    }
    onBack();
  }, [initialPage, localDetail, onBack, page]);

  useEffect(() => {
    if (page === initialPage && !localDetail) return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  }, [goBack, initialPage, localDetail, page]);

  const handleLogout = useCallback(async () => {
    if (!onLogout) {
      onOpenDetail(SETTINGS_DETAIL_IDS.Logout);
      return;
    }
    if (logoutLock.current) return;
    logoutLock.current = true;
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch {
      Alert.alert(t('settings.support.logoutError'));
    } finally {
      logoutLock.current = false;
      setIsLoggingOut(false);
    }
  }, [onLogout, onOpenDetail, t]);

  const canOpenTouristProfile = Boolean(profile) && profile?.role !== 'MERCHANT_OWNER';
  const appearanceValueKeys: Record<AppearancePreference, string> = {
    SYSTEM: 'settings.appearance.system',
    LIGHT: 'settings.appearance.light',
    DARK: 'settings.appearance.dark',
  };

  if (page === 'notifications') return <NotificationSettingsScreen onBack={goBack} />;
  if (localDetail) return <SettingsDetailScreen detail={localDetail} onBack={goBack} />;

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-settings-screen">
      {page === 'root' ? (
        <>
          <SettingsHeader onBack={goBack} title={t('settings.title')} />
          <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
            <SettingsSection title={t('settings.sections.account')}>
              {canOpenTouristProfile ? (
                <SettingsRow label={t('settings.rows.profileEdit')} onPress={onOpenProfileEdit} />
              ) : null}
              <SettingsRow
                label={t('settings.rows.accountInfo')}
                onPress={onOpenAccountManagement ?? (() => setPage('account'))}
                value={profile?.username}
              />
              <SettingsRow
                disabled={!canOpenTouristProfile}
                label={t('settings.rows.password')}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.PasswordChange)}
              />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.records')}>
              <SettingsRow
                label={t('settings.rows.footprintMap')}
                hint={t(`settings.details.${SETTINGS_DETAIL_IDS.FootprintMap}.description`)}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.FootprintMap)}
              />
              <SettingsRow
                label={t('settings.rows.favoritePlaces')}
                hint={t(`settings.details.${SETTINGS_DETAIL_IDS.SavedPlaces}.description`)}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.SavedPlaces)}
              />
              <SettingsRow
                label={t('settings.rows.myRecords')}
                hint={t(`settings.details.${SETTINGS_DETAIL_IDS.MyRecords}.description`)}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.MyRecords)}
              />
              <SettingsRow label={t('settings.account.items.coupons')} onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.Coupons)} />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.notifications')}>
              <SettingsRow
                label={t('settings.rows.notificationSettings')}
                onPress={onOpenNotificationSettings ?? (() => setPage('notifications'))}
              />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.preferences')}>
              <SettingsRow
                label={t('settings.appearance.section')}
                onPress={() => setPage('appearance')}
                value={t(appearanceValueKeys[preference])}
              />
              <SettingsRow
                label={t('settings.language.section')}
                onPress={() => setPage('language')}
                value={t(i18n.resolvedLanguage === 'ko'
                  ? 'settings.language.korean'
                  : 'settings.language.english')}
              />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.privacy')}>
              <SettingsRow label={t('settings.rows.locationSettings')} onPress={() => setPage('location')} />
              <SettingsRow
                label={t('settings.rows.dataManagement')}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.DataManagement)}
              />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.appInfo')}>
              <SettingsRow
                label={t('settings.rows.notices')}
                hint={t(`settings.details.${SETTINGS_DETAIL_IDS.Notices}.description`)}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.Notices)}
              />
              <SettingsRow
                label={t('settings.rows.terms')}
                hint={t(`settings.details.${SETTINGS_DETAIL_IDS.Terms}.description`)}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.Terms)}
              />
              <SettingsRow
                label={t('settings.rows.privacyPolicy')}
                hint={t(`settings.details.${SETTINGS_DETAIL_IDS.PrivacyPolicy}.description`)}
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.PrivacyPolicy)}
              />
              <SettingsRow label={t('settings.rows.version')} value="1.0.0" />
            </SettingsSection>

            <FooterActions>
              <FooterButton
                accessibilityLabel={t('settings.logout')}
                accessibilityRole="button"
                accessibilityState={{ busy: isLoggingOut, disabled: isLoggingOut }}
                disabled={isLoggingOut}
                onPress={() => void handleLogout()}
              >
                {isLoggingOut ? <ActivityIndicator color={theme.colors.textMuted} /> : <FooterLabel>{t('settings.logout')}</FooterLabel>}
              </FooterButton>
              <FooterButton
                accessibilityLabel={`${t('settings.deleteAccount')}, ${t('settings.pending.title')}`}
                accessibilityHint={t('settings.details.deleteAccount.description')}
                accessibilityState={{ disabled: false }}
                accessibilityRole="button"
                onPress={() => onOpenDetail(SETTINGS_DETAIL_IDS.DeleteAccount)}
              >
                <DangerLabel>{t('settings.deleteAccount')}</DangerLabel>
              </FooterButton>
            </FooterActions>
          </Content>
        </>
      ) : null}

      {page === 'location' ? (
        <LocationPrivacyScreen
          onBack={goBack}
        />
      ) : null}

      {page === 'language' ? (
        <LanguageSettingsScreen onBack={goBack} />
      ) : null}

      {page === 'appearance' ? (
        <AppearanceSettingsScreen onBack={goBack} />
      ) : null}

      {page === 'account' ? (
        <AccountManagementScreen onBack={goBack} onOpenDetail={onOpenDetail} onLogout={onLogout} />
      ) : null}
    </Screen>
  );
}

const CONTENT_CONTAINER_STYLE = { paddingBottom: 40 };

const Screen = styled(SafeAreaView)`
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
`;

const Content = styled.ScrollView.attrs({
  alwaysBounceVertical: false,
  keyboardShouldPersistTaps: 'handled',
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

const Header = styled.View`
  align-items: center;
  flex-direction: row;
  height: 56px;
  justify-content: space-between;
  padding: 0 16px;
`;

const HeaderTitle = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
`;

const HeaderSpacer = styled.View`
  height: 44px;
  width: 44px;
`;

const Section = styled.View`
  border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-bottom-width: 8px;
  padding: 16px 0;
`;

const SectionInner = styled.View`
  padding: 0 16px;
`;

const SectionTitle = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 16px;
  font-weight: 700;
  line-height: 23px;
  margin-bottom: 4px;
`;

const Row = styled.Pressable`
  align-items: center;
  flex-direction: row;
  min-height: 48px;
  justify-content: space-between;
  padding: 10px 0;
`;

const RowLabel = styled(AppText)<{ $destructive?: boolean; $disabled?: boolean }>`
  color: ${({ $destructive, $disabled, theme }) => (
    $destructive ? theme.colors.danger : $disabled ? theme.colors.textDisabled : theme.colors.textStrong
  )};
  flex-shrink: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
`;

const RowTrailing = styled.View`
  align-items: center;
  flex-direction: row;
  gap: 4px;
  margin-left: 12px;
  max-width: 55%;
`;

const RowValue = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 1;
  font-size: 14px;
  line-height: 20px;
`;

const FooterActions = styled.View`
  align-items: flex-start;
  gap: 4px;
  padding: 12px 16px 0;
`;

const FooterButton = styled.Pressable`
  align-items: flex-start;
  justify-content: center;
  min-height: 48px;
  width: 100%;
`;

const FooterLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

const DangerLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;
