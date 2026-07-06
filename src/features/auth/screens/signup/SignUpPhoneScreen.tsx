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
import { colors } from '../../../../styles/colors';
import usePhoneVerification from '../../hooks/usePhoneVerification';
import { validatePhoneNumber } from '../../lib/validators';
import ProgressDots from './components/ProgressDots';

const ESCAPE_SVG = `<svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 1.25L1.25 10.25L10.25 19.25" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

type SignUpPhoneScreenProps = {
  onBack?: () => void;
  onNext?: (phoneNumber: string) => void;
};

export default function SignUpPhoneScreen({ onBack, onNext }: SignUpPhoneScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { sendCode, isSending, errorMessage, clearError } = usePhoneVerification();

  const isActive = phoneNumber.trim().length > 0 && !isSending;
  const displayedError = fieldError ?? errorMessage;

  const handleNext = async () => {
    if (!isActive) return;

    const trimmed = phoneNumber.trim();
    const validationError = validatePhoneNumber(trimmed);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setFieldError(null);
    clearError();
    const ok = await sendCode(trimmed);
    if (ok) onNext?.(trimmed);
  };

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
          <View>
            <View style={[styles.inputWrap, displayedError ? styles.inputWrapError : undefined]}>
              <TextInput
                style={styles.input}
                placeholder="ex) 010 1234 5678"
                placeholderTextColor={colors.placeholder}
                value={phoneNumber}
                onChangeText={(v) => {
                  setPhoneNumber(v);
                  setFieldError(null);
                  clearError();
                }}
                keyboardType="phone-pad"
              />
            </View>
            {displayedError ? <Text style={styles.errorText}>{displayedError}</Text> : null}
          </View>
        </View>

        <Pressable
          style={[styles.button, isActive ? styles.buttonActive : styles.buttonDisabled]}
          onPress={() => void handleNext()}
          disabled={!isActive}
        >
          <Text style={[styles.buttonText, isActive ? styles.buttonTextActive : styles.buttonTextDisabled]}>
            {isSending ? '전송 중...' : '다음'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgAssistive,
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
    color: colors.labelStrong,
  },
  inputWrap: {
    borderBottomWidth: 2,
    borderBottomColor: colors.placeholder,
    paddingTop: 8,
    paddingBottom: 6,
    paddingRight: 16,
  },
  inputWrapError: {
    borderBottomColor: colors.error,
  },
  input: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.labelStrong,
    height: 40,
    padding: 0,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
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
    backgroundColor: colors.primaryNormal,
  },
  buttonDisabled: {
    backgroundColor: colors.disabledBg,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: colors.white,
  },
  buttonTextDisabled: {
    color: colors.labelAlternative,
  },
});
