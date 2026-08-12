import { render, screen, userEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

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
} from '../../../../v2/features/notifications';
import {
  useReplaceTravelPurposes,
  useTravelPurposes,
} from '../../../../v2/features/travel-purposes';
import {
  TemporaryAccountSessionApiCheckFlow,
  TemporaryAccountSessionApiCheckPage,
} from '../../dev/account-session-api-check';
import ApiCheckScreen from '../ApiCheckScreen';

jest.mock('../../../../v2/features/account', () => ({
  useDownloadUserDataExport: jest.fn(),
  useGoogleLink: jest.fn(),
  useGoogleUnlink: jest.fn(),
}));

jest.mock('../../../../v2/features/auth', () => ({
  useLogout: jest.fn(),
  usePasswordResetConfirm: jest.fn(),
  usePasswordResetRequest: jest.fn(),
  useResendVerificationEmail: jest.fn(),
}));

jest.mock('../../../../v2/features/notifications', () => ({
  useDeleteFcmToken: jest.fn(),
  useNotificationSettings: jest.fn(),
  useRegisterFcmToken: jest.fn(),
  useUpdateNotificationSettings: jest.fn(),
}));

jest.mock('../../../../v2/features/travel-purposes', () => ({
  TRAVEL_PURPOSE_MAX_SELECTIONS: 9,
  TRAVEL_PURPOSE_VALUES: [
    'K_POP',
    'BEAUTY',
    'FASHION',
    'CAFE',
    'FOOD',
    'POP_UP',
    'EXHIBITION',
    'NIGHTLIFE',
    'OTHER',
  ],
  useReplaceTravelPurposes: jest.fn(),
  useTravelPurposes: jest.fn(),
}));

const mockUseTravelPurposes = jest.mocked(useTravelPurposes);
const mockUseReplaceTravelPurposes = jest.mocked(useReplaceTravelPurposes);
const mockUseDownloadUserDataExport = jest.mocked(useDownloadUserDataExport);
const mockUseGoogleLink = jest.mocked(useGoogleLink);
const mockUseGoogleUnlink = jest.mocked(useGoogleUnlink);
const mockUseLogout = jest.mocked(useLogout);
const mockUsePasswordResetConfirm = jest.mocked(usePasswordResetConfirm);
const mockUsePasswordResetRequest = jest.mocked(usePasswordResetRequest);
const mockUseResendVerificationEmail = jest.mocked(useResendVerificationEmail);
const mockUseDeleteFcmToken = jest.mocked(useDeleteFcmToken);
const mockUseNotificationSettings = jest.mocked(useNotificationSettings);
const mockUseRegisterFcmToken = jest.mocked(useRegisterFcmToken);
const mockUseUpdateNotificationSettings = jest.mocked(useUpdateNotificationSettings);

function mutationResult(mutate = jest.fn()) {
  return {
    data: undefined,
    error: null,
    isError: false,
    isPending: false,
    isSuccess: false,
    mutate,
  };
}

describe('ApiCheckScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDownloadUserDataExport.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useDownloadUserDataExport>,
    );
    mockUseGoogleLink.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useGoogleLink>,
    );
    mockUseGoogleUnlink.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useGoogleUnlink>,
    );
    mockUseLogout.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useLogout>,
    );
    mockUsePasswordResetConfirm.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof usePasswordResetConfirm>,
    );
    mockUsePasswordResetRequest.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof usePasswordResetRequest>,
    );
    mockUseResendVerificationEmail.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useResendVerificationEmail>,
    );
    mockUseDeleteFcmToken.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useDeleteFcmToken>,
    );
    mockUseRegisterFcmToken.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useRegisterFcmToken>,
    );
    mockUseUpdateNotificationSettings.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useUpdateNotificationSettings>,
    );
    mockUseNotificationSettings.mockReturnValue({
      isFetching: false,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useNotificationSettings>);
  });

  test('GET 결과를 복원하고 변경된 선택을 PUT body로 전달한다', async () => {
    const mutate = jest.fn();
    mockUseTravelPurposes.mockReturnValue({
      data: { travelPurposes: ['K_POP'] },
      isError: false,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useTravelPurposes>);
    mockUseReplaceTravelPurposes.mockReturnValue({
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate,
    } as unknown as ReturnType<typeof useReplaceTravelPurposes>);

    await render(<ApiCheckScreen onBack={jest.fn()} />);
    const user = userEvent.setup();

    expect(screen.getByText('200 조회 성공')).toBeVisible();
    expect(screen.getAllByText(/"K_POP"/).length).toBeGreaterThan(0);

    await user.press(screen.getByRole('button', { name: 'FOOD' }));
    await user.press(screen.getByRole('button', { name: 'PUT 저장하기' }));

    expect(mutate).toHaveBeenCalledWith({ travelPurposes: ['K_POP', 'FOOD'] });
  });

  test('endpoint를 선택하면 임시 nested route로 이동하고 목록으로 돌아온다', async () => {
    mockUseTravelPurposes.mockReturnValue({
      data: { travelPurposes: [] },
      isError: false,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useTravelPurposes>);
    mockUseReplaceTravelPurposes.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useReplaceTravelPurposes>,
    );

    await render(
      <NavigationContainer>
        <TemporaryAccountSessionApiCheckFlow onExit={jest.fn()} />
      </NavigationContainer>,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', {
      name: 'POST /auth/password-reset/request',
    }));

    expect(screen.getByText('API 테스트')).toBeVisible();

    await user.press(screen.getByLabelText('API 목록으로 돌아가기'));
    expect(screen.getByText('API 확인하기')).toBeVisible();
  });

  test('전용 테스트 페이지에서 요청하고 navigation 뒤로 가기를 호출한다', async () => {
    const requestReset = jest.fn();
    const onBack = jest.fn();
    mockUsePasswordResetRequest.mockReturnValue(
      mutationResult(requestReset) as unknown as ReturnType<typeof usePasswordResetRequest>,
    );

    await render(
      <TemporaryAccountSessionApiCheckPage
        endpoint="POST /auth/password-reset/request"
        onBack={onBack}
      />,
    );
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('이메일'), 'device@example.com');
    await user.press(screen.getByRole('button', { name: '요청 실행' }));

    expect(requestReset).toHaveBeenCalledWith(
      { email: 'device@example.com' },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );

    await user.press(screen.getByLabelText('API 목록으로 돌아가기'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('데이터 내보내기 전용 테스트 페이지에서 export Hook을 실행한다', async () => {
    const exportData = jest.fn();
    const onBack = jest.fn();
    mockUseDownloadUserDataExport.mockReturnValue(
      mutationResult(exportData) as unknown as ReturnType<typeof useDownloadUserDataExport>,
    );
    await render(
      <TemporaryAccountSessionApiCheckPage endpoint="GET /users/me/export" onBack={onBack} />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: '요청 실행' }));

    expect(exportData).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );
  });

  test('API 목록에 #166 FCM 및 알림 설정 endpoint 버튼을 표시한다', async () => {
    mockUseTravelPurposes.mockReturnValue({
      data: { travelPurposes: [] },
      isError: false,
      isPending: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof useTravelPurposes>);
    mockUseReplaceTravelPurposes.mockReturnValue(
      mutationResult() as unknown as ReturnType<typeof useReplaceTravelPurposes>,
    );

    await render(
      <NavigationContainer>
        <TemporaryAccountSessionApiCheckFlow onExit={jest.fn()} />
      </NavigationContainer>,
    );

    expect(screen.getByText('FCM·알림 설정 API · #166 실기기 검증')).toBeVisible();
    expect(screen.getByRole('button', { name: 'POST /firebase/fcm-tokens' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'DELETE /firebase/fcm-tokens' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'GET /notifications/settings' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'PATCH /notifications/settings' })).toBeVisible();
  });

  test('FCM 등록 테스트 페이지가 입력 token을 Mutation에 전달한다', async () => {
    const registerToken = jest.fn();
    mockUseRegisterFcmToken.mockReturnValue(
      mutationResult(registerToken) as unknown as ReturnType<typeof useRegisterFcmToken>,
    );

    await render(
      <TemporaryAccountSessionApiCheckPage
        endpoint="POST /firebase/fcm-tokens"
        onBack={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('실기기 FCM token'), 'device-fcm-token');
    await user.press(screen.getByRole('button', { name: '요청 실행' }));

    expect(registerToken).toHaveBeenCalledWith(
      { token: 'device-fcm-token' },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );
  });

  test('알림 설정 PATCH 테스트 페이지가 화면 값을 Mutation에 전달한다', async () => {
    const updateSettings = jest.fn();
    mockUseUpdateNotificationSettings.mockReturnValue(
      mutationResult(updateSettings) as unknown as ReturnType<typeof useUpdateNotificationSettings>,
    );

    await render(
      <TemporaryAccountSessionApiCheckPage
        endpoint="PATCH /notifications/settings"
        onBack={jest.fn()}
      />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('switch', { name: '신규 좋아요 알림' }));
    await user.press(screen.getByRole('button', { name: '요청 실행' }));

    expect(updateSettings).toHaveBeenCalledWith(
      {
        newHotplaceEnabled: true,
        newLikeEnabled: false,
        quietHoursEnabled: false,
        timezone: 'Asia/Seoul',
      },
      expect.objectContaining({ onError: expect.any(Function), onSuccess: expect.any(Function) }),
    );
  });
});
