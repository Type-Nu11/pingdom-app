import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors } from '../../../styles/colors';
import { radius } from '../../../styles/radius';
import { spacing } from '../../../styles/spacing';

type PhoneVerifyScreenProps = {
  onBack?: () => void;
  onLogin?: () => void;
  onComplete?: () => void;
};

export default function PhoneVerifyScreen({ onBack, onLogin, onComplete }: PhoneVerifyScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

    return (
        <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <Pressable style={styles.back} onPress={onBack}>
            <Text style={styles.backText}>‹ 돌아가기</Text>
        </Pressable>

        <Text style={styles.title}>전화번호 인증</Text>

        <View style={styles.phoneRow}>
            <View style={styles.phoneInputWrap}>
            <Input
                placeholder="010 - 0000 - 0000"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
            />
            </View>
        <Pressable
          style={styles.verifyButton}
          onPress={() => {}}
        >
          <Text style={styles.verifyButtonText}>인증</Text>
        </Pressable>
      </View>

        <Input
            placeholder="인증번호 입력"
            value={verificationCode}
            onChangeText={setVerificationCode}
        />

      <Button
        title="완료"
        onPress={() => {
          onComplete?.();
        }}
      />

        <View style={styles.loginRow}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <Pressable onPress={onLogin}>
            <Text style={styles.loginLink}>로그인</Text>
            </Pressable>
        </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg + spacing.xs,
        paddingTop: spacing.xl * 2 + spacing.lg - spacing.xs,
    },
    back: {
        marginBottom: spacing.lg + spacing.xs,
    },
    backText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.border,
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: colors.border,
        marginBottom: spacing.lg + spacing.xs,
    },
    phoneRow: {
        position: 'relative',
        marginBottom: spacing.md + spacing.xs,
    },
    phoneInputWrap: {
        paddingRight: 96,
    },
    verifyButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        height: 42,
        minWidth: 62,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: radius.md - 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        backgroundColor: colors.background,
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.border,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl * 2 + spacing.sm,
    },
    loginText: {
        fontSize: 16,
        color: colors.textMuted,
    },
    loginLink: {
        fontSize: 16,
        color: colors.accent,
        textDecorationLine: 'underline',
    },
});
