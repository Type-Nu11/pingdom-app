import React, { useRef, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import VerificationIcon from '../../../../assets/v2/icons/place/gamju.svg';

type Props = {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function VisitVerificationMapCta({ label, onPress, style }: Props) {
  const navigationLocked = useRef(false);
  const [locked, setLocked] = useState(false);

  return (
    <Container
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      disabled={locked}
      onPress={() => {
        if (navigationLocked.current) return;
        navigationLocked.current = true;
        setLocked(true);
        onPress();
      }}
      style={style}
      testID="visit-verification-map-cta"
    >
      <VerificationIcon height={24} width={24} />
      <Label>{label}</Label>
    </Container>
  );
}

const Container = styled.Pressable`
  min-height: 44px;
  min-width: 108px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
  shadow-color: #101828;
  shadow-opacity: 0.14;
  shadow-radius: 6px;
  elevation: 3;
`;
const Label = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 16px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
