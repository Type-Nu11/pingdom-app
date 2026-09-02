import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import { Button } from '../../../shared/components';
import { useVisitVerificationSessionController } from '../hooks/useVisitVerificationSessionController';

type Props = {
  onBack: () => void;
  onWriteReview: (selection: { checkInId: number; placeId: number }) => void;
  placeId: number;
};

export default function VisitVerificationSessionScreen({ onBack, onWriteReview, placeId }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const controller = useVisitVerificationSessionController(placeId);
  const { session } = controller;
  const completed = session?.status === 'COMPLETED' && session.completedCheckInId != null;
  const completionMissing = session?.status === 'COMPLETED' && session.completedCheckInId == null;
  const statusKey = session?.status ? `visitVerification.session.status.${session.status}` : null;

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
          {completionMissing ? t('visitVerification.session.completionMissing')
            : controller.phase === 'idle' ? t('visitVerification.session.ready')
            : controller.phase === 'locating' ? t('visitVerification.session.locating')
              : controller.phase === 'starting' ? t('visitVerification.session.starting')
                : controller.phase === 'permission-denied' ? t('visitVerification.session.permissionDenied')
                  : controller.phase === 'location-failed' ? t('visitVerification.session.locationAccuracy')
                    : controller.phase === 'proximity-lost' ? t('visitVerification.session.status.PROXIMITY_LOST')
                      : controller.phase === 'rejected' ? t('visitVerification.session.status.REJECTED')
                        : controller.phase === 'paused' ? t('visitVerification.session.foregroundBlocked')
                          : controller.phase === 'error' ? t('visitVerification.session.networkError')
                            : statusKey ? t(statusKey) : t('visitVerification.session.progress')}
        </State>
        {session ? (
          <Metrics>
            <Metric>{t('visitVerification.session.remaining', { count: controller.displayRemainingSeconds ?? session.remainingSeconds ?? 0 })}</Metric>
            <Metric>{t('visitVerification.session.radius', { value: session.requiredRadiusMeters ?? '-' })}</Metric>
            <Metric>{t('visitVerification.session.dwell', { value: session.requiredDwellSeconds ?? '-' })}</Metric>
            {session.latestDistanceMeters !== undefined ? <Metric>{t('visitVerification.session.distance', { value: session.latestDistanceMeters })}</Metric> : null}
          </Metrics>
        ) : null}
        {controller.phase === 'idle' ? (
          <Button disabled={controller.isBusy} label={t('visitVerification.session.start')} onPress={() => void controller.start()} />
        ) : controller.phase === 'error' || controller.phase === 'location-failed' ? (
          <Button disabled={controller.isBusy} label={t('visitVerification.retry')} onPress={() => void controller.retry()} />
        ) : null}
        {completed && session?.reviewEligible ? (
          <Button
            label={t('visitVerification.session.writeReview')}
            onPress={() => onWriteReview({ checkInId: session.completedCheckInId!, placeId })}
          />
        ) : completed ? <State>{t('visitVerification.session.reviewUnavailable')}</State> : null}
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
