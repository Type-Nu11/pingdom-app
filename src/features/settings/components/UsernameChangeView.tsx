import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { profileApi, type ProfileResponse } from '../../profile/api/profileApi';
import { profileQueryKeys } from '../../profile/hooks/useProfile';
import SettingsNavBar from './SettingsNavBar';

type UsernameChangeViewProps = {
  onBack: () => void;
  profile: ProfileResponse | null;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { errors?: Record<string, string>; message?: string } | undefined;
    return data?.errors?.newUsername ?? data?.message ?? '아이디 변경에 실패했습니다.';
  }

  return '아이디 변경에 실패했습니다.';
}

const UsernameChangeView = ({ onBack, profile }: UsernameChangeViewProps) => {
  const [newUsername, setNewUsername] = useState(profile?.username ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    const trimmed = newUsername.trim();

    if (!trimmed) {
      Alert.alert('변경할 아이디를 입력해주세요.');
      return;
    }

    if (trimmed === profile?.username) {
      Alert.alert('현재 아이디와 동일합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      await profileApi.changeUsername(trimmed);
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
      Alert.alert('아이디가 변경되었습니다');
      onBack();
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(getErrorMessage(error));
    }
  };

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="아이디 변경" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            autoCapitalize="none"
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
          />
          <Text style={styles.hint}>4자 이상 50자 이하로 입력해주세요.</Text>
        </View>

        <Pressable
          disabled={isSubmitting}
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={handleSave}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? '변경 중...' : '변경하기'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  field: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  hint: {
    color: '#d1d4d5',
    fontSize: 12,
    marginTop: 6,
  },
  input: {
    borderBottomColor: '#bdbebe',
    borderBottomWidth: 1.5,
    color: '#5e5e66',
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 10,
  },
  label: {
    color: '#5c5e5e',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: '#d1d4d5',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
  },
});

export default UsernameChangeView;
