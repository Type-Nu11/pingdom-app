import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
} from 'react-native';

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
        borderColor: '#000',
        backgroundColor: '#FFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:24,
    },
    text: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
});