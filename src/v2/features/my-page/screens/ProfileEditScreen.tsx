import React, { useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import axios from 'axios';

import { profileApi } from '../../../../features/profile/api/profileApi';
import { profileQueryKeys, useProfile } from '../../../../features/profile/hooks/useProfile';
import {
  pickProfileImage,
  ProfileImagePermissionError,
  useChangeProfileImage,
} from '../../../../features/profile/hooks/useChangeProfileImage';
import BackIcon from '../../../shared/assets/icons/back.svg';
import CheckmarkIcon from '../../../shared/assets/icons/checkmark.svg';
import PencilIcon from '../../../shared/assets/icons/pencil.svg';
import EyeOpenIcon from '../../../shared/assets/icons/eye-open.svg';
import EyeCloseIcon from '../../../shared/assets/icons/eye-close.svg';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';

export type ProfileEditScreenProps = {
  onBack: () => void;
};

function getUsernameErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string>; message?: string } | undefined;
    return data?.errors?.newUsername ?? data?.message ?? fallback;
  }
  return fallback;
}

function getPasswordErrorMessage(
  error: unknown,
  messages: { currentPasswordInvalid: string; fallback: string; mismatch: string },
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { code?: string; errors?: Record<string, string>; message?: string }
      | undefined;

    if (data?.code === 'PASSWORD_MISMATCH') return messages.mismatch;
    if (status === 401) return messages.currentPasswordInvalid;

    const fieldError = data?.errors ? Object.values(data.errors).find(Boolean) : undefined;
    return fieldError ?? data?.message ?? messages.fallback;
  }
  return messages.fallback;
}

export default function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const changeProfileImage = useChangeProfileImage();

  const [username, setUsername] = useState(profile?.username ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditAvatar = async () => {
    if (changeProfileImage.isPending) return;

    try {
      const file = await pickProfileImage();
      if (!file) return;
      await changeProfileImage.mutateAsync(file);
    } catch (error) {
      if (error instanceof ProfileImagePermissionError) {
        Alert.alert(t('myPage.profileEdit.avatarPermissionDenied'));
        return;
      }
      Alert.alert(t('myPage.profileEdit.avatarChangeFailed'));
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    const trimmedUsername = username.trim();
    const wantsPasswordChange = currentPassword.length > 0
      || newPassword.length > 0
      || confirmPassword.length > 0;
    const wantsUsernameChange = Boolean(trimmedUsername) && trimmedUsername !== profile?.username;

    if (!trimmedUsername) {
      Alert.alert(t('myPage.profileEdit.usernameRequired'));
      return;
    }

    if (wantsPasswordChange) {
      if (!currentPassword) {
        Alert.alert(t('myPage.profileEdit.currentPasswordRequired'));
        return;
      }
      if (newPassword.length < 8) {
        Alert.alert(t('myPage.profileEdit.passwordTooShort'));
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert(t('myPage.profileEdit.passwordMismatch'));
        return;
      }
    }

    if (!wantsUsernameChange && !wantsPasswordChange) {
      onBack();
      return;
    }

    setIsSubmitting(true);
    let usernameChanged = false;
    try {
      if (wantsUsernameChange) {
        await profileApi.changeUsername(trimmedUsername);
        usernameChanged = true;
      }
      if (wantsPasswordChange) {
        await profileApi.changePassword({ confirmPassword, currentPassword, newPassword });
      }
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
      onBack();
    } catch (error) {
      setIsSubmitting(false);
      if (usernameChanged) {
        await queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
      }
      Alert.alert(
        wantsPasswordChange
          ? getPasswordErrorMessage(error, {
              currentPasswordInvalid: t('myPage.profileEdit.currentPasswordInvalid'),
              fallback: t('myPage.profileEdit.passwordChangeFailed'),
              mismatch: t('myPage.profileEdit.passwordMismatch'),
            })
          : getUsernameErrorMessage(error, t('myPage.profileEdit.usernameChangeFailed')),
      );
    }
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-profile-edit-screen">
      <Content contentContainerStyle={CONTENT_CONTAINER_STYLE}>
        <TopBar>
          <IconButton
            accessibilityLabel={t('myPage.back')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
          >
            <BackIcon height={44} width={44} />
          </IconButton>
          <TopBarTitle>{t('myPage.profileEdit.title')}</TopBarTitle>
          <IconButton
            accessibilityLabel={t('myPage.profileEdit.save')}
            accessibilityRole="button"
            disabled={isSubmitting}
            hitSlop={8}
            onPress={() => void handleSave()}
          >
            <CheckmarkIcon height={44} width={44} />
          </IconButton>
        </TopBar>

        <AvatarSection>
          <AvatarWrapper
            accessibilityLabel={t('myPage.profileEdit.changeAvatar')}
            accessibilityRole="button"
            disabled={changeProfileImage.isPending}
            onPress={() => void handleEditAvatar()}
          >
            {profile?.profileImageUrl ? (
              <AvatarImage source={{ uri: profile.profileImageUrl }} />
            ) : (
              <AvatarPlaceholder height={82} width={82} />
            )}
            {changeProfileImage.isPending ? (
              <AvatarUploadingOverlay>
                <ActivityIndicator color="#FFFFFF" />
              </AvatarUploadingOverlay>
            ) : null}
            <PencilBadge>
              <PencilIcon height={16} width={16} />
            </PencilBadge>
          </AvatarWrapper>
        </AvatarSection>

        <InfoSection>
          <SectionTitle>{t('myPage.profileEdit.infoTitle')}</SectionTitle>

          <Field>
            <FieldLabel>{t('myPage.profileEdit.username')}</FieldLabel>
            <FieldRow>
              <FieldInput
                autoCapitalize="none"
                onChangeText={setUsername}
                value={username}
              />
            </FieldRow>
          </Field>

          <Field>
            <FieldLabel>{t('myPage.profileEdit.currentPassword')}</FieldLabel>
            <FieldRow>
              <FieldInput
                autoCapitalize="none"
                onChangeText={setCurrentPassword}
                placeholder={t('myPage.profileEdit.currentPasswordPlaceholder')}
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
              />
              <EyeButton
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowCurrentPassword((value) => !value)}
              >
                {showCurrentPassword ? (
                  <EyeOpenIcon height={16} width={16} />
                ) : (
                  <EyeCloseIcon height={16} width={16} />
                )}
              </EyeButton>
            </FieldRow>
          </Field>

          <Field>
            <FieldLabel>{t('myPage.profileEdit.newPassword')}</FieldLabel>
            <FieldRow>
              <FieldInput
                autoCapitalize="none"
                onChangeText={setNewPassword}
                placeholder={t('myPage.profileEdit.newPasswordPlaceholder')}
                secureTextEntry={!showNewPassword}
                value={newPassword}
              />
              <EyeButton
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowNewPassword((value) => !value)}
              >
                {showNewPassword ? (
                  <EyeOpenIcon height={16} width={16} />
                ) : (
                  <EyeCloseIcon height={16} width={16} />
                )}
              </EyeButton>
            </FieldRow>
          </Field>

          <Field>
            <FieldLabel>{t('myPage.profileEdit.confirmPassword')}</FieldLabel>
            <FieldRow>
              <FieldInput
                autoCapitalize="none"
                onChangeText={setConfirmPassword}
                placeholder={t('myPage.profileEdit.confirmPasswordPlaceholder')}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
              />
              <EyeButton
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowConfirmPassword((value) => !value)}
              >
                {showConfirmPassword ? (
                  <EyeOpenIcon height={16} width={16} />
                ) : (
                  <EyeCloseIcon height={16} width={16} />
                )}
              </EyeButton>
            </FieldRow>
          </Field>
        </InfoSection>

        <SaveButton
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => void handleSave()}
        >
          <SaveButtonText>
            {isSubmitting ? t('myPage.profileEdit.saving') : t('myPage.profileEdit.save')}
          </SaveButtonText>
        </SaveButton>
      </Content>
    </Screen>
  );
}

const CONTENT_CONTAINER_STYLE = { flexGrow: 1 } as const;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

const IconButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const TopBarTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const AvatarSection = styled.View`
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px 0;
  border-bottom-width: 8px;
  border-bottom-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const AvatarWrapper = styled.Pressable`
  width: 82px;
  height: 82px;
`;

const AvatarImage = styled.Image`
  width: 82px;
  height: 82px;
  border-radius: 41px;
`;

const AvatarUploadingOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  align-items: center;
  justify-content: center;
  border-radius: 41px;
  background-color: rgba(0, 0, 0, 0.4);
`;

const PencilBadge = styled.View`
  position: absolute;
  right: -4px;
  bottom: -4px;
  padding: 4px;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const InfoSection = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 700;
`;

const Field = styled.View`
  gap: 4px;
`;

const FieldLabel = styled.Text`
  color: #5c5e5e;
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: 500;
`;

const FieldRow = styled.View`
  flex-direction: row;
  align-items: center;
  height: 40px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const FieldInput = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  padding: 0;
`;

const EyeButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const SaveButton = styled.Pressable<{ disabled: boolean }>`
  align-items: center;
  justify-content: center;
  height: 64px;
  margin: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme, disabled }) => disabled ? theme.colors.disabled : theme.colors.primary};
`;

const SaveButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 20px;
  font-weight: 700;
`;
