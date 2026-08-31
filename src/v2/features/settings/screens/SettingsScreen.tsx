import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useProfile } from '../../my-page/hooks/useProfile';
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '../../notifications/hooks/useNotificationSettings';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import BackIcon from '../../../shared/assets/icons/back.svg';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-24.svg';
import LocationPrivacyScreen, {
  type LocationPermissionPresentationState,
} from './LocationPrivacyScreen';

type SettingsPage = 'account' | 'location' | 'notifications' | 'root';

export type SettingsScreenProps = {
  locationPermissionState?: LocationPermissionPresentationState;
  onBack: () => void;
  onLogout: () => Promise<void>;
  onOpenProfileEdit: () => void;
};

type RowProps = {
  accessibilityLabel?: string;
  destructive?: boolean;
  disabled?: boolean;
  label: string;
  onPress?: () => void;
  value?: string;
};

function SettingsRow({
  accessibilityLabel,
  destructive = false,
  disabled = false,
  label,
  onPress,
  value,
}: RowProps) {
  const actionable = Boolean(onPress) && !disabled;

  return (
    <Row
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole={actionable ? 'button' : 'text'}
      accessibilityState={actionable ? { disabled } : undefined}
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

type ToggleRowProps = {
  description?: string;
  disabled?: boolean;
  label: string;
  onValueChange?: (value: boolean) => void;
  value: boolean;
};

function ToggleRow({ description, disabled = false, label, onValueChange, value }: ToggleRowProps) {
  return (
    <ToggleContainer>
      <ToggleCopy>
        <RowLabel $disabled={disabled}>{label}</RowLabel>
        {description ? <ToggleDescription>{description}</ToggleDescription> : null}
      </ToggleCopy>
      <Switch
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        disabled={disabled}
        ios_backgroundColor="#E4E4E5"
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: '#E4E4E5', true: '#FF1956' }}
        value={value}
      />
    </ToggleContainer>
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
      <HeaderBack
        accessibilityLabel={t('settings.back')}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
      >
        <BackIcon height={84} style={BACK_ICON_STYLE} width={80} />
      </HeaderBack>
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
  locationPermissionState,
  onBack,
  onLogout,
  onOpenProfileEdit,
}: SettingsScreenProps) {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [page, setPage] = useState<SettingsPage>('root');
  const logoutLock = useRef(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const notificationsQuery = useNotificationSettings();
  const updateNotifications = useUpdateNotificationSettings();

  const goBack = useCallback(() => {
    if (page !== 'root') {
      setPage('root');
      return;
    }
    onBack();
  }, [onBack, page]);

  useEffect(() => {
    if (page === 'root') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setPage('root');
      return true;
    });
    return () => subscription.remove();
  }, [page]);

  const handleLogout = useCallback(async () => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      logoutLock.current = false;
      setIsLoggingOut(false);
    }
  }, [onLogout]);

  const updateNotificationSetting = useCallback((update: {
    newHotplaceEnabled?: boolean;
    newLikeEnabled?: boolean;
  }) => {
    if (updateNotifications.isPending) return;
    updateNotifications.mutate(update, {
      onError: () => Alert.alert(
        t('settings.notifications.updateFailedTitle'),
        t('settings.notifications.updateFailedDescription'),
      ),
    });
  }, [t, updateNotifications]);

  const setting = notificationsQuery.data;
  const notificationsDisabled = notificationsQuery.isLoading || updateNotifications.isPending;
  const allNotificationsEnabled = Boolean(setting?.newHotplaceEnabled && setting?.newLikeEnabled);
  const anyNotificationEnabled = Boolean(setting?.newHotplaceEnabled || setting?.newLikeEnabled);
  const notificationStatus = notificationsQuery.isLoading || notificationsQuery.isError
    ? undefined
    : t(anyNotificationEnabled ? 'settings.values.on' : 'settings.values.off');

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-settings-screen">
      {page === 'root' ? (
        <>
          <SettingsHeader onBack={goBack} title={t('settings.title')} />
          <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
            <SettingsSection title={t('settings.sections.account')}>
              <SettingsRow label={t('settings.rows.profileEdit')} onPress={onOpenProfileEdit} />
              <SettingsRow
                label={t('settings.rows.accountInfo')}
                onPress={() => setPage('account')}
                value={profile?.username}
              />
              <SettingsRow label={t('settings.rows.password')} onPress={onOpenProfileEdit} />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.records')}>
              <SettingsRow label={t('settings.rows.footprintMap')} value={t('settings.values.onlyMe')} />
              <SettingsRow label={t('settings.rows.favoritePlaces')} />
              <SettingsRow label={t('settings.rows.myRecords')} />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.notifications')}>
              <SettingsRow
                label={t('settings.rows.notificationSettings')}
                onPress={() => setPage('notifications')}
                value={notificationStatus}
              />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.privacy')}>
              <SettingsRow label={t('settings.rows.locationSettings')} onPress={() => setPage('location')} />
              <SettingsRow label={t('settings.rows.dataManagement')} />
            </SettingsSection>

            <SettingsSection title={t('settings.sections.appInfo')}>
              <SettingsRow label={t('settings.rows.notices')} />
              <SettingsRow label={t('settings.rows.terms')} />
              <SettingsRow label={t('settings.rows.privacyPolicy')} />
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
                {isLoggingOut ? <ActivityIndicator color="#767680" /> : <FooterLabel>{t('settings.logout')}</FooterLabel>}
              </FooterButton>
              <FooterButton disabled>
                <DangerLabel>{t('settings.deleteAccount')}</DangerLabel>
              </FooterButton>
            </FooterActions>
          </Content>
        </>
      ) : null}

      {page === 'notifications' ? (
        <>
          <SettingsHeader onBack={goBack} title={t('settings.notifications.title')} />
          <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
            {notificationsQuery.isError ? (
              <ErrorBanner accessibilityRole="alert">
                <ErrorText>{t('settings.notifications.loadFailed')}</ErrorText>
              </ErrorBanner>
            ) : null}
            <SettingsSection>
              <ToggleRow
                description={t('settings.notifications.pushAllDescription')}
                disabled={notificationsDisabled || notificationsQuery.isError}
                label={t('settings.notifications.pushAll')}
                onValueChange={(value) => updateNotificationSetting({
                  newHotplaceEnabled: value,
                  newLikeEnabled: value,
                })}
                value={allNotificationsEnabled}
              />
            </SettingsSection>
            <SettingsSection title={t('settings.notifications.recordsSection')}>
              <ToggleRow
                description={t('settings.notifications.hotplaceDescription')}
                disabled={notificationsDisabled || notificationsQuery.isError}
                label={t('settings.notifications.hotplace')}
                onValueChange={(value) => updateNotificationSetting({ newHotplaceEnabled: value })}
                value={Boolean(setting?.newHotplaceEnabled)}
              />
              <ToggleRow
                description={t('settings.notifications.likeDescription')}
                disabled={notificationsDisabled || notificationsQuery.isError}
                label={t('settings.notifications.like')}
                onValueChange={(value) => updateNotificationSetting({ newLikeEnabled: value })}
                value={Boolean(setting?.newLikeEnabled)}
              />
            </SettingsSection>
            <SettingsSection title={t('settings.notifications.otherSection')}>
              <ToggleRow
                description={t('settings.notifications.quietDescription')}
                disabled
                label={t('settings.notifications.quiet')}
                value={Boolean(setting?.quietHoursEnabled)}
              />
            </SettingsSection>
          </Content>
        </>
      ) : null}

      {page === 'location' ? (
        <LocationPrivacyScreen
          onBack={goBack}
          permissionState={locationPermissionState}
        />
      ) : null}

      {page === 'account' ? (
        <>
          <SettingsHeader onBack={goBack} title={t('settings.account.title')} />
          <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
            <AccountSummary>
              {profile?.profileImageUrl ? (
                <Avatar source={{ uri: profile.profileImageUrl }} />
              ) : (
                <AvatarPlaceholder height={48} width={48} />
              )}
              <AccountCopy>
                <AccountName numberOfLines={1}>{profile?.username ?? t('myPage.profileUnavailable')}</AccountName>
                {profile?.country ? (
                  <AccountCountry numberOfLines={1}>
                    {t(`countries.${profile.country.toLowerCase()}`, { defaultValue: profile.country })}
                  </AccountCountry>
                ) : null}
              </AccountCopy>
            </AccountSummary>
            <SettingsSection title={t('settings.account.loginSection')}>
              <SettingsRow label={t('settings.account.username')} value={profile?.username} />
              <SettingsRow label={t('settings.account.email')} value={profile?.email} />
              <SettingsRow label={t('settings.rows.password')} onPress={onOpenProfileEdit} />
            </SettingsSection>
            <SettingsSection>
              <FooterActions>
                <FooterButton
                  accessibilityLabel={t('settings.logout')}
                  accessibilityRole="button"
                  accessibilityState={{ busy: isLoggingOut, disabled: isLoggingOut }}
                  disabled={isLoggingOut}
                  onPress={() => void handleLogout()}
                >
                  <FooterLabel>{t('settings.logout')}</FooterLabel>
                </FooterButton>
                <FooterButton disabled>
                  <DangerLabel>{t('settings.deleteAccount')}</DangerLabel>
                </FooterButton>
                <DeleteDescription>{t('settings.account.deleteDescription')}</DeleteDescription>
              </FooterActions>
            </SettingsSection>
          </Content>
        </>
      ) : null}
    </Screen>
  );
}

const BACK_ICON_STYLE = { left: -18, position: 'absolute' as const, top: -20 };
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

const HeaderBack = styled.Pressable`
  height: 44px;
  overflow: visible;
  position: relative;
  width: 44px;
`;

const HeaderTitle = styled.Text`
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

const SectionTitle = styled.Text`
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

const RowLabel = styled.Text<{ $destructive?: boolean; $disabled?: boolean }>`
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

const RowValue = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 1;
  font-size: 14px;
  line-height: 20px;
`;

const ToggleContainer = styled.View`
  align-items: center;
  flex-direction: row;
  min-height: 64px;
  justify-content: space-between;
  padding: 8px 0;
`;

const ToggleCopy = styled.View`
  flex: 1;
  margin-right: 16px;
`;

const ToggleDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 17px;
  margin-top: 2px;
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

const FooterLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
`;

const DangerLabel = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;

const ErrorBanner = styled.View`
  background-color: ${({ theme }) => theme.colors.dangerSoft};
  margin: 8px 16px 0;
  padding: 12px;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
  line-height: 18px;
`;

const AccountSummary = styled.View`
  align-items: center;
  border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-bottom-width: 8px;
  flex-direction: row;
  padding: 8px 16px 16px;
`;

const Avatar = styled(Image)`
  border-radius: 24px;
  height: 48px;
  width: 48px;
`;

const AccountCopy = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const AccountName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 16px;
  font-weight: 700;
  line-height: 23px;
`;

const AccountCountry = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 18px;
`;

const DeleteDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 18px;
`;
