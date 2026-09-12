import { Text as AppText } from '../../../shared/components/Typography';
import React, { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import VerificationIcon from '../../../../assets/v2/icons/place/gamju.svg';

type Props = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const NAVIGATION_LOCK_MS = 500;

export default function VisitVerificationMapCta({ label, onPress, style }: Props) {
  const navigationLocked = useRef(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (unlockTimer.current) clearTimeout(unlockTimer.current);
  }, []);

  return (
    <Container
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={() => {
        if (navigationLocked.current) return;
        navigationLocked.current = true;
        unlockTimer.current = setTimeout(() => {
          navigationLocked.current = false;
          unlockTimer.current = null;
        }, NAVIGATION_LOCK_MS);
        onPress();
      }}
      style={[{ boxShadow: 'inset 0px 4px 20px 0px rgba(0, 0, 0, 0.10)' }, style]}
      testID="visit-verification-map-cta"
    >
      <VerificationIcon height={24} width={24} />
      <Label>{label}</Label>
    </Container>
  );
}

const Container = styled.Pressable`
  height: 48px;
  min-width: 120px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 18px;
  border-radius: 24px;
  background-color: rgba(255, 25, 86, 0.8064);
`;
const Label = styled(AppText)`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 16px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
