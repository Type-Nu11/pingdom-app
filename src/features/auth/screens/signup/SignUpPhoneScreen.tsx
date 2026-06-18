import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import ProgressDots from './components/ProgressDots';

const ESCAPE_SVG = `<svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 1.25L1.25 10.25L10.25 19.25" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const PINK = '#FF1956';
const BG = '#F8F8F8';

type SignUpPhoneScreenProps = {
  onBack?: () => void;
  onNext?: (phoneNumber: string) => void;
};

export default function SignUpPhoneScreen({ onBack, onNext }: SignUpPhoneScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const isActive = phoneNumber.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
          <SvgXml xml={ESCAPE_SVG} width={12} height={21} />
        </Pressable>
        <View style={styles.headerCenter}>
          <ProgressDots total={3} current={0} />
        </View>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.topContent}>
          <Text style={styles.title}>전화번호 인증</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="ex) 010 1234 5678"
              placeholderTextColor="#BFC1C1"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Pressable
          style={[styles.button, isActive ? styles.buttonActive : styles.buttonDisabled]}
          onPress={() => isActive && onNext?.(phoneNumber.trim())}
          disabled={!isActive}
        >
          <Text style={[styles.buttonText, isActive ? styles.buttonTextActive : styles.buttonTextDisabled]}>
            다음
          </Text>
        </Pressable>
      </View>
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
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 52,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topContent: {
    width: '100%',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0C0C0D',
  },
  inputWrap: {
    borderBottomWidth: 2,
    borderBottomColor: '#BFC1C1',
    paddingTop: 8,
    paddingBottom: 6,
    paddingRight: 16,
  },
  input: {
    fontSize: 24,
    fontWeight: '500',
    color: '#0C0C0D',
    height: 40,
    padding: 0,
  },
  errorText: {
    fontSize: 13,
    color: '#EE2B2B',
    marginTop: 4,
  },
  button: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: PINK,
  },
  buttonDisabled: {
    backgroundColor: '#D1D4D5',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#5E5E66',
  },
});
