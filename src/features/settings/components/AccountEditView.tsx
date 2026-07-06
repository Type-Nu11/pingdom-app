import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PROFILE_USERNAME, profileImageSource } from '../../profile/constants/profileMock';
import SettingsNavBar from './SettingsNavBar';

type AccountEditViewProps = {
  onBack: () => void;
};

const AccountEditView = ({ onBack }: AccountEditViewProps) => {
  const [nickname, setNickname] = useState(PROFILE_USERNAME);
  const [bio, setBio] = useState('동네 맛집과 여행지를 기록합니다.');

  const handleSave = () => {
    Alert.alert('프로필이 저장되었습니다');
    onBack();
  };

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="프로필 수정" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarWrap}>
          <Image source={profileImageSource} resizeMode="cover" style={styles.avatar} />
        </View>
        <Pressable onPress={() => Alert.alert('사진 선택')}>
          <Text style={styles.avatarEdit}>사진 변경</Text>
        </Pressable>

        <View style={styles.field}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput style={styles.input} value={nickname} onChangeText={setNickname} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>소개</Text>
          <TextInput
            multiline
            maxLength={60}
            style={styles.textarea}
            value={bio}
            onChangeText={setBio}
          />
          <Text style={styles.hint}>최대 60자까지 입력할 수 있습니다.</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>저장하기</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 44,
    height: 88,
    width: 88,
  },
  avatarEdit: {
    alignSelf: 'center',
    color: '#ff1956',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  avatarWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
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
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
  },
  textarea: {
    borderColor: '#e4e4e5',
    borderRadius: 12,
    borderWidth: 1.5,
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    minHeight: 88,
    padding: 12,
    textAlignVertical: 'top',
  },
});

export default AccountEditView;
