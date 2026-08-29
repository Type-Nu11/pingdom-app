import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import GlobeIcon from '../../../../assets/v2/icons/place/Group.svg';
import ParkingIcon from '../../../../assets/v2/icons/place/Park.svg';
import type { MerchantStoreFeature } from '../model/types';

type StoreFeatureBadgeProps = {
  feature: MerchantStoreFeature;
};

const ICON_BY_FEATURE = {
  englishSupport: GlobeIcon,
  parking: ParkingIcon,
} as const;

export default function StoreFeatureBadge({ feature }: StoreFeatureBadgeProps) {
  const { t } = useTranslation();
  const Icon = ICON_BY_FEATURE[feature];

  return (
    <Badge>
      <IconCircle>
        <Icon height={28} width={28} />
      </IconCircle>
      <Caption numberOfLines={1}>{t(`merchantMyPage.store.features.${feature}`)}</Caption>
    </Badge>
  );
}

const Badge = styled.View`
  align-items: center;
  gap: 4px;
`;

const IconCircle = styled.View`
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: #f2f2f3;
`;

const Caption = styled.Text`
  color: #5e5e66;
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;
