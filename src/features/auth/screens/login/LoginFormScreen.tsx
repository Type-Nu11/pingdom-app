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
import GoogleIcon from '../../../../assets/icons/google.svg';
import NaverIcon from '../../../../assets/icons/simple-icons_naver.svg';
import CallIcon from '../../../../assets/icons/ion_call.svg';
import useLogin from '../../hooks/useLogin';

const PINK = '#FF1956';
const BG = '#F8F8F8';

const BACK_SVG = `<svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L1 9L8 17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type Props = {
  onBack: () => void;
  onSignup?: () => void;
};

export default function LoginFormScreen({ onBack, onSignup }: Props) {
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
          <Pressable onPress={onSignup}><Text style={styles.linkText}>회원가입</Text></Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>SNS 계정으로 로그인</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <Pressable style={[styles.socialBtn, styles.googleBtn]}>
            <GoogleIcon width={28} height={28} />
            <Text style={styles.socialBtnText}>구글로 시작하기</Text>
          </Pressable>
          <Pressable style={[styles.socialBtn, styles.naverBtn]}>
            <NaverIcon width={24} height={24} />
            <Text style={[styles.socialBtnText, styles.naverText]}>네이버로 시작하기</Text>
          </Pressable>
          <Pressable style={[styles.socialBtn, styles.smsBtn]}>
            <CallIcon width={28} height={28} />
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
