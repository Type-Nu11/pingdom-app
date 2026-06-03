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

type SignupDetailsScreenProps = {
  onBack?: () => void;
  onLogin?: () => void;
  onComplete?: () => void;
};

const MIN_BIRTH_YEAR = 1900;
const MAX_BIRTH_YEAR = new Date().getFullYear();

export default function SignupDetailsScreen({
  onBack,
  onLogin,
  onComplete,
}: SignupDetailsScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [language, setLanguage] = useState('ko');
  const [country, setCountry] = useState('KR');
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const {
    signup,
    isSubmitting,
    errorMessage,
    clearError,
  } = useSignup();

  const handleSignup = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordConfirm.trim() ||
      !birthYear.trim() ||
      !language.trim() ||
      !country.trim() ||
      isSubmitting
    ) {
      setFormErrorMessage('필수 입력값을 모두 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setFormErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    const parsedBirthYear = Number(birthYear.trim());
    if (
      !Number.isInteger(parsedBirthYear) ||
      parsedBirthYear < MIN_BIRTH_YEAR ||
      parsedBirthYear > MAX_BIRTH_YEAR
    ) {
      setFormErrorMessage(`출생연도는 ${MIN_BIRTH_YEAR}년부터 ${MAX_BIRTH_YEAR}년 사이여야 합니다.`);
      return;
    }

    setFormErrorMessage(null);
    clearError();

    const signupResult = await signup({
      username: username.trim(),
      email: email.trim(),
      password,
      birthYear: parsedBirthYear,
      profileImageUrl: profileImageUrl.trim() || undefined,
      language: language.trim().toLowerCase(),
      country: country.trim().toUpperCase(),
    });

    if (!signupResult) {
      return;
    }

    onComplete?.();
  };

  const visibleErrorMessage = formErrorMessage ?? errorMessage;

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
        autoCapitalize="none"
      />

      <Input
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
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

      <Input
        placeholder="출생연도 (예: 1998)"
        value={birthYear}
        onChangeText={setBirthYear}
        keyboardType="number-pad"
        autoCapitalize="none"
      />

      <Input
        placeholder="프로필 이미지 URL (선택)"
        value={profileImageUrl}
        onChangeText={setProfileImageUrl}
        keyboardType="url"
        autoCapitalize="none"
      />

      <View style={styles.inlineRow}>
        <View style={styles.inlineInput}>
          <Input
            placeholder="언어 코드"
            value={language}
            onChangeText={setLanguage}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inlineInput}>
          <Input
            placeholder="국가 코드"
            value={country}
            onChangeText={setCountry}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.submitButton}>
        <Button
          title={isSubmitting ? '회원가입 중...' : '회원가입'}
          onPress={() => void handleSignup()}
        />
      </View>

      {visibleErrorMessage ? <Text style={styles.errorText}>{visibleErrorMessage}</Text> : null}

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
        <Pressable onPress={onLogin}>
          <Text style={styles.loginLink}>로그인</Text>
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
  inlineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineInput: {
    flex: 1,
  },
  errorText: {
    color: '#ff2b6d',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#555',
  },
  loginLink: {
    fontSize: 16,
    color: '#ff2b6d',
    textDecorationLine: 'underline',
  },
});
