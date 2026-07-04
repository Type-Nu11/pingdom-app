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
import { colors } from '../../../../styles/colors';
import useSignup from '../../hooks/useSignup';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateUsername,
} from '../../lib/validators';
import ProgressDots from './components/ProgressDots';
import type { OnboardingData } from '../../../../features/onboarding/types';

const ESCAPE_SVG = `<svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 1.25L1.25 10.25L10.25 19.25" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const OPEN_EYE_SVG = `<svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 6.5C1.84364 2.64457 5.62909 0 10 0C14.3709 0 18.1564 2.64457 20 6.5C18.1564 10.3554 14.3709 13 10 13C5.62909 13 1.84364 10.3554 0 6.5ZM10 9.75C10.4178 9.75 10.8316 9.66594 11.2176 9.50261C11.6037 9.33928 11.9544 9.09989 12.2499 8.7981C12.5453 8.49631 12.7797 8.13803 12.9396 7.74372C13.0995 7.34941 13.1818 6.9268 13.1818 6.5C13.1818 6.0732 13.0995 5.65059 12.9396 5.25628C12.7797 4.86197 12.5453 4.50369 12.2499 4.2019C11.9544 3.90011 11.6037 3.66072 11.2176 3.49739C10.8316 3.33406 10.4178 3.25 10 3.25C9.15613 3.25 8.34682 3.59241 7.75012 4.2019C7.15341 4.8114 6.81818 5.63805 6.81818 6.5C6.81818 7.36195 7.15341 8.1886 7.75012 8.7981C8.34682 9.40759 9.15613 9.75 10 9.75Z" fill="#5E5E66"/></svg>`;

const CLOSED_EYE_SVG = `<svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.2927 12.2456L19.1745 15.0585L18.2109 16L2.78182 0.94149L3.74545 0L6.23636 2.42959C7.44113 1.99495 8.71557 1.7732 10 1.77472C14.3709 1.77472 18.1564 4.30192 20 7.98625C19.1516 9.68819 17.8764 11.1533 16.2927 12.2456ZM8.93091 5.06062L12.9973 9.02978C13.2001 8.47593 13.2377 7.87723 13.1056 7.30335C12.9735 6.72947 12.6772 6.204 12.2511 5.78809C11.825 5.37218 11.2866 5.08293 10.6987 4.95398C10.1108 4.82504 9.49742 4.86171 8.93 5.05973L8.93091 5.06062ZM13.7645 13.5438C12.5594 13.9782 11.2847 14.1997 10 14.1978C5.62909 14.1978 1.84364 11.6706 0 7.98625C0.848426 6.2843 2.12365 4.81918 3.70727 3.72691L7.00273 6.94271C6.79986 7.49656 6.76229 8.09526 6.89439 8.66914C7.02649 9.24302 7.32283 9.76849 7.74893 10.1844C8.17502 10.6003 8.71336 10.8896 9.30129 11.0185C9.88923 11.1475 10.5026 11.1108 11.07 10.9128L13.7645 13.5438Z" fill="#5E5E66"/></svg>`;

const PINK = colors.primaryNormal;
const ERROR = colors.error;
const BG = colors.bgAssistive;

type SignUpDetailsScreenProps = {
  onBack?: () => void;
  onVerify?: (email: string, username: string, password: string) => void;
  onboardingData?: OnboardingData;
};

type FieldError = {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
};

type InnerStep = 'account' | 'password';

export default function SignUpDetailsScreen({ onBack, onVerify, onboardingData }: SignUpDetailsScreenProps) {
  const [innerStep, setInnerStep] = useState<InnerStep>('account');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    signup,
    isSubmitting,
    errorMessage: signupErrorMessage,
    clearError: clearSignupError,
  } = useSignup();

  const isStep1Filled = username.trim() && email.trim();
  const isStep2Filled = password.trim() && passwordConfirm.trim();

  const validateStep1 = () => {
    const newErrors: FieldError = {
      username: validateUsername(username) ?? undefined,
      email: validateEmail(email) ?? undefined,
    };
    setErrors(newErrors);
    return !newErrors.username && !newErrors.email;
  };

  const validateStep2 = () => {
    const newErrors: FieldError = {
      password: validatePassword(password) ?? undefined,
      passwordConfirm: validatePasswordConfirm(password, passwordConfirm) ?? undefined,
    };
    setErrors(newErrors);
    return !newErrors.password && !newErrors.passwordConfirm;
  };

  const handleStep1Next = () => {
    if (!validateStep1()) return;
    clearSignupError();
    setInnerStep('password');
  };

  const handleStep2Submit = async () => {
    if (!validateStep2() || isSubmitting) return;

    clearSignupError();

    const signupResult = await signup({
      username: username.trim(),
      email: email.trim(),
      password,
      birthYear: onboardingData?.birthYear,
      language: onboardingData?.language,
      country: onboardingData?.country,
    });

    if (!signupResult) return;
    onVerify?.(email.trim(), username.trim(), password);
  };

  const handleBack = () => {
    if (innerStep === 'password') {
      setErrors({});
      setInnerStep('account');
    } else {
      onBack?.();
    }
  };

  if (innerStep === 'account') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.headerSide}>
            <SvgXml xml={ESCAPE_SVG} width={12} height={21} />
          </Pressable>
          <View style={styles.headerCenter}>
            <ProgressDots total={3} current={1} />
          </View>
          <View style={styles.headerSide} />
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topContent}>
            <Text style={styles.title}>핑덤 시작하기</Text>

            <View style={styles.fieldsGroup}>
              <View style={styles.field}>
                <Text style={[styles.label, styles.labelAlt]}>아이디</Text>
                <View style={[styles.inputRow, errors.username ? styles.inputRowError : undefined]}>
                  <TextInput
                    style={styles.input}
                    placeholder="아이디를 입력하세요"
                    placeholderTextColor={colors.placeholder}
                    value={username}
                    onChangeText={(v) => { setUsername(v); setErrors((e) => ({ ...e, username: undefined })); }}
                    autoCapitalize="none"
                  />
                </View>
                <Text style={[styles.helper, errors.username ? styles.helperVisible : styles.helperHidden]}>
                  {errors.username ?? ' '}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, styles.labelAlt]}>이메일</Text>
                <View style={[styles.inputRow, errors.email ? styles.inputRowError : undefined]}>
                  <TextInput
                    style={styles.input}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor={colors.placeholder}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {signupErrorMessage ? (
                  <Text style={styles.helperVisible}>{signupErrorMessage}</Text>
                ) : (
                  <Text style={[styles.helper, errors.email ? styles.helperVisible : styles.helperHidden]}>
                    {errors.email ?? ' '}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Pressable
            style={[styles.button, isStep1Filled ? styles.buttonActive : styles.buttonDisabled]}
            onPress={handleStep1Next}
          >
            <Text style={[styles.buttonText, isStep1Filled ? styles.buttonTextActive : styles.buttonTextDisabled]}>
              다음
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12} style={styles.headerSide}>
          <SvgXml xml={ESCAPE_SVG} width={12} height={21} />
        </Pressable>
        <View style={styles.headerCenter}>
          <ProgressDots total={3} current={2} />
        </View>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topContent}>
          <Text style={styles.title}>비밀번호 확인</Text>

          <View style={styles.fieldsGroup}>
            <View style={styles.field}>
              <Text style={[styles.label, styles.labelNeutral]}>비밀번호</Text>
              <View style={[styles.inputRow, errors.password ? styles.inputRowError : undefined]}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                />
                {password.length > 0 && (
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    <SvgXml xml={showPassword ? OPEN_EYE_SVG : CLOSED_EYE_SVG} width={20} height={16} />
                  </Pressable>
                )}
              </View>
              <Text style={[styles.helper, errors.password ? styles.helperVisible : styles.helperHidden]}>
                {errors.password ?? ' '}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, styles.labelNeutral]}>비밀번호 확인</Text>
              <View style={[styles.inputRow, errors.passwordConfirm ? styles.inputRowError : undefined]}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호를 한번 더 입력하세요"
                  placeholderTextColor={colors.placeholder}
                  value={passwordConfirm}
                  onChangeText={(v) => { setPasswordConfirm(v); setErrors((e) => ({ ...e, passwordConfirm: undefined })); }}
                  secureTextEntry={!showPasswordConfirm}
                />
                {passwordConfirm.length > 0 && (
                  <Pressable onPress={() => setShowPasswordConfirm((v) => !v)} hitSlop={8}>
                    <SvgXml xml={showPasswordConfirm ? OPEN_EYE_SVG : CLOSED_EYE_SVG} width={20} height={16} />
                  </Pressable>
                )}
              </View>
              <Text style={[styles.helper, errors.passwordConfirm ? styles.helperVisible : styles.helperHidden]}>
                {errors.passwordConfirm ?? ' '}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.button, isStep2Filled ? styles.buttonActive : styles.buttonDisabled]}
          onPress={() => void handleStep2Submit()}
        >
          <Text style={[styles.buttonText, isStep2Filled ? styles.buttonTextActive : styles.buttonTextDisabled]}>
            {isSubmitting ? '처리 중...' : '시작하기'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    height: 105,
    paddingTop: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 52,
    justifyContent: 'space-between',
  },
  topContent: {
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.labelStrong,
  },
  fieldsGroup: {
    gap: 16,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  labelAlt: {
    color: colors.labelDim,
  },
  labelNeutral: {
    color: colors.labelNeutral,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineNormal,
    paddingVertical: 10,
  },
  inputRowError: {
    borderBottomColor: ERROR,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: colors.labelStrong,
    padding: 0,
  },
  helper: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  helperVisible: {
    color: ERROR,
  },
  helperHidden: {
    color: 'transparent',
  },
  button: {
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: PINK,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBg,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: colors.labelAlternative,
  },
});
