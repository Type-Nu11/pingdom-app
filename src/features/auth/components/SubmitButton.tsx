import React from 'react';
import { StyleSheet,Pressable,Text } from 'react-native';

type SubmitButtonProps = {
    onPress?: () => void;
};

export default function SubmitButton({ onPress }: SubmitButtonProps) {
    return <Pressable style={styles.submit} onPress={onPress}>
        <Text>제출</Text>
    </Pressable>;
}

const styles = StyleSheet.create({
    submit: {
        alignSelf: 'flex-end',
        width: 104,
        height: 38,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 34,
    },
})
