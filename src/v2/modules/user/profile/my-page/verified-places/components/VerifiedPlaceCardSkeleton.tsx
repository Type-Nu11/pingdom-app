import React from 'react';
import { Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { useSharedPulse } from '../../../../../../shared/hooks/useSharedPulse';

import { VERIFIED_PLACE_CARD_WIDTH, VERIFIED_PLACE_CARD_HEIGHT } from '../model/verifiedPlaceLayout';

/**
 * Holds a verified place slot while its place detail loads, so the list keeps a
 * fixed order instead of collapsing to a shorter list and reshuffling as each
 * query resolves.
 */
export default function VerifiedPlaceCardSkeleton({ width = VERIFIED_PLACE_CARD_WIDTH }: { width?: number }) {
  const { t } = useTranslation();
  const opacity = useSharedPulse();

  return (
    <Card
      style={{ width }}
      accessibilityLabel={t('myPage.verifiedPlaces.loading')}
      accessibilityRole="progressbar"
      testID="v2-verified-place-card-skeleton"
    >
      <Animated.View style={{ opacity }}>
        <Overlay>
          <NameBar />
          <AddressBar />
        </Overlay>
      </Animated.View>
    </Card>
  );
}

const Card = styled.View`
  height: ${VERIFIED_PLACE_CARD_HEIGHT}px;
  flex-grow: 0;
  flex-shrink: 0;
  justify-content: flex-end;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Overlay = styled.View`
  gap: 6px;
  padding: 0 ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.sm}px;
`;

const NameBar = styled.View`
  width: 70%;
  height: 16px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const AddressBar = styled.View`
  width: 45%;
  height: 12px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme }) => theme.colors.border};
`;
