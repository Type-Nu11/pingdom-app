import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CONTACT_TYPES } from '../constants/legalContent';
import SettingsNavBar from './SettingsNavBar';

type ContactUsViewProps = {
  defaultEmail: string;
  onBack: () => void;
};

const ContactUsView = ({ defaultEmail, onBack }: ContactUsViewProps) => {
  const [type, setType] = useState(CONTACT_TYPES[0]);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) {
      Alert.alert('문의 내용을 입력해주세요.');
      return;
    }

    Alert.alert('문의가 접수되었습니다');
    onBack();
  };

  return (
    <View style={styles.screen}>
      <SettingsNavBar title="문의하기" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>문의 유형</Text>
          <View style={styles.typeRow}>
            {CONTACT_TYPES.map((option) => (
              <Pressable
                key={option}
                style={[styles.typeChip, type === option && styles.typeChipActive]}
                onPress={() => setType(option)}
              >
                <Text style={[styles.typeChipText, type === option && styles.typeChipTextActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>답변받을 이메일</Text>
          <TextInput
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>문의 내용</Text>
          <TextInput
            multiline
            placeholder="문의 내용을 자세히 입력해주세요."
            placeholderTextColor="#d1d4d5"
            style={styles.textarea}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>보내기</Text>
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
  typeChip: {
    borderColor: '#e4e4e5',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  typeChipActive: {
    backgroundColor: '#ff1956',
    borderColor: '#ff1956',
  },
  typeChipText: {
    color: '#3b3b40',
    fontSize: 13,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default ContactUsView;
