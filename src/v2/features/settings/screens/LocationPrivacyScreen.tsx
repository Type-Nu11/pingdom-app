import React, { useCallback } from 'react';
import { Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import BackIcon from '../../../shared/assets/icons/back.svg';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-24.svg';

export type LocationPermissionPresentationState =
  | 'denied'
  | 'granted'
  | 'notConnected'
  | 'restricted';

type LocationPrivacyScreenProps = {
  onBack: () => void;
  permissionState?: LocationPermissionPresentationState;
};

type LocationToggleRowProps = {
  description: string;
  label: string;
  value?: boolean;
};

function LocationToggleRow({ description, label, value = false }: LocationToggleRowProps) {
  return (
    <ToggleRow>
      <ToggleCopy>
        <RowLabel>{label}</RowLabel>
        <RowDescription>{description}</RowDescription>
      </ToggleCopy>
      <Switch
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled: true }}
        disabled
        ios_backgroundColor="#E4E4E5"
        thumbColor="#FFFFFF"
        trackColor={{ false: '#E4E4E5', true: '#FF1956' }}
        value={value}
      />
    </ToggleRow>
  );
}

type NavigationRowProps = {
  destructive?: boolean;
  label: string;
  onPress: () => void;
  value?: string;
};

function NavigationRow({ destructive = false, label, onPress, value }: NavigationRowProps) {
  return (
    <Row accessibilityLabel={label} accessibilityRole="button" onPress={onPress}>
      <RowLabel $destructive={destructive}>{label}</RowLabel>
      <RowTrailing>
        {value ? <RowValue>{value}</RowValue> : null}
        <ChevronIcon height={20} width={20} />
      </RowTrailing>
    </Row>
  );
}

export default function LocationPrivacyScreen({
  onBack,
  permissionState = 'notConnected',
}: LocationPrivacyScreenProps) {
  const { t } = useTranslation();
  const permissionGranted = permissionState === 'granted';
  const permissionDescription = t(`settings.location.permissionStates.${permissionState}`);

  const showUnavailable = useCallback((title: string) => {
    Alert.alert(title, t('settings.location.notConnectedDescription'), [
      { text: t('settings.location.confirm') },
    ]);
  }, [t]);

  const showDeleteSafety = useCallback(() => {
    Alert.alert(
      t('settings.location.deleteSafetyTitle'),
      t('settings.location.deleteSafetyDescription'),
      [{ style: 'cancel', text: t('settings.location.confirm') }],
    );
  }, [t]);

  return (
    <Container testID="v2-location-privacy-screen">
      <Header>
        <HeaderBack
          accessibilityLabel={t('settings.back')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
        >
          <BackIcon height={84} style={BACK_ICON_STYLE} width={80} />
        </HeaderBack>
        <HeaderTitle numberOfLines={1}>{t('settings.location.title')}</HeaderTitle>
        <HeaderSpacer />
      </Header>

      <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <InfoCard accessibilityRole="summary">
          <InfoText>{t('settings.location.description')}</InfoText>
        </InfoCard>

        <Section>
          <SectionInner>
            <SectionTitle>{t('settings.location.locationSection')}</SectionTitle>
            <LocationToggleRow
              description={permissionDescription}
              label={t('settings.location.device')}
              value={permissionGranted}
            />
            <LocationToggleRow
              description={t('settings.location.foregroundDescription')}
              label={t('settings.location.foreground')}
            />
            <LocationToggleRow
              description={t('settings.location.verificationDescription')}
              label={t('settings.location.verification')}
            />
            <ConnectionNotice accessibilityRole="alert">
              <ConnectionNoticeText>{t('settings.location.permissionNotice')}</ConnectionNoticeText>
            </ConnectionNotice>
          </SectionInner>
        </Section>

        <Section>
          <SectionInner>
            <SectionTitle>{t('settings.location.visibilitySection')}</SectionTitle>
            <NavigationRow
              label={t('settings.rows.footprintMap')}
              onPress={() => showUnavailable(t('settings.rows.footprintMap'))}
              value={t('settings.values.notConnected')}
            />
            <NavigationRow
              label={t('settings.location.profileVisibility')}
              onPress={() => showUnavailable(t('settings.location.profileVisibility'))}
              value={t('settings.values.notConnected')}
            />
            <LocationToggleRow
              description={t('settings.location.nicknameDescription')}
              label={t('settings.location.nickname')}
            />
          </SectionInner>
        </Section>

        <Section>
          <SectionInner>
            <SectionTitle>{t('settings.location.dataSection')}</SectionTitle>
            <NavigationRow
              label={t('settings.location.download')}
              onPress={() => showUnavailable(t('settings.location.download'))}
            />
            <NavigationRow
              label={t('settings.rows.privacyPolicy')}
              onPress={() => showUnavailable(t('settings.rows.privacyPolicy'))}
            />
            <NavigationRow
              destructive
              label={t('settings.location.deleteHistory')}
              onPress={showDeleteSafety}
            />
          </SectionInner>
        </Section>
      </Content>
    </Container>
  );
}

const BACK_ICON_STYLE = { left: -18, position: 'absolute' as const, top: -20 };
const CONTENT_CONTAINER_STYLE = { paddingBottom: 40 };

const Container = styled.View`
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

const Content = styled.ScrollView.attrs({
  alwaysBounceVertical: false,
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

const InfoCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
  border-radius: 12px;
  margin: 0 16px 8px;
  padding: 14px 16px;
`;

const InfoText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  line-height: 19px;
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

const ToggleRow = styled.View`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  min-height: 72px;
  padding: 8px 0;
`;

const ToggleCopy = styled.View`
  flex: 1;
  margin-right: 16px;
`;

const Row = styled.Pressable`
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  min-height: 64px;
  padding: 10px 0;
`;

const RowLabel = styled.Text<{ $destructive?: boolean }>`
  color: ${({ $destructive, theme }) => ($destructive ? theme.colors.danger : theme.colors.textStrong)};
  flex-shrink: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
`;

const RowDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 17px;
  margin-top: 2px;
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
  font-size: 14px;
  line-height: 20px;
`;

const ConnectionNotice = styled.View`
  background-color: ${({ theme }) => theme.colors.warningSoft};
  border-radius: 10px;
  margin-top: 4px;
  padding: 10px 12px;
`;

const ConnectionNoticeText = styled.Text`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 12px;
  line-height: 18px;
`;
