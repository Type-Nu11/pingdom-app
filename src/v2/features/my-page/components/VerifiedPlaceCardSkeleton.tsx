import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

const CARD_WIDTH = 177;
const CARD_HEIGHT = 222;
const PULSE_DURATION_MS = 750;

/**
 * Holds a verified place slot while its place detail loads, so the list keeps a
 * fixed order instead of collapsing to a shorter list and reshuffling as each
 * query resolves.
 */
export default function VerifiedPlaceCardSkeleton() {
  const { t } = useTranslation();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: PULSE_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <Card
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
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
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
