import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';

type WelcomeScreenProps = {
    onStart?: () => void;
    onLogin?: () => void;
};

export default function WelcomeScreen({
    onStart = () => {},
    onLogin = () => {},
    }: WelcomeScreenProps) {
    return (
        <View style={styles.container}>
        <View style={styles.logogroup}>
            <Image
                source={require('../../../assets/Logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.throtext}>외국인 옆에 핑덤</Text>
            <Text style={styles.wkrdmsthro}>당신만 아는 장소를</Text>
            <Text style={styles.wkrdmsthro}>외국인들에게 공유해주세요!</Text>
        </View>
        <View style={styles.loginRow}>
            <Text style={styles.loginText}>이미 계정이 있다면? </Text>
            <Pressable onPress={onLogin}>
            <Text style={styles.loginLink}>로그인</Text>
            </Pressable>
        </View>
        <Button title='시작하기' onPress={onStart}></Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
        backgroundColor: '#fff',
    },
    throtext: {
        fontSize: 24,
    },
    wkrdmsthro: {
        fontSize: 14
    },
    logo: {
        width: 247,
        height: 147,
        marginBottom: 40,
    },
    logogroup: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    loginText: {
        fontSize: 14,
        color: '#555',
    },
    loginLink: {
        fontSize: 14,
        color: '#ff2b6d',
        textDecorationLine: 'underline',
    },
});
