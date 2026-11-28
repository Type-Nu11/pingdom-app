import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Container, Field, Fields, Helper, Input, InputRow, Label, SubmitButton, SubmitText, Title } from './AuthForm.styles';
import OpenEyeIcon from '../../../../../assets/v2/icons/openEye.svg';
import CloseEyeIcon from '../../../../../assets/v2/icons/closeEye.svg';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';

type Props = {
  login: (input: { username: string; password: string }) => Promise<boolean>;
  errorMessage: string | null;
  clearError: () => void;
  isSubmitting: boolean;
  onBack: () => void;
  onFindPassword?: () => void;
  onSignup?: () => void;
};

export default function LoginFormScreen({ onBack, onFindPassword, onSignup, login, isSubmitting, errorMessage, clearError }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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
    <Container
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        onBack={onBack}
        currentStep={0}
        totalSteps={0}
        progressLabel=""
        progressValueText=""
      />

      <ScrollView
        contentContainerStyle={bodyStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Title>{t('auth.login.title')}</Title>

        <Fields>
          <Field>
            <Label $tone="textSecondary">{t('auth.login.username')}</Label>
            <InputRow $invalid={Boolean(usernameError)}>
              <Input
                value={username}
                onChangeText={(t) => { setUsername(t); if (usernameError) setUsernameError(null); }}
                placeholder={t('auth.login.usernamePlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </InputRow>
            <Helper $error>
              {usernameError ?? ' '}
            </Helper>
          </Field>

          <Field>
            <Label $tone="textSecondary">{t('auth.login.password')}</Label>
            <InputRow $invalid={Boolean(passwordError)}>
              <Input
                value={password}
                onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(null); }}
                placeholder={t('auth.login.passwordPlaceholder')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                {showPassword
                  ? <OpenEyeIcon color={colors.textSecondary} width={20} height={13} />
                  : <CloseEyeIcon color={colors.textSecondary} width={20} height={13} />
                }
              </Pressable>
            </InputRow>
            <Helper $error>
              {passwordError ?? ' '}
            </Helper>
          </Field>
        </Fields>

        <SubmitButton
          $filled={isFilled}
          onPress={() => void handleSubmit()}
          disabled={isSubmitting}
        >
          <SubmitText $filled={isFilled}>
            {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
          </SubmitText>
        </SubmitButton>

        {errorMessage ? (
          <ServerError>{errorMessage}</ServerError>
        ) : null}

        <LinkRow>
          <Pressable><LinkText>{t('auth.login.findUsername')}</LinkText></Pressable>
          <LinkSeparator />
          <Pressable onPress={onFindPassword}>
            <LinkText>{t('auth.login.findPassword')}</LinkText>
          </Pressable>
          <LinkSeparator />
          <Pressable onPress={onSignup}><LinkText>{t('auth.login.signup')}</LinkText></Pressable>
        </LinkRow>
      </ScrollView>
    </Container>
  );
}

const bodyStyle = { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 24 };
const ServerError = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.danger};
  text-align: center;
  margin-top: -12px;
`;
const LinkRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 28px;
`;
const LinkText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;
const LinkSeparator = styled.View`
  width: 1.5px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.border};
`;
