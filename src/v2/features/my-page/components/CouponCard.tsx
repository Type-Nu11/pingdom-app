import React from 'react';
import styled from 'styled-components/native';

import CouponIcon from '../../../shared/assets/icons/coupon.svg';

export type CouponCardProps = {
  /** Omitted while the place is unknown — a placeholder store name would misread as real. */
  placeName?: string;
  title: string;
  description: string;
  /** Validity period, already localized. */
  periodText: string;
  /** A coupon that can no longer be used is dimmed so the list reads at a glance. */
  muted: boolean;
  /** Localized server status. It remains visible so status is never conveyed by color alone. */
  statusText: string;
  onPress?: () => void;
};

/**
 * A single coupon in the box: issuing place, benefit name next to its ticket
 * badge, the benefit line, and the validity period. The full coupon code is
 * never shown here — it belongs to the detail screen.
 */
export default function CouponCard({
  placeName,
  title,
  description,
  periodText,
  muted,
  statusText,
  onPress,
}: CouponCardProps) {
  return (
    <Card
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      testID="v2-coupon-card"
    >
      {placeName ? <PlaceName numberOfLines={1}>{placeName}</PlaceName> : null}
      <Body>
        <TitleRow>
          <IconBadge $muted={muted}>
            {/* coupon.svg is a 22×16 ticket — keep that ratio so it is not stretched. */}
            <CouponIcon height={16} width={22} />
          </IconBadge>
          <Title numberOfLines={2}>{title}</Title>
        </TitleRow>
        <Description numberOfLines={2}>{description}</Description>
        <MetaRow>
          <Period numberOfLines={1} testID="v2-coupon-card-period">{periodText}</Period>
          <StatusBadge $muted={muted}>
            <StatusText $muted={muted} testID="v2-coupon-card-status">{statusText}</StatusText>
          </StatusBadge>
        </MetaRow>
      </Body>
    </Card>
  );
}

const Card = styled.Pressable<{ disabled?: boolean }>`
  gap: 10px;
  padding: ${({ theme }) => theme.spacing.md - 4}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  overflow: hidden;
`;

const PlaceName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 700;
`;

const Body = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const TitleRow = styled.View`
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

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
`;

const MetaRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Period = styled.Text`
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  font-weight: 500;
`;

const StatusBadge = styled.View<{ $muted: boolean }>`
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $muted, theme }) => (
    $muted ? theme.colors.surfacePressed : theme.colors.successSoft
  )};
`;

const StatusText = styled.Text<{ $muted: boolean }>`
  color: ${({ $muted, theme }) => ($muted ? theme.colors.textMuted : theme.colors.success)};
  font-size: 12px;
  font-weight: 600;
`;
