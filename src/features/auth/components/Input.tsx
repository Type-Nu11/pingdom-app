import React from 'react';
import {
    TextInput,
    StyleSheet,
} from 'react-native';

type InputProps = {
    value: string;
    onChangeText: (text: string) => void;

    placeholder?: string;
    secureTextEntry?: boolean;
};

export default function Input({
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    }: InputProps) {
    return (
        <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#999"
        />
    );
}

const styles = StyleSheet.create({
    input: {
        width: '100%',
        height: 62,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 20,
        paddingHorizontal: 20,
        fontSize: 18,
        marginBottom: 20,
        color: '#000',
    },
});