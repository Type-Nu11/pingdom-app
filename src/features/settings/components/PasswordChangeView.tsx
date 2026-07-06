import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import SettingsNavBar from './SettingsNavBar';

type PasswordChangeViewProps = {
  onBack: () => void;
};

const PasswordChangeView = ({ onBack }: PasswordChangeViewProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('모든 항목을 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    Alert.alert('비밀번호가 변경되었습니다');
    onBack();
  };

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="비밀번호 변경" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>현재 비밀번호</Text>
          <TextInput
            secureTextEntry
            placeholder="현재 비밀번호 입력"
            placeholderTextColor="#d1d4d5"
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>새 비밀번호</Text>
          <TextInput
            secureTextEntry
            placeholder="영문, 숫자 포함 8자 이상"
            placeholderTextColor="#d1d4d5"
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>새 비밀번호 확인</Text>
          <TextInput
            secureTextEntry
            placeholder="새 비밀번호 다시 입력"
            placeholderTextColor="#d1d4d5"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>변경하기</Text>
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
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
  },
});

export default PasswordChangeView;
