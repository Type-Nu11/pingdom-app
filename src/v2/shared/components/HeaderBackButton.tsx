import React from 'react';
import styled from 'styled-components/native';

import BackIcon from '../assets/icons/back.svg';

type HeaderBackButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
  testID?: string;
};

export function HeaderBackButton({ accessibilityLabel, onPress, testID }: HeaderBackButtonProps) {
  return (
    <Button
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      testID={testID}
    >
      <BackIcon height={84} style={ICON_STYLE} width={80} />
    </Button>
  );
}

const ICON_STYLE = { left: -18, position: 'absolute' as const, top: -20 };

const Button = styled.Pressable`
  width: 44px;
  height: 44px;
  overflow: visible;
  position: relative;
`;
