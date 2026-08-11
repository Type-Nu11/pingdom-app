import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  useDownloadUserDataExport,
  useGoogleLink,
  useGoogleUnlink,
} from '../../../../v2/features/account';
import {
  useLogout,
  usePasswordResetConfirm,
  usePasswordResetRequest,
  useResendVerificationEmail,
} from '../../../../v2/features/auth';
import { getApiErrorUx } from '../../../../v2/shared/api';
import type { TemporaryAccountSessionEndpoint } from './model';

type Props = {
  endpoint: TemporaryAccountSessionEndpoint;
  onBack: () => void;
};

type TestResult =
  | { data?: unknown; kind: 'success' }
  | { error: unknown; kind: 'error' };

function getErrorDebug(error: unknown) {
  const ux = getApiErrorUx(error);
  return [
    `분류: ${ux.kind}`,
    `HTTP: ${ux.error.status ?? '-'}`,
    `code: ${ux.error.code ?? '-'}`,
    `message: ${ux.error.message}`,
  ].join('\n');
}

export default function TemporaryAccountSessionApiCheckPage({ endpoint, onBack }: Props) {
  const requestPasswordReset = usePasswordResetRequest();
  const confirmPasswordReset = usePasswordResetConfirm();
  const resendVerificationEmail = useResendVerificationEmail();
  const googleLink = useGoogleLink();
  const googleUnlink = useGoogleUnlink();
  const downloadUserDataExport = useDownloadUserDataExport();
  const logout = useLogout();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [result, setResult] = useState<TestResult | null>(null);

  const callbacks = {
    onError: (error: unknown) => setResult({ error, kind: 'error' }),
    onSuccess: (data: unknown) => setResult({ data, kind: 'success' }),
  };

  const isPending =
    requestPasswordReset.isPending || confirmPasswordReset.isPending ||
    resendVerificationEmail.isPending || googleLink.isPending || googleUnlink.isPending ||
    downloadUserDataExport.isPending || logout.isPending;

  const needsEmail = endpoint === 'POST /auth/password-reset/request' ||
    endpoint === 'POST /auth/password-reset/confirm' ||
    endpoint === 'POST /auth/email/resend';
  const isConfirm = endpoint === 'POST /auth/password-reset/confirm';
  const isUnlink = endpoint === 'DELETE /users/me/oauth-accounts/google';
  const isInputValid = endpoint === 'POST /auth/password-reset/request' ||
    endpoint === 'POST /auth/email/resend'
    ? Boolean(email.trim())
    : isConfirm
      ? Boolean(
          email.trim() && resetToken.trim() &&
          newPassword.length >= 8 && confirmPassword.length >= 8
        )
      : true;

  const execute = () => {
    setResult(null);

    switch (endpoint) {
      case 'POST /auth/password-reset/request':
        requestPasswordReset.mutate({ email: email.trim() }, callbacks);
        break;
      case 'POST /auth/password-reset/confirm':
        confirmPasswordReset.mutate({
          confirmPassword,
          email: email.trim(),
          newPassword,
          token: resetToken.trim(),
        }, callbacks);
        break;
      case 'POST /auth/logout':
        logout.mutate(undefined, callbacks);
        break;
      case 'POST /auth/email/resend':
        resendVerificationEmail.mutate({ email: email.trim() }, callbacks);
        break;
      case 'POST /users/me/oauth-accounts/google/link':
        googleLink.mutate(undefined, callbacks);
        break;
      case 'DELETE /users/me/oauth-accounts/google':
        googleUnlink.mutate(currentPassword ? { currentPassword } : {}, callbacks);
        break;
      case 'GET /users/me/export':
        downloadUserDataExport.mutate(undefined, callbacks);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="API 목록으로 돌아가기" hitSlop={12} onPress={onBack}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>API 테스트</Text>
          <Text selectable style={styles.endpointTitle}>{endpoint}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {needsEmail ? (
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="이메일"
            placeholderTextColor="#000000"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        ) : null}
        {isConfirm ? (
          <>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="서버가 이메일로 발급한 reset token"
              placeholderTextColor="#000000"
              style={styles.input}
              value={resetToken}
              onChangeText={setResetToken}
            />
            <TextInput
              placeholder="새 비밀번호 (8자 이상)"
              placeholderTextColor="#000000"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              placeholder="새 비밀번호 확인"
              placeholderTextColor="#000000"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </>
        ) : null}
        {isUnlink ? (
          <TextInput
            placeholder="현재 비밀번호 (필요한 경우)"
            placeholderTextColor="#000000"
            secureTextEntry
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        ) : null}

        {endpoint === 'POST /users/me/oauth-accounts/google/link' ? (
          <Text style={styles.guide}>
            서버가 반환한 authorizationUrl을 브라우저로 엽니다. 완료 후 앱으로 돌아오세요.
          </Text>
        ) : null}
        {endpoint === 'GET /users/me/export' ? (
          <Text style={styles.guide}>
            iOS/Android에서는 JSON 파일 공유 시트가 열리고 Web에서는 다운로드됩니다.
          </Text>
        ) : null}
        {endpoint === 'POST /auth/logout' ? (
          <Text style={styles.warning}>
            실행 즉시 서버 세션, 로컬 토큰, Query cache를 정리하고 로그인 화면으로 이동합니다.
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!isInputValid || isPending}
          style={[styles.executeButton, (!isInputValid || isPending) && styles.disabled]}
          onPress={execute}
        >
          <Text style={styles.executeText}>{isPending ? '요청 중...' : '요청 실행'}</Text>
        </Pressable>

        {result?.kind === 'error' ? (
          <Text selectable style={styles.error}>{getErrorDebug(result.error)}</Text>
        ) : null}
        {result?.kind === 'success' ? (
          <View style={styles.result}>
            <Text style={styles.success}>요청 성공</Text>
            <Text selectable style={styles.json}>
              {result.data === undefined ? '(응답 본문 없음)' : JSON.stringify(result.data, null, 2)}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backText: { color: '#0c0c0d', fontSize: 48, fontWeight: '300', lineHeight: 48 },
  content: { gap: 14, padding: 24 },
  disabled: { opacity: 0.5 },
  endpointTitle: { color: '#6e6e76', fontSize: 13, marginTop: 2 },
  error: {
    backgroundColor: '#fff1f3', borderRadius: 14, color: '#b4233c',
    fontFamily: 'monospace', fontSize: 13, lineHeight: 20, padding: 16,
  },
  executeButton: {
    alignItems: 'center', backgroundColor: '#ff4771', borderRadius: 24,
    justifyContent: 'center', minHeight: 64, marginTop: 8,
  },
  executeText: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  guide: { color: '#57575e', fontSize: 15, lineHeight: 22 },
  header: {
    alignItems: 'center', borderBottomColor: '#ededee', borderBottomWidth: 1,
    flexDirection: 'row', gap: 14, paddingHorizontal: 24, paddingVertical: 14,
  },
  headerCopy: { flex: 1 },
  input: {
    backgroundColor: '#f6f6f7', borderColor: '#d8d8dc', borderRadius: 14,
    borderWidth: 1, color: '#000000', fontSize: 15, minHeight: 52,
    paddingHorizontal: 16, paddingVertical: 11,
  },
  json: { color: '#3b3b40', fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  result: { backgroundColor: '#f0fbf5', borderRadius: 14, gap: 8, padding: 16 },
  safeArea: { backgroundColor: '#ffffff', flex: 1 },
  success: { color: '#087443', fontSize: 15, fontWeight: '800' },
  title: { color: '#202024', fontSize: 22, fontWeight: '800' },
  warning: {
    backgroundColor: '#fff1f3', borderRadius: 14, color: '#b4233c',
    fontSize: 15, lineHeight: 22, padding: 16,
  },
});
