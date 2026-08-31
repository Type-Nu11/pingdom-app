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
import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import OpenEyeIcon from '../../../../assets/v2/icons/openEye.svg';
import CloseEyeIcon from '../../../../assets/v2/icons/closeEye.svg';
import { colors } from '../../../../styles/colors';
import usePasswordReset from '../../hooks/usePasswordReset';
import ProgressDots from '../signup/components/ProgressDots';

const ESCAPE_SVG = `<svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 1.25L1.25 10.25L10.25 19.25" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const PINK = colors.primaryNormal;
const ERROR = colors.error;
const BG = colors.bgAssistive;

type PasswordResetScreenProps = {
  onBack: () => void;
  onCompleted: () => void;
};

type Step = 'request' | 'confirm';

type FieldError = {
  email?: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function PasswordResetScreen({ onBack, onCompleted }: PasswordResetScreenProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldError>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { confirmReset, requestReset, isSubmitting, errorMessage, clearError } = usePasswordReset();

  const isRequestFilled = email.trim().length > 0;
  const isConfirmFilled = Boolean(token.trim() && newPassword && confirmPassword);

  const handleBack = () => {
    if (step === 'confirm') {
      setErrors({});
      clearError();
      setStep('request');
      return;
    }
    onBack();
  };

  const handleRequest = async () => {
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    const emailError = !trimmedEmail
      ? t('auth.validation.emailRequired')
      : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)
        ? undefined
        : t('auth.validation.emailInvalid');

    setErrors({ email: emailError });
    if (emailError) return;

    if (await requestReset(trimmedEmail)) {
      setStep('confirm');
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;

    const nextErrors: FieldError = {
      token: token.trim() ? undefined : t('auth.passwordReset.tokenRequired'),
      newPassword: !newPassword
        ? t('auth.validation.passwordRequired')
        : newPassword.length >= 8
          ? undefined
          : t('auth.passwordReset.passwordTooShort'),
      confirmPassword: !confirmPassword
        ? t('auth.validation.passwordConfirmRequired')
        : newPassword === confirmPassword
          ? undefined
          : t('auth.validation.passwordMismatch'),
    };

    setErrors(nextErrors);
    if (nextErrors.token || nextErrors.newPassword || nextErrors.confirmPassword) return;

    const succeeded = await confirmReset({
      confirmPassword,
      email: email.trim(),
      newPassword,
      token: token.trim(),
    });

    if (succeeded) onCompleted();
  };

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
          <ProgressDots total={2} current={step === 'request' ? 0 : 1} />
        </View>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'request' ? (
          <View style={styles.topContent}>
            <Text style={styles.title}>{t('auth.passwordReset.requestTitle')}</Text>
            <Text style={styles.description}>{t('auth.passwordReset.requestDescription')}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>{t('auth.signup.email')}</Text>
              <View style={[styles.inputRow, errors.email ? styles.inputRowError : undefined]}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={(value) => {
                    setEmail(value);
                    setErrors((current) => ({ ...current, email: undefined }));
                  }}
                  placeholder={t('auth.signup.emailPlaceholder')}
                  placeholderTextColor={colors.placeholder}
                  style={styles.input}
                  value={email}
                />
              </View>
              <Text style={[styles.helper, errors.email ? styles.helperVisible : styles.helperHidden]}>
                {errors.email ?? ' '}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.topContent}>
            <Text style={styles.title}>{t('auth.passwordReset.confirmTitle')}</Text>
            <Text style={styles.description}>
              {t('auth.passwordReset.confirmDescription', { email: email.trim() })}
            </Text>

            <View style={styles.fieldsGroup}>
              <View style={styles.field}>
                <Text style={styles.label}>{t('auth.passwordReset.token')}</Text>
                <View style={[styles.inputRow, errors.token ? styles.inputRowError : undefined]}>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={(value) => {
                      setToken(value);
                      setErrors((current) => ({ ...current, token: undefined }));
                    }}
                    placeholder={t('auth.passwordReset.tokenPlaceholder')}
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    value={token}
                  />
                </View>
                <Text style={[styles.helper, errors.token ? styles.helperVisible : styles.helperHidden]}>
                  {errors.token ?? ' '}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('auth.passwordReset.newPassword')}</Text>
                <View style={[styles.inputRow, errors.newPassword ? styles.inputRowError : undefined]}>
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={(value) => {
                      setNewPassword(value);
                      setErrors((current) => ({ ...current, newPassword: undefined }));
                    }}
                    placeholder={t('auth.passwordReset.newPasswordPlaceholder')}
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!showNewPassword}
                    style={styles.input}
                    value={newPassword}
                  />
                  {newPassword.length > 0 && (
                    <Pressable onPress={() => setShowNewPassword((value) => !value)} hitSlop={8}>
                      {showNewPassword
                        ? <OpenEyeIcon width={20} height={13} />
                        : <CloseEyeIcon width={20} height={13} />}
                    </Pressable>
                  )}
                </View>
                <Text style={[styles.helper, errors.newPassword ? styles.helperVisible : styles.helperHidden]}>
                  {errors.newPassword ?? ' '}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('auth.signup.passwordConfirm')}</Text>
                <View style={[styles.inputRow, errors.confirmPassword ? styles.inputRowError : undefined]}>
                  <TextInput
                    autoCapitalize="none"
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      setErrors((current) => ({ ...current, confirmPassword: undefined }));
                    }}
                    placeholder={t('auth.signup.passwordConfirmPlaceholder')}
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    style={styles.input}
                    value={confirmPassword}
                  />
                  {confirmPassword.length > 0 && (
                    <Pressable onPress={() => setShowConfirmPassword((value) => !value)} hitSlop={8}>
                      {showConfirmPassword
                        ? <OpenEyeIcon width={20} height={13} />
                        : <CloseEyeIcon width={20} height={13} />}
                    </Pressable>
                  )}
                </View>
                <Text style={[styles.helper, errors.confirmPassword ? styles.helperVisible : styles.helperHidden]}>
                  {errors.confirmPassword ?? ' '}
                </Text>
              </View>
            </View>

            <Pressable onPress={() => void handleRequest()}>
              <Text style={styles.resendLink}>{t('auth.passwordReset.resend')}</Text>
            </Pressable>
          </View>
        )}

        {errorMessage ? <Text style={styles.submitError}>{errorMessage}</Text> : null}

        <Pressable
          disabled={isSubmitting}
          onPress={() => void (step === 'request' ? handleRequest() : handleConfirm())}
          style={[
            styles.button,
            (step === 'request' ? isRequestFilled : isConfirmFilled)
              ? styles.buttonActive
              : styles.buttonDisabled,
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              (step === 'request' ? isRequestFilled : isConfirmFilled)
                ? styles.buttonTextActive
                : styles.buttonTextDisabled,
            ]}
          >
            {isSubmitting
              ? t('auth.passwordReset.processing')
              : step === 'request'
                ? t('auth.passwordReset.sendToken')
                : t('auth.passwordReset.submit')}
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
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.labelAlternative,
    lineHeight: 20.8,
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
    color: colors.labelNeutral,
    letterSpacing: -0.28,
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
  resendLink: {
    fontSize: 14,
    fontWeight: '500',
    color: PINK,
    textDecorationLine: 'underline',
  },
  submitError: {
    color: ERROR,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
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
