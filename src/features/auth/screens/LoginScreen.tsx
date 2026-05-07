import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function LoginScreen() {
    return (
        <View style={styles.container}>
        <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    logo: {
        width: 180,
        height: 180,
    },
});
