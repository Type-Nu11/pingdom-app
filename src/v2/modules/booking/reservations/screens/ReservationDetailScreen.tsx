import { Text as AppText } from '../../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import BackIcon from '../../../../../assets/v2/icons/header/back.svg';
import { useHeaderGlassIconColors } from '../../../../shared/components/headerGlassIcon';
import { ApiErrorState, LoadingState } from '../../../../shared/components';
import {
  formatReservationWindow,
  maskBookerName,
  maskBookerPhone,
} from '../model/reservationBooker';
import { getReservationStatusView } from '../model/reservationPresentation';
import { useReservationDetail } from '../hooks/useReservations';

type ReservationDetailScreenProps = {
  onBack: () => void;
  reservationId: number;
};

export default function ReservationDetailScreen({
  onBack,
  reservationId,
}: ReservationDetailScreenProps) {
  const { i18n, t } = useTranslation();
  const headerIconColors = useHeaderGlassIconColors();
  const reservationQuery = useReservationDetail(reservationId);

  if (reservationQuery.isPending) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState variant="reservation-detail" description={t('reservation.detail.loading')} fill />
      </Screen>
    );
  }

  if (reservationQuery.isError && !reservationQuery.data) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ApiErrorState
          busy={reservationQuery.isFetching} error={reservationQuery.error}
          fill
          onBack={onBack}
          onRetry={() => reservationQuery.refetch({ cancelRefetch: false })}
        />
      </Screen>
    );
  }

  const reservation = reservationQuery.data;
  const reservationStatus = getReservationStatusView(reservation.status);
  const language = i18n.resolvedLanguage ?? i18n.language;
  const reservationWindow = formatReservationWindow(reservation, language);
  const maskedBookerName = maskBookerName(reservation.bookerName);
  const maskedBookerPhone = maskBookerPhone(reservation.bookerPhone);

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton
          accessibilityLabel={t('reservation.common.back')}
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
        >
          <BackIcon {...headerIconColors} width={44} height={44} />
        </BackButton>
        <Title accessibilityRole="header">{t('reservation.detail.title')}</Title>
        <HeaderSpacer />
      </Header>
      <Content>
        {reservationQuery.isError ? <ApiErrorState error={reservationQuery.error} busy={reservationQuery.isFetching} onRetry={() => reservationQuery.refetch({ cancelRefetch: false })} /> : null}
        <Card>
          <Eyebrow>{t('reservation.detail.identifier')}</Eyebrow>
          <ReservationId>{reservation.id}</ReservationId>
          <Divider />
          <Field>
            <Eyebrow>{t('reservation.detail.status')}</Eyebrow>
            <Value testID="v2-reservation-detail-status">
              {`${reservationStatus.symbol} ${t(reservationStatus.labelKey)}`}
            </Value>
          </Field>
          <Field>
            <Eyebrow>{t('reservation.detail.quantity')}</Eyebrow>
            <Value>{reservation.quantity}</Value>
          </Field>
          <Field>
            <Eyebrow>{t('reservation.detail.reservationWindow')}</Eyebrow>
            <Value testID="v2-reservation-detail-window">
              {reservationWindow ?? t('reservation.detail.windowPending')}
            </Value>
          </Field>
          <Field>
            <Eyebrow>{t('reservation.detail.bookerName')}</Eyebrow>
            <Value testID="v2-reservation-detail-booker-name">
              {maskedBookerName ?? t('reservation.detail.bookerHidden')}
            </Value>
          </Field>
          <Field>
            <Eyebrow>{t('reservation.detail.bookerPhone')}</Eyebrow>
            <Value testID="v2-reservation-detail-booker-phone">
              {maskedBookerPhone ?? t('reservation.detail.bookerHidden')}
            </Value>
          </Field>
          <Field>
            <Eyebrow>{t('reservation.detail.requestNote')}</Eyebrow>
            <Value testID="v2-reservation-detail-request-note">
              {reservation.requestNote?.trim()
                ? reservation.requestNote
                : t('reservation.detail.noRequestNote')}
            </Value>
          </Field>
        </Card>
      </Content>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const BackButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const Title = styled(AppText)`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  text-align: center;
`;

const HeaderSpacer = styled.View`
  width: ${({ theme }) => theme.spacing.xxl}px;
`;

const Content = styled.ScrollView.attrs({ contentContainerStyle: { flexGrow: 1 } })`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Card = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Eyebrow = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const ReservationId = styled(AppText)`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
`;

const Divider = styled.View`
  height: 1px;
  margin: ${({ theme }) => theme.spacing.xs}px 0;
  background-color: ${({ theme }) => theme.colors.border};
`;

const Field = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Value = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
