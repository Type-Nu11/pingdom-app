import React from 'react';
import styled from 'styled-components/native';

import Button from '../../../shared/components/Button';
import type { CouponStatus } from '../../offers-coupons';
import CouponIcon from '../../../shared/assets/icons/coupon.svg';

export type CouponCardProps = {
  title: string;
  description: string;
  status: CouponStatus;
  statusLabel: string;
  issuedLabel: string;
  expiryLabel: string;
  redeemedLabel?: string;
  usable: boolean;
  useCtaLabel: string;
  unusableLabel: string;
  onUse?: () => void;
  onPress?: () => void;
};

/**
 * A single coupon in the box: benefit name next to its ticket badge, a status
 * chip, the issued / expiry (and redemption) instants, and — only for a usable
 * `ISSUED` coupon — a CTA into the present flow. Terminal states say so in text
 * instead of offering an action. The full coupon code is never shown here.
 */
export default function CouponCard({
  title,
  description,
  status,
  statusLabel,
  issuedLabel,
  expiryLabel,
  redeemedLabel,
  usable,
  useCtaLabel,
  unusableLabel,
  onUse,
  onPress,
}: CouponCardProps) {
  return (
    <Card
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      testID="v2-coupon-card"
    >
      <HeaderRow>
        <IconBadge $muted={!usable}>
          {/* coupon.svg is a 22×16 ticket — keep that ratio so it is not stretched. */}
          <CouponIcon height={16} width={22} />
        </IconBadge>
        <Title numberOfLines={2}>{title}</Title>
        <StatusChip $status={status}>
          <StatusChipText $status={status}>{statusLabel}</StatusChipText>
        </StatusChip>
      </HeaderRow>

      <Description numberOfLines={2}>{description}</Description>

      <MetaBlock>
        <Meta numberOfLines={1}>{issuedLabel}</Meta>
        <Meta numberOfLines={1}>{expiryLabel}</Meta>
        {redeemedLabel ? <Meta numberOfLines={1}>{redeemedLabel}</Meta> : null}
      </MetaBlock>

      {usable ? (
        <Button
          fullWidth
          label={useCtaLabel}
          onPress={onUse}
          size="medium"
          testID="v2-coupon-card-use"
        />
      ) : (
        <UnusableText testID="v2-coupon-card-unusable">{unusableLabel}</UnusableText>
      )}
    </Card>
  );
}

const Card = styled.Pressable`
  gap: 10px;
  padding: ${({ theme }) => theme.spacing.md - 4}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  overflow: hidden;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const IconBadge = styled.View<{ $muted: boolean }>`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ $muted, theme }) => (
    $muted ? theme.colors.surfacePressed : theme.colors.primaryRange
  )};
`;

const Title = styled.Text`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 700;
`;

const StatusChip = styled.View<{ $status: CouponStatus }>`
  padding: 3px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $status, theme }) => (
    $status === 'ISSUED' ? theme.colors.primarySoft : theme.colors.surfacePressed
  )};
`;

const StatusChipText = styled.Text<{ $status: CouponStatus }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $status, theme }) => (
    $status === 'ISSUED' ? theme.colors.primary : theme.colors.textMuted
  )};
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
`;

const MetaBlock = styled.View`
  gap: 2px;
`;

const Meta = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  font-weight: 500;
`;

const UnusableText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 13px;
  font-weight: 600;
  padding-top: ${({ theme }) => theme.spacing.xs}px;
`;
