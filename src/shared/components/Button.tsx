import React, { useEffect } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

type ButtonProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  label: string;
  loadingAnnouncement?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

const Button = ({
  accessibilityHint,
  accessibilityLabel,
  label,
  loadingAnnouncement,
  onPress,
  disabled = false,
  loading = false,
  labelStyle,
  style,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  useEffect(() => {
    if (loading && loadingAnnouncement) {
      AccessibilityInfo.announceForAccessibility(loadingAnnouncement);
    }
  }, [loading, loadingAnnouncement]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        style,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator accessibilityElementsHidden color={colors.background} />
      ) : (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
});

export default Button;
