import React from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useAllPayments } from '../../payments/hooks/usePayments';
import { ApiErrorState, EmptyState, LoadingState } from '../../../shared/components';
import { useReservationDetail } from '../hooks/useReservations';

type ReservationDetailScreenProps = {
  onBack: () => void;
  reservationId: number;
};

export default function ReservationDetailScreen({
  onBack,
  reservationId,
}: ReservationDetailScreenProps) {
  const { t } = useTranslation();
  const reservationQuery = useReservationDetail(reservationId);
  const paymentsQuery = useAllPayments();

  if (reservationQuery.isPending) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <LoadingState description={t('reservation.detail.loading')} fill />
      </Screen>
    );
  }

  if (reservationQuery.isError) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <ApiErrorState
          error={reservationQuery.error}
          fill
          onBack={onBack}
          onRetry={() => void reservationQuery.refetch()}
        />
      </Screen>
    );
  }

  const reservation = reservationQuery.data;
  const linkedPayments = paymentsQuery.data?.filter(
    (payment) => payment.reservationId === reservation.id,
  ) ?? [];

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']}>
      <Header>
        <BackButton
          accessibilityLabel={t('reservation.common.back')}
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
        >
          <BackText>‹</BackText>
        </BackButton>
        <Title accessibilityRole="header">{t('reservation.detail.title')}</Title>
        <HeaderSpacer />
      </Header>
      <Content>
        <Card>
          <Eyebrow>{t('reservation.detail.identifier')}</Eyebrow>
          <ReservationId>{reservation.id}</ReservationId>
          <Divider />
          <Field>
            <Eyebrow>{t('reservation.detail.status')}</Eyebrow>
            <Value>{reservation.status}</Value>
          </Field>
          <Field>
            <Eyebrow>{t('reservation.detail.productType')}</Eyebrow>
            <Value>{reservation.productType}</Value>
          </Field>
          <Field>
            <Eyebrow>{t('reservation.detail.quantity')}</Eyebrow>
            <Value>{reservation.quantity}</Value>
          </Field>
          <Divider />
          <NoticeTitle>{t('reservation.detail.payments')}</NoticeTitle>
          {paymentsQuery.isPending ? (
            <LoadingState description={t('reservation.detail.paymentsLoading')} />
          ) : paymentsQuery.isError ? (
            <ApiErrorState
              error={paymentsQuery.error}
              onRetry={() => void paymentsQuery.refetch()}
            />
          ) : linkedPayments.length === 0 ? (
            <EmptyState
              description={t('reservation.detail.paymentsEmptyDescription')}
              title={t('reservation.detail.paymentsEmptyTitle')}
            />
          ) : linkedPayments.map((payment) => (
            <PaymentCard key={payment.id}>
              <PaymentHeader>
                <Value>{t('reservation.detail.paymentIdentifier', { id: payment.id })}</Value>
                <PaymentStatus>{payment.status}</PaymentStatus>
              </PaymentHeader>
              <Notice>
                {t('reservation.detail.paymentAmount', {
                  value: formatServerAmount(payment.amountMinor, payment.currency),
                })}
              </Notice>
              <Notice>{t('reservation.detail.paymentProvider', { value: payment.provider })}</Notice>
              {payment.failureCode ? (
                <Notice>{t('reservation.detail.paymentFailure', { value: payment.failureCode })}</Notice>
              ) : null}
            </PaymentCard>
          ))}
        </Card>
      </Content>
    </Screen>
  );
}

function formatServerAmount(amountMinor: number | null, currency: string | null): string {
  if (amountMinor === null || currency === null) return '—';
  return `${amountMinor} ${currency}`;
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
  width: ${({ theme }) => theme.spacing.xxl}px;
  height: ${({ theme }) => theme.spacing.xxl}px;
  align-items: center;
  justify-content: center;
`;

const BackText = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const Title = styled.Text`
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

const Eyebrow = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const ReservationId = styled.Text`
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

const Value = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const PaymentCard = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const PaymentHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PaymentStatus = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const NoticeTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;

const Notice = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;
