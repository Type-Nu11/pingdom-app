import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import type { StatusTone } from '../../../shared/model';
import type { Reservation } from '../api/reservationApi';
import { getReservationStatusView } from '../model/reservationPresentation';

type Props = {
  onPress: () => void;
  reservation: Reservation;
};

export default function ReservationRecordCard({ onPress, reservation }: Props) {
  const { i18n, t } = useTranslation();
  const status = getReservationStatusView(reservation.status);
  const statusLabel = t(status.labelKey);
  const requestedAt = new Intl.DateTimeFormat(
    i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'ko-KR',
    { dateStyle: 'medium', timeStyle: 'short' },
  ).format(new Date(reservation.createdAt));

  return (
    <Card
      accessibilityHint={t('reservation.list.card.hint')}
      accessibilityLabel={t('reservation.list.card.label', {
        id: reservation.id,
        status: statusLabel,
      })}
      accessibilityRole="button"
      onPress={onPress}
      testID={`reservation-card-${reservation.id}`}
    >
      <TopRow>
        <ReservationNumber>{t('reservation.list.card.number', { id: reservation.id })}</ReservationNumber>
        <Status $tone={status.tone}>{`${status.symbol} ${statusLabel}`}</Status>
      </TopRow>
      <ProductRow>
        <ProductIcon><ProductIconText>{t('reservation.box.productIcon')}</ProductIconText></ProductIcon>
        <ProductType>{reservation.productType}</ProductType>
      </ProductRow>
      <Quantity>{t('reservation.list.card.quantityValue', { count: reservation.quantity })}</Quantity>
      <RequestedAt>{t('reservation.list.card.requestedAtValue', { value: requestedAt })}</RequestedAt>
    </Card>
  );
}

const Card = styled.Pressable`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ReservationNumber = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 700;
`;

const Status = styled.Text<{ $tone: StatusTone }>`
  color: ${({ $tone, theme }) => {
    if ($tone === 'error') return theme.colors.danger;
    if ($tone === 'success') return theme.colors.success;
    if ($tone === 'warning') return theme.colors.primary;
    return theme.colors.textMuted;
  }};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 700;
`;

const ProductRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ProductIcon = styled.View`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
`;

const ProductIconText = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 800;
`;

const ProductType = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 700;
`;

const Quantity = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const RequestedAt = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
