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
      <VerificationIcon height={20} width={20} />
      <Label>{label}</Label>
    </Container>
  );
}

const Container = styled.Pressable`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  min-width: 116px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: 0 ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
  shadow-color: #101828;
  shadow-opacity: 0.18;
  shadow-radius: 8px;
  elevation: 5;
`;
const Label = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
