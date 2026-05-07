import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const Button = ({ label, onPress, disabled = false, loading = false }: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.label}>{label}</Text>}
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
  },
});

export default Button;
