import { SkeletonGroup } from '../../../../../../shared/components/Skeleton';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';


/**
 * Holds a coupon slot while the coupon list loads, so the screen shows its shape
 * up front instead of a blank gap that fills in all at once.
 */
export default function CouponCardSkeleton() {
  const { t } = useTranslation();

  return (
    <Card
      testID="v2-coupon-card-skeleton"
    >
      <SkeletonGroup accessibilityLabel={t('myPage.couponBox.loading')}>
        <PlaceBar />
        <TitleRow>
          <IconBar />
          <TitleBar />
        </TitleRow>
        <DescriptionBar />
        <PeriodBar />
      </SkeletonGroup>
    </Card>
  );
}

const Card = styled.View`
  gap: 10px;
  padding: ${({ theme }) => theme.spacing.md - 4}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const PlaceBar = styled.View`
  width: 35%;
  height: 18px;
  margin-bottom: 10px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const IconBar = styled.View`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const TitleBar = styled.View`
  flex: 1;
  height: 18px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const DescriptionBar = styled.View`
  width: 70%;
  height: 16px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const PeriodBar = styled.View`
  width: 45%;
  height: 12px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.border};
`;
