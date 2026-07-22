import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

type InputProps = {
  accessibilityHint?: string;
  errorMessage?: string;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  required?: boolean;
};

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  accessibilityHint,
  errorMessage,
  required = false,
}: InputProps) => {
  const errorId = `${label.replace(/\s+/g, '-').toLowerCase()}-error`;

  return (
    <View style={styles.container}>
      <Text nativeID={`${errorId}-label`} style={styles.label}>
        {label}{required ? ' *' : ''}
      </Text>
      <TextInput
        accessibilityHint={[accessibilityHint, errorMessage].filter(Boolean).join('. ') || undefined}
        accessibilityLabel={label}
        accessibilityValue={errorMessage ? { text: errorMessage } : undefined}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        style={[styles.input, errorMessage && styles.inputError]}
        value={value}
      />
      {errorMessage ? (
        <Text accessibilityLiveRegion="polite" nativeID={errorId} style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 48,
  },
  inputError: {
    borderColor: '#B42318',
    borderWidth: 2,
  },
  error: {
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Input;
