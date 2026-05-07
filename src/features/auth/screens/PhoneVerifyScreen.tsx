import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useSignup from '../hooks/useSignup';
import Button from '../components/Button';
import Input from '../components/Input';

type PhoneVerifyScreenProps = {
  onBack?: () => void;
};

export default function PhoneVerifyScreen({ onBack }: PhoneVerifyScreenProps) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { signup, isSubmitting, errorMessage, clearError } = useSignup();

  const handleSignup = async () => {
    if (
      !username.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordConfirm.trim() ||
      isSubmitting
    ) {
      console.log('회원가입 안됨');
      return;
    }

    if (password !== passwordConfirm) {
      console.log('회원가입 안됨');
      return;
    }

    clearError();
    const result = await signup({
      username: username.trim(),
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (result) {
      console.log('회원가입 됨');
      return;
    }

    console.log('회원가입 안됨');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.back} onPress={onBack}>
        <Text style={styles.backText}>‹ 돌아가기</Text>
      </Pressable>

      <Text style={styles.title}>
        <Text style={styles.point}>핑덤</Text> 시작하기
      </Text>

      <Input
        placeholder="아이디 입력"
        value={username}
        onChangeText={setUsername}
      />

      <Input
        placeholder="이름 입력"
        value={name}
        onChangeText={setName}
      />

      <Input
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Input
        placeholder="비밀번호 확인"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
      />

      <View style={styles.submitButton}>
        <Button
          title={isSubmitting ? '회원가입 중...' : '회원가입'}
          onPress={() => void handleSignup()}
        />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
    marginBottom: 28,
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
    marginBottom: 28,
  },
  point: {
    color: '#ff2b6d',
  },
  submitButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#ff2b6d',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
