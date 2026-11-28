import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Container, Field, Fields, Helper, Input, InputRow, Label, SubmitButton, SubmitText, Title } from './AuthForm.styles';
import OpenEyeIcon from '../../../../../assets/v2/icons/openEye.svg';
import CloseEyeIcon from '../../../../../assets/v2/icons/closeEye.svg';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';

type SignUpDetailsScreenProps = {
  onBack?: () => void;
  onSubmit: (input: { username: string; email: string; password: string }) => Promise<void>;
  clearErrors: () => void;
  isSubmitting: boolean;
  signupErrorMessage: string | null;
  submitErrorMessage: string | null;
};

type FieldError = {
  username?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
};

type InnerStep = 'account' | 'password';

export default function SignUpDetailsScreen({ onBack, onSubmit, clearErrors, isSubmitting, signupErrorMessage, submitErrorMessage }: SignUpDetailsScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [innerStep, setInnerStep] = useState<InnerStep>('account');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const isStep1Filled = Boolean(username.trim() && email.trim());
  const isStep2Filled = Boolean(password.trim() && passwordConfirm.trim());

  const validateStep1 = () => {
    const trimmedEmail = email.trim();
    const newErrors: FieldError = {
      username: !username.trim()
        ? t('auth.validation.usernameRequired')
        : username.trim().length < 4 || username.trim().length > 50
          ? t('myPage.profileEdit.usernameLengthInvalid')
          : undefined,
      email: !trimmedEmail
        ? t('auth.validation.emailRequired')
        : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)
          ? undefined
          : t('auth.validation.emailInvalid'),
    };
    setErrors(newErrors);
    return !newErrors.username && !newErrors.email;
  };

  const validateStep2 = () => {
    const newErrors: FieldError = {
      password: password.trim() ? undefined : t('auth.validation.passwordRequired'),
      passwordConfirm: !passwordConfirm.trim()
        ? t('auth.validation.passwordConfirmRequired')
        : password === passwordConfirm
          ? undefined
          : t('auth.validation.passwordMismatch'),
    };
    setErrors(newErrors);
    return !newErrors.password && !newErrors.passwordConfirm;
  };

  const handleStep1Next = () => {
    if (!validateStep1()) return;
    clearErrors();
    setInnerStep('password');
  };

  const handleStep2Submit = async () => {
    if (!validateStep2() || isSubmitting) return;

    clearErrors();

    await onSubmit({ username: username.trim(), email: email.trim(), password });
  };

  const handleBack = () => {
    if (innerStep === 'password') {
      setErrors({});
      setInnerStep('account');
    } else {
      onBack?.();
    }
  };

  const currentStep = innerStep === 'account' ? 1 : 2;
  const progressText = t('selectLanguage.progress', { current: currentStep, total: 2 });

  if (innerStep === 'account') {
    return (
      <Container
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <OnboardingProgressHeader
          backLabel={t('common.navigation.back')}
          onBack={handleBack}
          currentStep={currentStep}
          totalSteps={2}
          progressLabel={progressText}
          progressValueText={progressText}
        />

        <ScrollView
          contentContainerStyle={bodyStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Fields>
            <Title>{t('auth.signup.title')}</Title>

            <Fields>
              <Field>
                <Label $tone="textSecondary">{t('auth.signup.username')}</Label>
                <InputRow $invalid={Boolean(errors.username)}>
                  <Input
                    placeholder={t('auth.signup.usernamePlaceholder')}
                    value={username}
                    onChangeText={(v) => { setUsername(v); setErrors((e) => ({ ...e, username: undefined })); }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </InputRow>
                <Helper $error={Boolean(errors.username)}>
                  {errors.username ?? t('myPage.profileEdit.usernameLengthInvalid')}
                </Helper>
              </Field>

              <Field>
                <Label $tone="textSecondary">{t('auth.signup.email')}</Label>
                <InputRow $invalid={Boolean(errors.email)}>
                  <Input
                    placeholder={t('auth.signup.emailPlaceholder')}
                    value={email}
                    onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </InputRow>
                {signupErrorMessage ? (
                  <Helper $error>{signupErrorMessage}</Helper>
                ) : (
                  <Helper $error>
                    {errors.email ?? ' '}
                  </Helper>
                )}
              </Field>
            </Fields>
          </Fields>

          <SubmitButton
            $filled={isStep1Filled}
            onPress={handleStep1Next}
          >
            <SubmitText $filled={isStep1Filled}>
              {t('auth.signup.next')}
            </SubmitText>
          </SubmitButton>
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        onBack={handleBack}
        currentStep={currentStep}
        totalSteps={2}
        progressLabel={progressText}
        progressValueText={progressText}
      />

      <ScrollView
        contentContainerStyle={bodyStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Fields>
          <Title>{t('auth.signup.passwordTitle')}</Title>

          <Fields>
            <Field>
              <Label $tone="text">{t('auth.signup.password')}</Label>
              <InputRow $invalid={Boolean(errors.password)}>
                <Input
                  placeholder={t('auth.signup.passwordPlaceholder')}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {password.length > 0 && (
                  <VisibilityButton
                    onPress={() => setShowPassword((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={t(showPassword ? 'myPage.profileEdit.hidePassword' : 'myPage.profileEdit.showPassword', { field: t('auth.signup.password') })}
                    accessibilityState={{ selected: showPassword }}
                  >
                    <View pointerEvents="none">
                      {showPassword
                        ? <OpenEyeIcon color={colors.textSecondary} width={20} height={16} />
                        : <CloseEyeIcon color={colors.textSecondary} width={20} height={16} />}
                    </View>
                  </VisibilityButton>
                )}
              </InputRow>
              <Helper $error>
                {errors.password ?? ' '}
              </Helper>
            </Field>

            <Field>
              <Label $tone="text">{t('auth.signup.passwordConfirm')}</Label>
              <InputRow $invalid={Boolean(errors.passwordConfirm)}>
                <Input
                  placeholder={t('auth.signup.passwordConfirmPlaceholder')}
                  value={passwordConfirm}
                  onChangeText={(v) => { setPasswordConfirm(v); setErrors((e) => ({ ...e, passwordConfirm: undefined })); }}
                  secureTextEntry={!showPasswordConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {passwordConfirm.length > 0 && (
                  <VisibilityButton
                    onPress={() => setShowPasswordConfirm((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={t(showPasswordConfirm ? 'myPage.profileEdit.hidePassword' : 'myPage.profileEdit.showPassword', { field: t('auth.signup.passwordConfirm') })}
                    accessibilityState={{ selected: showPasswordConfirm }}
                  >
                    <View pointerEvents="none">
                      {showPasswordConfirm
                        ? <OpenEyeIcon color={colors.textSecondary} width={20} height={16} />
                        : <CloseEyeIcon color={colors.textSecondary} width={20} height={16} />}
                    </View>
                  </VisibilityButton>
                )}
              </InputRow>
              <Helper $error>
                {errors.passwordConfirm ?? ' '}
              </Helper>
            </Field>
          </Fields>
          {submitErrorMessage ? (
            <SubmitError>{submitErrorMessage}</SubmitError>
          ) : null}
        </Fields>

        <SubmitButton
          $filled={isStep2Filled}
          onPress={() => void handleStep2Submit()}
        >
          <SubmitText $filled={isStep2Filled}>
            {isSubmitting ? t('auth.signup.processing') : t('auth.signup.start')}
          </SubmitText>
        </SubmitButton>
      </ScrollView>
    </Container>
  );
}

const bodyStyle = {
  flexGrow: 1,
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 52,
  justifyContent: 'space-between',
} as const;
const VisibilityButton = styled.Pressable`
  width: 44px;
  height: 40px;
  align-items: center;
  justify-content: center;
`;
const SubmitError = styled.Text`
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.danger};
`;
