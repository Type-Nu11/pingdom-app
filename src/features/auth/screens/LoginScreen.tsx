import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useLogin from '../hooks/useLogin';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isSubmitting, errorMessage, clearError } = useLogin();

  const handleLogin = async () => {
    clearError();
    const result = await login({
      email: email.trim(),
      password,
    });

    if (result) {
      console.log('로그인 됨');
      return;
    }

    console.log('로그인 안됨');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.back}>
        <Text style={styles.backText}>‹ 돌아가기</Text>
      </Pressable>

      <Text style={styles.title}>
        <Text style={styles.point}>핑덤</Text> 시작하기
      </Text>

      <Input
        label="이메일"
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        label="비밀번호"
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.loginButton}>
        <Button
          label="로그인"
          onPress={() => void handleLogin()}
          loading={isSubmitting}
          disabled={!email.trim() || !password.trim()}
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Pressable style={styles.forgot}>
        <Text style={styles.forgotText}>비밀번호를 잊어버리셨나요?</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable style={styles.googleButton}>
        <Text style={styles.googleButtonText}>구글로 계속</Text>
      </Pressable>

      <View style={styles.signupRow}>
        <Text style={styles.normalText}>계정이 없으신가요? </Text>
        <Pressable>
          <Text style={styles.linkText}>회원가입</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingTop: 84,
  },
  back: {
    marginBottom: 18,
  },
  backText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#000',
    marginBottom: 36,
  },
  point: {
    color: '#ff2b6d',
  },
  loginButton: {
    marginTop: 24,
  },
  errorText: {
    color: '#ff2b6d',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  forgot: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 28,
  },
  forgotText: {
    fontSize: 16,
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 28,
  },
  googleButton: {
    height: 70,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  googleButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  normalText: {
    fontSize: 16,
    color: '#555',
  },
  linkText: {
    fontSize: 16,
    color: '#ff2b6d',
    textDecorationLine: 'underline',
  },
});
