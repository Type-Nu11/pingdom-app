import { Text as AppText } from '../../../../shared/components/Typography';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { HeaderBackButton } from '../../../../shared/components';
import { useForegroundPermission } from '../../../../shared/location/useForegroundPermission';
import type { ForegroundPermissionState } from '../../../../shared/location/foregroundPermission';
import DataExportScreen from './DataExportScreen';

type Props = { onBack: () => void };

function StatusRow({ label, description, state = 'unsupported' }: {
  label: string; description: string; state?: ForegroundPermissionState | 'unsupported';
}) {
  return <ToggleRow accessible accessibilityRole="text"
    accessibilityLabel={`${label}, ${description}`} accessibilityLiveRegion="polite"
    accessibilityState={{ busy: state === 'loading', disabled: state === 'unsupported' }}>
    <ToggleCopy>
      <RowLabel>{label}</RowLabel>
      <StatusDescription $state={state}>{description}</StatusDescription>
    </ToggleCopy>
  </ToggleRow>;
}

export default function LocationPrivacyScreen({ onBack }: Props) {
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    if (!exporting) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setExporting(false);
      return true;
    });
    return () => subscription.remove();
  }, [exporting]);
  if (exporting) return <DataExportScreen onBack={() => setExporting(false)} />;
  return <LocationPrivacyContent onBack={onBack} onExport={() => setExporting(true)} />;
}

function LocationPrivacyContent({ onBack, onExport }: Props & { onExport: () => void }) {
  const { t } = useTranslation();
  const { state, refresh, openSettings, settingsError, openingSettings } = useForegroundPermission();
  const permissionDescription = t(`settings.location.permissionStates.${state}`);
  const settingsAction = state === 'granted' || state === 'restricted' || state === 'unavailable';
  const action = settingsAction ? 'openSettings' : state === 'denied' ? 'request' : 'retry';
  return (
    <Container testID="v2-location-privacy-screen">
      <Header>
        <HeaderBackButton accessibilityLabel={t('settings.back')} onPress={onBack} />
        <HeaderTitle numberOfLines={1}>{t('settings.location.title')}</HeaderTitle>
        <HeaderSpacer />
      </Header>
      <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <InfoCard accessibilityRole="summary">
          <InfoText>{t('settings.location.description')}</InfoText>
        </InfoCard>
        <Section><SectionInner>
          <SectionTitle>{t('settings.location.locationSection')}</SectionTitle>
          <StatusRow label={t('settings.location.device')} description={permissionDescription} state={state} />
          {state !== 'loading' ? <Row accessibilityRole="button"
            accessibilityLabel={t(`settings.location.${action}`)}
            accessibilityState={{ disabled: openingSettings, busy: openingSettings }} disabled={openingSettings}
            onPress={() => { void (settingsAction ? openSettings() : refresh(state === 'denied')); }}>
            <ActionLabel>{t(`settings.location.${action}`)}</ActionLabel>
          </Row> : null}
          {settingsError ? <StatusDescription $state="error" accessibilityRole="alert">
            {t('settings.location.settingsError')}
          </StatusDescription> : null}
          <RowDescription>{t('settings.location.permissionNotice')}</RowDescription>
          <StatusRow label={t('settings.location.foreground')} description={t('settings.location.foregroundDescription')} />
          <StatusRow label={t('settings.location.verification')} state={state}
            description={t(`settings.location.capability.${state}`)} />
        </SectionInner></Section>
        <Section><SectionInner>
          <SectionTitle>{t('settings.location.visibilitySection')}</SectionTitle>
          <StatusRow label={t('settings.rows.footprintMap')} description={t('settings.location.footprintDescription')} />
          <StatusRow label={t('settings.location.profileVisibility')} description={t('settings.location.visibilityDescription')} />
          <StatusRow label={t('settings.location.nickname')} description={t('settings.location.nicknameDescription')} />
        </SectionInner></Section>
        <Section><SectionInner>
          <SectionTitle>{t('settings.location.dataSection')}</SectionTitle>
          <Row accessibilityRole="button" accessibilityLabel={t('settings.location.download')}
            accessibilityState={{ disabled: false }} onPress={onExport}>
            <ToggleCopy><ActionLabel>{t('settings.location.download')}</ActionLabel>
              <RowDescription>{t('settings.location.downloadDescription')}</RowDescription></ToggleCopy>
          </Row>
          <StatusRow label={t('settings.rows.privacyPolicy')} description={t('settings.location.policyDescription')} />
          <StatusRow label={t('settings.location.deleteHistory')} description={t('settings.location.deleteDescription')} />
        </SectionInner></Section>
      </Content>
    </Container>
  );
}

const CONTENT_CONTAINER_STYLE = { paddingBottom: 40 };

const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
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

const InfoText = styled(AppText)`
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

const SectionTitle = styled(AppText)`
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

const RowLabel = styled(AppText)<{ $destructive?: boolean }>`
  color: ${({ $destructive, theme }) => ($destructive ? theme.colors.danger : theme.colors.textStrong)};
  flex-shrink: 1;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
`;

const RowDescription = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 17px;
  margin-top: 2px;
`;


const ActionLabel = styled(RowLabel)`
  color: ${({ theme }) => theme.colors.primary};
`;
const StatusDescription = styled(RowDescription)<{ $state: ForegroundPermissionState | 'unsupported' }>`
  color: ${({ theme, $state }) => $state === 'error' ? theme.colors.danger
    : $state === 'granted' ? theme.colors.primary
      : $state === 'denied' || $state === 'restricted' || $state === 'unavailable'
        ? theme.colors.warning : theme.colors.textMuted};
`;
