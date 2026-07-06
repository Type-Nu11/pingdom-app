import React from 'react';
import {
    type KeyboardTypeOptions,
    TextInput,
    StyleSheet,
} from 'react-native';
import { colors } from '../../../styles/colors';
import { radius } from '../../../styles/radius';
import { spacing } from '../../../styles/spacing';

type InputProps = {
    value: string;
    onChangeText: (text: string) => void;

    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
};

export default function Input({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType,
    autoCapitalize = 'sentences',
    autoCorrect = false,
    }: InputProps) {
    return (
        <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        placeholderTextColor={colors.textMuted}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        width: '100%',
        height: 62,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.md + spacing.xs,
        paddingHorizontal: spacing.md + spacing.xs,
        fontSize: 18,
        marginBottom: spacing.md + spacing.xs,
        color: colors.border,
        backgroundColor: colors.background,
    },
});
