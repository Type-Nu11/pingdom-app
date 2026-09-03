import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { ApiError } from '../../../shared/api';
import {
  pickProfileImage,
  ProfileImagePermissionError,
  SaveProfileError,
  useChangeProfileImage,
  useProfile,
  useSaveProfile,
} from '../hooks/useProfile';
import { HeaderBackButton } from '../../../shared/components';
import CheckmarkIcon from '../../../shared/assets/icons/checkmark.svg';
import PencilIcon from '../../../shared/assets/icons/pencil.svg';
import EyeOpenIcon from '../../../shared/assets/icons/eye-open.svg';
import EyeCloseIcon from '../../../shared/assets/icons/eye-close.svg';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';

export type ProfileEditScreenProps = {
  onBack: () => void;
};

function getUsernameErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.fieldErrors?.find(({ field }) => field === 'newUsername')?.reason
      ?? error.message
      ?? fallback;
  }
  return fallback;
}

function getPasswordErrorMessage(
  error: unknown,
  messages: { currentPasswordInvalid: string; fallback: string; mismatch: string },
): string {
  if (error instanceof ApiError) {
    if (error.code === 'PASSWORD_MISMATCH') return messages.mismatch;
    if (error.code === 'INVALID_CREDENTIALS') return messages.currentPasswordInvalid;
    return error.fieldErrors?.find(({ reason }) => Boolean(reason))?.reason
      ?? error.message
      ?? messages.fallback;
  }
  return messages.fallback;
}

export default function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const { t } = useTranslation();
  const { isError: isProfileError, isLoading: isProfileLoading, profile } = useProfile();

  const changeProfileImage = useChangeProfileImage();
  const saveProfile = useSaveProfile();

  const [username, setUsername] = useState(profile?.username ?? '');
  // The screen can mount before the profile query resolves (a cold entry, or the
  // cached profile having been garbage collected), which would otherwise leave
  // the field permanently blank because useState only reads its initial value
  // once. Seed it when the profile first arrives, and never again, so a value
  // the user has already typed is not overwritten by a later refetch.
  const hasSeededUsername = useRef(profile !== null);
  const hasEditedUsername = useRef(false);
  const avatarActionLock = useRef(false);
  const backActionLock = useRef(false);
  const isMounted = useRef(true);
  const saveActionLock = useRef(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (hasSeededUsername.current || !profile) return;

    hasSeededUsername.current = true;
    if (!hasEditedUsername.current) setUsername(profile.username);
  }, [profile]);

  useEffect(() => () => {
    isMounted.current = false;
  }, []);

  const handleBack = () => {
    if (backActionLock.current) return;
    backActionLock.current = true;
    onBack();
  };

  const handleUsernameChange = (value: string) => {
    hasEditedUsername.current = true;
    setUsername(value);
  };

  const handleEditAvatar = async () => {
    if (avatarActionLock.current || changeProfileImage.isPending) return;
    avatarActionLock.current = true;

    try {
      const file = await pickProfileImage();
      if (!file || !isMounted.current) return;
      await changeProfileImage.mutateAsync(file);
    } catch (error) {
      if (!isMounted.current) return;
      if (error instanceof ProfileImagePermissionError) {
        Alert.alert(t('myPage.profileEdit.avatarPermissionDenied'));
        return;
      }
      Alert.alert(t('myPage.profileEdit.avatarChangeFailed'));
    } finally {
      avatarActionLock.current = false;
    }
  };

  const handleSave = async () => {
    // Saving before the profile resolves would compare the typed username
    // against an unknown current one and could send a redundant change request.
    if (
      saveActionLock.current
      || saveProfile.isPending
      || isProfileLoading
      || isProfileError
      || !profile
    ) return;

    const trimmedUsername = username.trim();
    const wantsPasswordChange = currentPassword.length > 0
      || newPassword.length > 0
      || confirmPassword.length > 0;
    const wantsUsernameChange = Boolean(trimmedUsername) && trimmedUsername !== profile?.username;

    if (!trimmedUsername) {
      Alert.alert(t('myPage.profileEdit.usernameRequired'));
      return;
    }

    if (trimmedUsername.length < 4 || trimmedUsername.length > 50) {
      Alert.alert(t('myPage.profileEdit.usernameLengthInvalid'));
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
      handleBack();
      return;
    }

    saveActionLock.current = true;
    try {
      await saveProfile.mutateAsync({
        password: wantsPasswordChange
          ? { confirmPassword, currentPassword, newPassword }
          : undefined,
        username: wantsUsernameChange ? trimmedUsername : undefined,
      });
      if (isMounted.current) handleBack();
    } catch (error) {
      if (!isMounted.current) return;

      const saveError = error instanceof SaveProfileError ? error : null;
      const originalError = saveError?.originalError ?? error;
      const failedOperation = saveError?.operation ?? (wantsPasswordChange ? 'password' : 'username');

      if (failedOperation === 'username') {
        Alert.alert(getUsernameErrorMessage(
          originalError,
          t('myPage.profileEdit.usernameChangeFailed'),
        ));
        return;
      }

      const passwordErrorMessage = getPasswordErrorMessage(originalError, {
        currentPasswordInvalid: t('myPage.profileEdit.currentPasswordInvalid'),
        fallback: t('myPage.profileEdit.passwordChangeFailed'),
        mismatch: t('myPage.profileEdit.passwordMismatch'),
      });
      Alert.alert(
        saveError?.usernameChanged
          ? t('myPage.profileEdit.passwordChangePartialFailure', { reason: passwordErrorMessage })
          : passwordErrorMessage,
      );
    } finally {
      saveActionLock.current = false;
    }
  };

  const isSaving = saveProfile.isPending;
  const isSaveDisabled = isSaving || isProfileLoading || isProfileError || !profile;

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-profile-edit-screen">
      <Content contentContainerStyle={CONTENT_CONTAINER_STYLE} testID="v2-profile-edit-scroll">
        <TopBar>
          <HeaderBackButton
            accessibilityLabel={t('myPage.back')}
            onPress={handleBack}
            testID="v2-profile-edit-back"
          />
          <TopBarTitle>{t('myPage.profileEdit.title')}</TopBarTitle>
          <IconButton
            accessibilityLabel={isSaving
              ? t('myPage.profileEdit.saving')
              : t('myPage.profileEdit.save')}
            accessibilityRole="button"
            accessibilityState={{ busy: isSaving, disabled: isSaveDisabled }}
            disabled={isSaveDisabled}
            hitSlop={8}
            onPress={() => void handleSave()}
            testID="v2-profile-edit-save-header"
          >
            <CheckmarkIcon height={44} width={44} />
          </IconButton>
        </TopBar>

        <AvatarSection>
          <AvatarWrapper
            accessibilityLabel={t('myPage.profileEdit.changeAvatar')}
            accessibilityRole="button"
            accessibilityState={{
              busy: changeProfileImage.isPending,
              disabled: changeProfileImage.isPending,
            }}
            disabled={changeProfileImage.isPending}
            onPress={() => void handleEditAvatar()}
            testID="v2-profile-edit-avatar-action"
          >
            {profile?.profileImageUrl ? (
              <AvatarImage
                source={{ uri: profile.profileImageUrl }}
                testID="v2-profile-edit-avatar-image"
              />
            ) : (
              <AvatarPlaceholder height={82} width={82} />
            )}
            {changeProfileImage.isPending ? (
              <AvatarUploadingOverlay>
                <ActivityIndicator
                  accessibilityLabel={t('myPage.profileEdit.avatarUploading')}
                  accessibilityRole="progressbar"
                  color="#FFFFFF"
                />
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
                accessibilityLabel={t('myPage.profileEdit.username')}
                autoCapitalize="none"
                autoComplete="username"
                onChangeText={handleUsernameChange}
                textContentType="username"
                value={username}
              />
            </FieldRow>
          </Field>

          <Field>
            <FieldLabel>{t('myPage.profileEdit.currentPassword')}</FieldLabel>
            <FieldRow>
              <FieldInput
                accessibilityLabel={t('myPage.profileEdit.currentPassword')}
                autoCapitalize="none"
                autoComplete="current-password"
                onChangeText={setCurrentPassword}
                placeholder={t('myPage.profileEdit.currentPasswordPlaceholder')}
                secureTextEntry={!showCurrentPassword}
                textContentType="password"
                value={currentPassword}
              />
              <EyeButton
                accessibilityLabel={t(
                  showCurrentPassword
                    ? 'myPage.profileEdit.hidePassword'
                    : 'myPage.profileEdit.showPassword',
                  { field: t('myPage.profileEdit.currentPassword') },
                )}
                accessibilityRole="button"
                accessibilityState={{ selected: showCurrentPassword }}
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
                accessibilityLabel={t('myPage.profileEdit.newPassword')}
                autoCapitalize="none"
                autoComplete="new-password"
                onChangeText={setNewPassword}
                placeholder={t('myPage.profileEdit.newPasswordPlaceholder')}
                secureTextEntry={!showNewPassword}
                textContentType="newPassword"
                value={newPassword}
              />
              <EyeButton
                accessibilityLabel={t(
                  showNewPassword
                    ? 'myPage.profileEdit.hidePassword'
                    : 'myPage.profileEdit.showPassword',
                  { field: t('myPage.profileEdit.newPassword') },
                )}
                accessibilityRole="button"
                accessibilityState={{ selected: showNewPassword }}
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
                accessibilityLabel={t('myPage.profileEdit.confirmPassword')}
                autoCapitalize="none"
                autoComplete="new-password"
                onChangeText={setConfirmPassword}
                placeholder={t('myPage.profileEdit.confirmPasswordPlaceholder')}
                secureTextEntry={!showConfirmPassword}
                textContentType="newPassword"
                value={confirmPassword}
              />
              <EyeButton
                accessibilityLabel={t(
                  showConfirmPassword
                    ? 'myPage.profileEdit.hidePassword'
                    : 'myPage.profileEdit.showPassword',
                  { field: t('myPage.profileEdit.confirmPassword') },
                )}
                accessibilityRole="button"
                accessibilityState={{ selected: showConfirmPassword }}
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
          accessibilityLabel={isSaving
            ? t('myPage.profileEdit.saving')
            : t('myPage.profileEdit.save')}
          accessibilityRole="button"
          accessibilityState={{ busy: isSaving, disabled: isSaveDisabled }}
          disabled={isSaveDisabled}
          onPress={() => void handleSave()}
          testID="v2-profile-edit-save-bottom"
        >
          <SaveButtonText>
            {isSaving ? t('myPage.profileEdit.saving') : t('myPage.profileEdit.save')}
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

const Content = styled.ScrollView.attrs({
  automaticallyAdjustKeyboardInsets: true,
  keyboardShouldPersistTaps: 'handled',
})`
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
