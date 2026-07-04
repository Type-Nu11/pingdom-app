import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import useEmailVerify from '../../hooks/useEmailVerify';
import useLogin from '../../hooks/useLogin';
import ProgressDots from './components/ProgressDots';

const ESCAPE_SVG = `<svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 1.25L1.25 10.25L10.25 19.25" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const PINK = '#FF1956';
const BG = '#F8F8F8';

type Props = {
  email: string;
  username: string;
  password: string;
  onBack: () => void;
};

export default function SignUpEmailVerifyScreen({ email, username, password, onBack }: Props) {
  const [code, setCode] = useState('');
  const { verify, isSubmitting: isVerifying, errorMessage: verifyError } = useEmailVerify();
  const { login, isSubmitting: isLoggingIn, errorMessage: loginError } = useLogin();

  const isActive = code.trim().length === 6;
  const isSubmitting = isVerifying || isLoggingIn;
  const errorMessage = verifyError ?? loginError;

  const handleSubmit = async () => {
    if (!isActive || isSubmitting) return;
    const ok = await verify(email, code.trim());
    if (!ok) return;
    await login({ username, password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
          <SvgXml xml={ESCAPE_SVG} width={12} height={21} />
        </Pressable>
        <View style={styles.headerCenter}>
          <ProgressDots total={3} current={2} />
        </View>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.topContent}>
          <Text style={styles.title}>이메일 인증</Text>
          <Text style={styles.desc}>
            <Text style={styles.email}>{email}</Text>
            {'으로\n인증 코드를 발송했습니다.'}
          </Text>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="인증 코드 6자리"
              placeholderTextColor="#BFC1C1"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>

        <Pressable
          style={[styles.button, isActive ? styles.buttonActive : styles.buttonDisabled]}
          onPress={() => void handleSubmit()}
          disabled={!isActive || isSubmitting}
        >
          <Text style={[styles.buttonText, isActive ? styles.buttonTextActive : styles.buttonTextDisabled]}>
            {isSubmitting ? '확인 중...' : '인증 완료'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    height: 105,
    paddingTop: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  headerSide: { width: 40, alignItems: 'flex-start' },
  headerCenter: { flex: 1, alignItems: 'center' },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 52,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topContent: { width: '100%', gap: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#0C0C0D' },
  desc: { fontSize: 16, fontWeight: '500', color: '#5E5E66', lineHeight: 22 },
  email: { color: PINK, fontWeight: '700' },
  inputWrap: {
    borderBottomWidth: 2,
    borderBottomColor: '#BFC1C1',
    paddingTop: 8,
    paddingBottom: 6,
  },
  input: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0C0C0D',
    height: 44,
    padding: 0,
    letterSpacing: 8,
  },
  errorText: { fontSize: 13, color: '#EE2B2B' },
  button: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: { backgroundColor: PINK },
  buttonDisabled: { backgroundColor: '#D1D4D5' },
  buttonText: { fontSize: 20, fontWeight: '500' },
  buttonTextActive: { color: '#FFFFFF' },
  buttonTextDisabled: { color: '#5E5E66' },
});
