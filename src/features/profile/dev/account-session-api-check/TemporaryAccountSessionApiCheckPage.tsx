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
import {
  useDeleteFcmToken,
  useNotificationSettings,
  useRegisterFcmToken,
  useUpdateNotificationSettings,
  type NotificationSettingUpdateRequest,
} from '../../../../v2/features/notifications';
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
  const registerFcmToken = useRegisterFcmToken();
  const deleteFcmToken = useDeleteFcmToken();
  // The API check page fires GET only when the tester presses the execute button.
  const notificationSettings = useNotificationSettings(false);
  const updateNotificationSettings = useUpdateNotificationSettings();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [newHotplaceEnabled, setNewHotplaceEnabled] = useState(true);
  const [newLikeEnabled, setNewLikeEnabled] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00:00');
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [result, setResult] = useState<TestResult | null>(null);

  const callbacks = {
    onError: (error: unknown) => setResult({ error, kind: 'error' }),
    onSuccess: (data: unknown) => setResult({ data, kind: 'success' }),
  };

  const isPending =
    requestPasswordReset.isPending || confirmPasswordReset.isPending ||
    resendVerificationEmail.isPending || googleLink.isPending || googleUnlink.isPending ||
    downloadUserDataExport.isPending || logout.isPending || registerFcmToken.isPending ||
    deleteFcmToken.isPending || notificationSettings.isFetching ||
    updateNotificationSettings.isPending;

  const needsEmail = endpoint === 'POST /auth/password-reset/request' ||
    endpoint === 'POST /auth/password-reset/confirm' ||
    endpoint === 'POST /auth/email/resend';
  const isConfirm = endpoint === 'POST /auth/password-reset/confirm';
  const isUnlink = endpoint === 'DELETE /users/me/oauth-accounts/google';
  const needsFcmToken = endpoint === 'POST /firebase/fcm-tokens' ||
    endpoint === 'DELETE /firebase/fcm-tokens';
  const isNotificationSettingsUpdate = endpoint === 'PATCH /notifications/settings';
  const isInputValid = endpoint === 'POST /auth/password-reset/request' ||
    endpoint === 'POST /auth/email/resend'
    ? Boolean(email.trim())
    : isConfirm
      ? Boolean(
          email.trim() && resetToken.trim() &&
          newPassword.length >= 8 && confirmPassword.length >= 8
        )
      : needsFcmToken
        ? Boolean(fcmToken.trim())
        : isNotificationSettingsUpdate
          ? Boolean(timezone.trim()) && (
              !quietHoursEnabled || Boolean(quietHoursStart.trim() && quietHoursEnd.trim())
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
      case 'POST /firebase/fcm-tokens':
        registerFcmToken.mutate({ token: fcmToken.trim() }, callbacks);
        break;
      case 'DELETE /firebase/fcm-tokens':
        deleteFcmToken.mutate({ token: fcmToken.trim() }, callbacks);
        break;
      case 'GET /notifications/settings':
        void notificationSettings.refetch().then(({ data, error, isError }) => {
          if (isError) callbacks.onError(error);
          else callbacks.onSuccess(data);
        });
        break;
      case 'PATCH /notifications/settings': {
        const body: NotificationSettingUpdateRequest = {
          newHotplaceEnabled,
          newLikeEnabled,
          quietHoursEnabled,
          timezone: timezone.trim(),
          ...(quietHoursEnabled ? {
            quietHoursEnd: quietHoursEnd.trim(),
            quietHoursStart: quietHoursStart.trim(),
          } : {}),
        };
        updateNotificationSettings.mutate(body, callbacks);
        break;
      }
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
        {needsFcmToken ? (
          <>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              placeholder="실기기 FCM token"
              placeholderTextColor="#000000"
              style={[styles.input, styles.tokenInput]}
              value={fcmToken}
              onChangeText={setFcmToken}
            />
            <Text style={styles.guide}>
              Firebase에서 발급된 현재 기기 token을 입력합니다. OS 알림 권한과 서버 알림 설정은 별도 상태입니다.
            </Text>
          </>
        ) : null}
        {isNotificationSettingsUpdate ? (
          <View style={styles.settingsForm}>
            <SettingToggle
              label="신규 핫플레이스 알림"
              value={newHotplaceEnabled}
              onChange={setNewHotplaceEnabled}
            />
            <SettingToggle
              label="신규 좋아요 알림"
              value={newLikeEnabled}
              onChange={setNewLikeEnabled}
            />
            <SettingToggle
              label="방해 금지 시간"
              value={quietHoursEnabled}
              onChange={setQuietHoursEnabled}
            />
            {quietHoursEnabled ? (
              <>
                <TextInput
                  placeholder="시작 시각 (예: 22:00:00)"
                  placeholderTextColor="#000000"
                  style={styles.input}
                  value={quietHoursStart}
                  onChangeText={setQuietHoursStart}
                />
                <TextInput
                  placeholder="종료 시각 (예: 08:00:00)"
                  placeholderTextColor="#000000"
                  style={styles.input}
                  value={quietHoursEnd}
                  onChangeText={setQuietHoursEnd}
                />
              </>
            ) : null}
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="IANA timezone (예: Asia/Seoul)"
              placeholderTextColor="#000000"
              style={styles.input}
              value={timezone}
              onChangeText={setTimezone}
            />
          </View>
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
  settingsForm: { gap: 12 },
  success: { color: '#087443', fontSize: 15, fontWeight: '800' },
  title: { color: '#202024', fontSize: 22, fontWeight: '800' },
  tokenInput: { minHeight: 96, textAlignVertical: 'top' },
  toggle: {
    alignItems: 'center', backgroundColor: '#f6f6f7', borderRadius: 14,
    flexDirection: 'row', justifyContent: 'space-between', minHeight: 52,
    paddingHorizontal: 16,
  },
  toggleLabel: { color: '#202024', fontSize: 15, fontWeight: '600' },
  toggleValue: { color: '#ff1956', fontSize: 14, fontWeight: '800' },
  warning: {
    backgroundColor: '#fff1f3', borderRadius: 14, color: '#b4233c',
    fontSize: 15, lineHeight: 22, padding: 16,
  },
});

function SettingToggle({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={styles.toggle}
      onPress={() => onChange(!value)}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text style={styles.toggleValue}>{value ? 'ON' : 'OFF'}</Text>
    </Pressable>
  );
}
