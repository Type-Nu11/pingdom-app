import React, { useEffect, useRef, useState } from 'react';
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

type SignUpCertificationScreenProps = {
  phoneNumber?: string;
  onBack?: () => void;
  onVerified?: () => void;
  isEmail?: boolean;
};

export default function SignUpCertificationScreen({
  onBack,
  onVerified,
  isEmail = false,
}: SignUpCertificationScreenProps) {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(179);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetTimer = () => {
    setTimeLeft(179);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isVerifyActive = code.length === 6;

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
          <ProgressDots total={3} current={1} />
        </View>
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.topContent}>
          <Text style={styles.title}>{isEmail ? '이메일 인증' : '인증번호 받기'}</Text>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>인증번호</Text>
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="6자리 입력"
                placeholderTextColor="#BFC1C1"
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            </View>
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>인증번호가 오지 않았나요? </Text>
              <Pressable onPress={resetTimer}>
                <Text style={styles.resendLink}>재전송</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.verifyButton, !isVerifyActive && styles.verifyButtonDisabled]}
          onPress={() => isVerifyActive && onVerified?.()}
          disabled={!isVerifyActive}
        >
          <Text style={styles.verifyButtonText}>인증하기</Text>
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
  fieldGroup: {
    width: '100%',
    gap: 8,
  },
  labelRow: {},
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: PINK,
    letterSpacing: -0.28,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FF4A75',
    paddingTop: 8,
    paddingBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '500',
    color: '#0C0C0D',
    height: 40,
    padding: 0,
  },
  timer: {
    fontSize: 18,
    fontWeight: '500',
    color: PINK,
  },
  errorText: {
    fontSize: 13,
    color: '#EE2B2B',
    marginTop: 4,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#767680',
  },
  resendLink: {
    fontSize: 16,
    fontWeight: '500',
    color: '#767680',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    width: '100%',
    height: 64,
    backgroundColor: PINK,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#D1D4D5',
  },
  verifyButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
