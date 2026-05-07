import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../../shared/components/Button';

type WelcomeScreenProps = {
  onStart?: () => void;
  onLogin?: () => void;
};

export default function WelcomeScreen({
  onStart = () => console.log('회원가입 화면으로 이동'),
  onLogin = () => console.log('로그인 화면으로 이동'),
}: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.startButton}>
        <Button label="시작하기" onPress={onStart} />
      </View>

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>이미 계정이 있다면? </Text>
        <Pressable onPress={onLogin}>
          <Text style={styles.loginLink}>로그인</Text>
        </Pressable>
      </View>
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
  logo: {
    width: 180,
    height: 180,
    marginBottom: 40,
  },
  startButton: {
    width: '100%',
    marginBottom: 24,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
