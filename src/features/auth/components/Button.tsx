import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
} from 'react-native';
import { colors } from '../../../styles/colors';
import { radius } from '../../../styles/radius';
import { spacing } from '../../../styles/spacing';

type ButtonProps = {
    title: string;
    onPress: () => void;
};

export default function Button({
    title,
    onPress,
    }: ButtonProps) {
    return (
        <Pressable
        style={styles.button}
        onPress={onPress}
        >
        <Text style={styles.text}>
            {title}
        </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        height: 62,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: radius.md + spacing.xs,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    text: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.border,
    },
});
