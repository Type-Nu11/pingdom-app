import React, { useEffect, useRef } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackIcon from '../../../../assets/v2/icons/header/back.svg';
import NoNearbyPlaceIcon from '../../../../assets/v2/icons/smRlavy.svg';
import { Button } from '../../../shared/components';
import {
  useVisitVerificationSessionController,
  type VisitVerificationSessionPhase,
} from '../hooks/useVisitVerificationSessionController';

const phaseTranslationKeys: Partial<Record<VisitVerificationSessionPhase, string>> = {
  'ambiguous-place': 'visitVerification.session.ambiguousPlace',
  error: 'visitVerification.session.serverError',
  'inactive-tourist': 'visitVerification.session.inactiveTourist',
  'invalid-observation': 'visitVerification.session.invalidObservation',
  idle: 'visitVerification.session.ready',
  locating: 'visitVerification.session.locating',
  'location-failed': 'visitVerification.session.locationFailed',
  'network-error': 'visitVerification.session.networkError',
  'no-place': 'visitVerification.session.noPlace',
  paused: 'visitVerification.session.foregroundBlocked',
  'permission-denied': 'visitVerification.session.permissionDenied',
  'proximity-lost': 'visitVerification.session.status.PROXIMITY_LOST',
  recovering: 'visitVerification.session.recovering',
  starting: 'visitVerification.session.starting',
  unauthenticated: 'visitVerification.session.unauthenticated',
};

type CommonProps = {
  onBack: () => void;
  onComplete: () => void;
};

type Props = CommonProps & (
  | { mode: 'foreground'; placeId?: never }
  | { mode?: 'place'; placeId: number }
);

export default function VisitVerificationSessionScreen({
  mode = 'place',
  onBack,
  onComplete,
  placeId,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const controller = useVisitVerificationSessionController(
    mode === 'foreground' ? { mode: 'foreground' } : { mode: 'place', placeId: placeId! },
  );
  const { session } = controller;
  const completed = session?.status === 'COMPLETED' &&
    session.completedCheckInId != null &&
    session.placeId != null;
  const completionMissing = session?.status === 'COMPLETED' && !completed;
  const completionHandled = useRef(false);
  const statusKey = session?.status ? `visitVerification.session.status.${session.status}` : null;
  const stateTranslationKey = completionMissing
    ? 'visitVerification.session.completionMissing'
    : phaseTranslationKeys[controller.phase] ?? statusKey ?? 'visitVerification.session.progress';
  const retryablePhase = [
    'ambiguous-place',
    'error',
    'inactive-tourist',
    'invalid-observation',
    'location-failed',
    'network-error',
    'no-place',
    'permission-denied',
    'proximity-lost',
    'unauthenticated',
  ].includes(controller.phase);

  useEffect(() => {
    if (mode === 'foreground' && controller.phase === 'idle') void controller.start();
  }, [controller.phase, controller.start, mode]);

  useEffect(() => {
    if (!completed || completionHandled.current) return;
    completionHandled.current = true;
    onComplete();
  }, [completed, onComplete]);

  if (mode === 'foreground' && controller.phase === 'no-place') {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <NoPlaceHeader>
          <NoPlaceBack accessibilityLabel={t('visitVerification.back')} accessibilityRole="button" onPress={onBack}>
            <BackIcon height={44} width={44} />
          </NoPlaceBack>
        </NoPlaceHeader>
        <NoPlaceContent accessibilityLiveRegion="polite" testID="visit-verification-foreground-no-place">
          <NoPlaceIconCircle>
            <NoNearbyPlaceIcon height={50} testID="visit-verification-foreground-no-place-icon" width={44} />
          </NoPlaceIconCircle>
          <NoPlaceTitle>{t('visitVerification.emptyTitle')}</NoPlaceTitle>
          <NoPlaceDescription>{t('visitVerification.emptyDescription')}</NoPlaceDescription>
          <NoPlaceAction>
            <Button fullWidth label={t('visitVerification.return')} onPress={onBack} shape="pill" />
          </NoPlaceAction>
        </NoPlaceContent>
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <Back accessibilityLabel={t('visitVerification.back')} accessibilityRole="button" onPress={onBack}>
          <BackText>‹</BackText>
        </Back>
        <Title accessibilityRole="header">{t('visitVerification.session.title')}</Title>
        <Spacer />
      </Header>
      <Content accessibilityLiveRegion="polite" testID="visit-verification-session">
        {controller.isBusy ? <ActivityIndicator color={theme.colors.primary} /> : null}
        <State accessibilityRole="text">
          {t(stateTranslationKey)}
        </State>
        {session ? (
          <Metrics>
            <Metric>{t('visitVerification.session.remaining', { count: session.remainingSeconds ?? 0 })}</Metric>
            <Metric>{t('visitVerification.session.radius', { value: session.requiredRadiusMeters ?? '-' })}</Metric>
            <Metric>{t('visitVerification.session.dwell', { value: session.requiredDwellSeconds ?? '-' })}</Metric>
            <Metric>{t('visitVerification.session.verifiedDwell', { value: session.verifiedDwellSeconds ?? '-' })}</Metric>
            {session.latestDistanceMeters !== undefined ? <Metric>{t('visitVerification.session.distance', { value: session.latestDistanceMeters })}</Metric> : null}
          </Metrics>
        ) : null}
        {controller.phase === 'idle' ? (
          <Button disabled={controller.isBusy} label={t('visitVerification.session.start')} onPress={() => void controller.start()} />
        ) : retryablePhase ? (
          <Button disabled={controller.isBusy} label={t('visitVerification.retry')} onPress={() => void controller.retry()} />
        ) : null}
      </Content>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 56px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const Back = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;
const BackText = styled.Text`color: ${({ theme }) => theme.colors.textStrong}; font-size: 36px;`;
const Title = styled.Text`flex: 1; text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: ${({ theme }) => theme.typography.title.fontWeight};`;
const Spacer = styled.View`width: 44px;`;
const Content = styled.View`flex: 1; justify-content: center; gap: ${({ theme }) => theme.spacing.lg}px; padding: ${({ theme }) => theme.spacing.lg}px;`;
const State = styled.Text`text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const Metrics = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const Metric = styled.Text`color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const NoPlaceHeader = styled.View`height: 64px; flex-direction: row; align-items: center; padding: 0 24px;`;
const NoPlaceBack = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background-color: rgba(255, 255, 255, 0.92);
  elevation: 2;
  shadow-color: #11151b;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.06;
  shadow-radius: 8px;
`;
const NoPlaceContent = styled.View`flex: 1; align-items: center; justify-content: center; padding: 24px; padding-bottom: 96px;`;
const NoPlaceIconCircle = styled.View`width: 96px; height: 96px; align-items: center; justify-content: center; margin-bottom: 28px; border-radius: 48px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const NoPlaceTitle = styled.Text`text-align: center; color: ${({ theme }) => theme.colors.textStrong}; font-size: 22px; font-weight: 800;`;
const NoPlaceDescription = styled.Text`max-width: 340px; margin-top: 16px; text-align: center; color: ${({ theme }) => theme.colors.textMuted}; font-size: 16px; line-height: 24px;`;
const NoPlaceAction = styled.View`position: absolute; right: 24px; bottom: 24px; left: 24px;`;
