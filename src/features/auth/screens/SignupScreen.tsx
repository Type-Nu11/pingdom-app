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

type SignupScreenProps = {
  onBack?: () => void;
  onLogin?: () => void;
  onComplete?: () => void;
};

export default function SignupScreen({ onBack, onLogin, onComplete }: SignupScreenProps) {
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
          onPress={() => {
            console.log('인증 요청');
          }}
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
          console.log('회원가입 입력 단계로 이동');
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
        backgroundColor: '#fff',
        paddingHorizontal: 28,
        paddingTop: 84,
    },
    back: {
        marginBottom: 28,
    },
    backText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#000',
        marginBottom: 28,
    },
    phoneRow: {
        position: 'relative',
        marginBottom: 20,
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
        borderColor: '#000',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        backgroundColor: '#fff',
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 72,
    },
    loginText: {
        fontSize: 16,
        color: '#555',
    },
    loginLink: {
        fontSize: 16,
        color: '#ff2b6d',
        textDecorationLine: 'underline',
    },
});
