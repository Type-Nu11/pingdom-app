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
import OpenEyeIcon from '../../../../assets/icons/openEye.svg';
import CloseEyeIcon from '../../../../assets/icons/closeEye.svg';
import { colors } from '../../../../styles/colors';
import useLogin from '../../hooks/useLogin';

const PINK = colors.primaryNormal;
const BG = colors.bgAssistive;

const BACK_SVG = `<svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L1 9L8 17" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type Props = {
  onBack: () => void;
  onSignup?: () => void;
};

export default function LoginFormScreen({ onBack, onSignup }: Props) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { login, isSubmitting, errorMessage, clearError } = useLogin();

  const isFilled = username.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const nextUsernameError = username.trim() ? null : t('auth.validation.usernameRequired');
    const nextPasswordError = password.trim() ? null : t('auth.validation.passwordRequired');
    setUsernameError(nextUsernameError);
    setPasswordError(nextPasswordError);
    if (nextUsernameError || nextPasswordError) return;

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
        <Text style={styles.title}>{t('auth.login.title')}</Text>

        <View style={styles.fields}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('auth.login.username')}</Text>
            <View style={[styles.inputRow, usernameError ? styles.inputRowError : styles.inputRowNormal]}>
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={(t) => { setUsername(t); if (usernameError) setUsernameError(null); }}
                placeholder={t('auth.login.usernamePlaceholder')}
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={[styles.fieldError, !usernameError && styles.hidden]}>
              {usernameError ?? ' '}
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{t('auth.login.password')}</Text>
            <View style={[styles.inputRow, passwordError ? styles.inputRowError : styles.inputRowNormal]}>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={password}
                onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(null); }}
                placeholder={t('auth.login.passwordPlaceholder')}
                placeholderTextColor={colors.placeholder}
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
            {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
          </Text>
        </Pressable>

        {errorMessage ? (
          <Text style={styles.serverError}>{errorMessage}</Text>
        ) : null}

        <View style={styles.linkRow}>
          <Pressable><Text style={styles.linkText}>{t('auth.login.findUsername')}</Text></Pressable>
          <View style={styles.linkSeparator} />
          <Pressable><Text style={styles.linkText}>{t('auth.login.findPassword')}</Text></Pressable>
          <View style={styles.linkSeparator} />
          <Pressable onPress={onSignup}><Text style={styles.linkText}>{t('auth.login.signup')}</Text></Pressable>
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
    color: colors.labelBlack,
    lineHeight: 41.6,
    marginBottom: -12,
  },
  fields: { gap: 16 },
  fieldGroup: { gap: 4 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.labelAlternative,
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
  inputRowNormal: { borderBottomColor: colors.lineNormal },
  inputRowError: { borderBottomColor: colors.error },
  textInput: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.labelNeutral,
    padding: 0,
    flex: 1,
  },
  fieldError: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.error,
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
    shadowColor: colors.shadowPink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  submitDisabled: { backgroundColor: colors.disabledBg },
  submitText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 26,
  },
  submitTextDisabled: {
    color: colors.labelAlternative,
    fontWeight: '500',
  },
  serverError: {
    fontSize: 12,
    color: colors.error,
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
    color: colors.labelNeutral,
    lineHeight: 20.8,
  },
  linkSeparator: {
    width: 1.5,
    height: 12,
    backgroundColor: colors.lineNormal,
  },
});
