import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

// Figma Setting/Toggle (5938:6145): 52×32 track with a 28px knob inset by 2px.
const TRACK_WIDTH = 52;
const KNOB_SIZE = 28;
const KNOB_INSET = 2;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

export type SettingToggleProps = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  isLoading?: boolean;
  onValueChange?: (value: boolean) => void;
  testID?: string;
  value?: boolean;
};

export function SettingToggle({
  accessibilityHint,
  accessibilityLabel,
  disabled = false,
  isLoading = false,
  onValueChange,
  testID,
  value,
}: SettingToggleProps) {
  const theme = useTheme();
  const enabled = value === true;
  const inactive = disabled || isLoading;
  const knobOffset = useRef(new Animated.Value(enabled ? KNOB_TRAVEL : 0)).current;

  useEffect(() => {
    Animated.timing(knobOffset, {
      duration: 160,
      easing: Easing.out(Easing.quad),
      toValue: enabled ? KNOB_TRAVEL : 0,
      useNativeDriver: true,
    }).start();
  }, [enabled, knobOffset]);

  return (
    <Track
      $enabled={enabled}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ busy: isLoading, checked: value, disabled: inactive }}
      disabled={inactive}
      hitSlop={8}
      onPress={() => { if (!inactive) onValueChange?.(!value); }}
      testID={testID}
    >
      <Knob
        style={{
          boxShadow: `0px 1px 3px 0px ${theme.colors.shadowKnob}`,
          transform: [{ translateX: knobOffset }],
        }}
        testID={testID ? `${testID}-knob` : undefined}
      >
        {isLoading ? (
          <ActivityIndicator color={enabled ? theme.colors.primary : theme.colors.textMuted} size="small" />
        ) : null}
      </Knob>
    </Track>
  );
}

const Track = styled.Pressable<{ $enabled: boolean }>`
  width: ${TRACK_WIDTH}px;
  height: 32px;
  flex-shrink: 0;
  justify-content: center;
  padding: ${KNOB_INSET}px;
  border-radius: 16px;
  background-color: ${({ $enabled, theme }) => ($enabled ? theme.colors.primary : theme.colors.border)};
`;

const Knob = styled(Animated.View)`
  width: ${KNOB_SIZE}px;
  height: ${KNOB_SIZE}px;
  align-items: center;
  justify-content: center;
  border-radius: ${KNOB_SIZE / 2}px;
  background-color: ${({ theme }) => theme.colors.staticWhite};
`;
