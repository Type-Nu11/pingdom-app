import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import OpenEyeIcon from '../../../../assets/icons/openEye.svg';
import CloseEyeIcon from '../../../../assets/icons/closeEye.svg';
import useLogin from '../../hooks/useLogin';

const PINK = '#FF1956';
const BG = '#F8F8F8';

const BACK_SVG = `<svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L1 9L8 17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const GOOGLE_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`;

const NAVER_SVG = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.76 12.47L10.1 6.73H6v10.54h4.24V11.53l3.66 5.74H18V6.73h-4.24v5.74z" fill="#00CB4B"/></svg>`;

const PHONE_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#3B3B40"/></svg>`;

type Props = {
  onBack: () => void;
};

export default function LoginFormScreen({ onBack }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { login, isSubmitting, errorMessage, clearError } = useLogin();

  const isFilled = username.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async () => {
    if (isSubmitting) return;

    let hasError = false;
    if (!username.trim()) {
      setUsernameError('아이디를 입력해주세요');
      hasError = true;
    } else {
      setUsernameError(null);
    }
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요');
      hasError = true;
    } else {
      setPasswordError(null);
    }
    if (hasError) return;

    clearError();
    await login({ username: username.trim(), password });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <SvgXml xml={BACK_SVG} width={9} height={18} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>핑덤 시작하기</Text>

        <View style={styles.fields}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>아이디</Text>
            <View style={[styles.inputRow, usernameError ? styles.inputRowError : styles.inputRowNormal]}>
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={(t) => { setUsername(t); if (usernameError) setUsernameError(null); }}
                placeholder="아이디를 입력하세요"
                placeholderTextColor="#BFC1C1"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={[styles.fieldError, !usernameError && styles.hidden]}>
              {usernameError ?? ' '}
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>비밀번호</Text>
            <View style={[styles.inputRow, passwordError ? styles.inputRowError : styles.inputRowNormal]}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={password}
                onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(null); }}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#BFC1C1"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                {showPassword
                  ? <OpenEyeIcon width={20} height={13} />
                  : <CloseEyeIcon width={20} height={13} />
                }
              </Pressable>
            </View>
            <Text style={[styles.fieldError, !passwordError && styles.hidden]}>
              {passwordError ?? ' '}
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.submitButton, isFilled ? styles.submitActive : styles.submitDisabled]}
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitText, !isFilled && styles.submitTextDisabled]}>
            {isSubmitting ? '로그인 중...' : '시작하기'}
          </Text>
        </Pressable>

        {errorMessage ? (
          <Text style={styles.serverError}>{errorMessage}</Text>
        ) : null}

        <View style={styles.linkRow}>
          <Pressable><Text style={styles.linkText}>아이디 찾기</Text></Pressable>
          <View style={styles.linkSeparator} />
          <Pressable><Text style={styles.linkText}>비밀번호 찾기</Text></Pressable>
          <View style={styles.linkSeparator} />
          <Pressable><Text style={styles.linkText}>회원가입</Text></Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>SNS 계정으로 로그인</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <Pressable style={[styles.socialBtn, styles.googleBtn]}>
            <SvgXml xml={GOOGLE_SVG} width={28} height={28} />
            <Text style={styles.socialBtnText}>구글로 시작하기</Text>
          </Pressable>
          <Pressable style={[styles.socialBtn, styles.naverBtn]}>
            <SvgXml xml={NAVER_SVG} width={24} height={24} />
            <Text style={[styles.socialBtnText, styles.naverText]}>네이버로 시작하기</Text>
          </Pressable>
          <Pressable style={[styles.socialBtn, styles.smsBtn]}>
            <SvgXml xml={PHONE_SVG} width={28} height={28} />
            <Text style={styles.socialBtnText}>SMS로 시작하기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    height: 105,
    paddingTop: 80,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
  },
  scroll: { flex: 1 },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 41.6,
    marginBottom: -12,
  },
  fields: { gap: 16 },
  fieldGroup: { gap: 4 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5E5E66',
    letterSpacing: -0.28,
    lineHeight: 18.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  inputRowNormal: { borderBottomColor: '#BDBEBE' },
  inputRowError: { borderBottomColor: '#EE2B2B' },
  textInput: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3B3B40',
    padding: 0,
    flex: 1,
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EE2B2B',
    letterSpacing: -0.24,
    lineHeight: 15.6,
  },
  hidden: { color: 'transparent' },
  submitButton: {
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitActive: {
    backgroundColor: PINK,
    shadowColor: '#FFC9D3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  submitDisabled: { backgroundColor: '#D1D4D5' },
  submitText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  submitTextDisabled: {
    color: '#5E5E66',
    fontWeight: '500',
  },
  serverError: {
    fontSize: 12,
    color: '#EE2B2B',
    textAlign: 'center',
    marginTop: -12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B3B40',
    lineHeight: 20.8,
  },
  linkSeparator: {
    width: 1.5,
    height: 12,
    backgroundColor: '#BDBEBE',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#BDBEBE',
  },
  dividerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5E5E66',
    lineHeight: 20.8,
  },
  socialButtons: { gap: 16 },
  socialBtn: {
    height: 58,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    backgroundColor: '#F6F6F7',
    borderWidth: 1,
  },
  googleBtn: { borderColor: '#E4E4E5' },
  naverBtn: { borderColor: '#00CB4B' },
  smsBtn: { borderColor: '#3B3B40' },
  socialBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B3B40',
    lineHeight: 26,
  },
  naverText: { color: '#00CB4B' },
});
