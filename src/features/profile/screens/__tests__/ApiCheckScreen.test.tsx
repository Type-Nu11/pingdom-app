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
});
