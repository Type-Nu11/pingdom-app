import React from 'react';
import { Alert } from 'react-native';
import { act, screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { profileApi, type ProfileResponse } from '../../../../../features/profile/api/profileApi';
import ProfileEditScreen from '../ProfileEditScreen';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const PROFILE: ProfileResponse = {
  birthYear: 1998,
  country: 'KR',
  email: 'pingdom@example.com',
  id: 1,
  language: 'ko',
  profileImageUrl: null,
  username: 'pingdom_user',
};

function alertMessages(spy: jest.SpyInstance) {
  return spy.mock.calls.map((call) => call[0] as string);
}

describe('ProfileEditScreen', () => {
  test('프로필이 늦게 도착해도 아이디 입력칸을 채운다', async () => {
    let resolveProfile: (profile: ProfileResponse) => void = () => {};
    jest.spyOn(profileApi, 'getProfile').mockImplementation(
      () => new Promise<ProfileResponse>((resolve) => { resolveProfile = resolve; }),
    );

    await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    // 프로필이 도착하기 전에는 아이디 칸이 비어 있다.
    expect(screen.queryByDisplayValue('pingdom_user')).toBeNull();

    await act(async () => { resolveProfile(PROFILE); });

    // 첫 렌더에서만 초기화하면 이 시점에도 계속 비어 있게 된다.
    await waitFor(() => expect(screen.getByDisplayValue('pingdom_user')).toBeTruthy());
  });

  test('사용자가 고친 아이디를 이후 프로필 응답이 덮어쓰지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);

    const { queryClient, user } = await renderWithProviders(
      <ProfileEditScreen onBack={jest.fn()} />,
    );

    const input = await screen.findByDisplayValue('pingdom_user');
    await user.clear(input);
    await user.type(input, 'new_name');

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['v2', 'users', 'me'] });
    });

    expect(screen.getByDisplayValue('new_name')).toBeTruthy();
  });

  test('새 비밀번호가 8자 미만이면 요청을 보내지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changePassword = jest.spyOn(profileApi, 'changePassword');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await screen.findByDisplayValue('pingdom_user');
    await user.type(screen.getByPlaceholderText('현재 비밀번호를 입력하세요'), 'current123');
    await user.type(screen.getByPlaceholderText('8자 이상 입력하세요'), 'short');
    await user.press(screen.getByText('변경 사항 저장하기'));

    expect(changePassword).not.toHaveBeenCalled();
    expect(alertMessages(alertSpy)).toContain('비밀번호는 8자 이상이어야 합니다');
  });

  test('새 비밀번호와 확인이 다르면 요청을 보내지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changePassword = jest.spyOn(profileApi, 'changePassword');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await screen.findByDisplayValue('pingdom_user');
    await user.type(screen.getByPlaceholderText('현재 비밀번호를 입력하세요'), 'current123');
    await user.type(screen.getByPlaceholderText('8자 이상 입력하세요'), 'newpassword1');
    await user.type(screen.getByPlaceholderText('새 비밀번호를 다시 입력하세요'), 'newpassword2');
    await user.press(screen.getByText('변경 사항 저장하기'));

    expect(changePassword).not.toHaveBeenCalled();
    expect(alertMessages(alertSpy)).toContain('새 비밀번호가 서로 다릅니다');
  });

  test('현재 비밀번호 없이 새 비밀번호만 입력하면 막는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changePassword = jest.spyOn(profileApi, 'changePassword');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await screen.findByDisplayValue('pingdom_user');
    await user.type(screen.getByPlaceholderText('8자 이상 입력하세요'), 'newpassword1');
    await user.press(screen.getByText('변경 사항 저장하기'));

    expect(changePassword).not.toHaveBeenCalled();
    expect(alertMessages(alertSpy)).toContain('비밀번호를 변경하려면 현재 비밀번호를 입력하세요');
  });

  test('아이디와 비밀번호를 함께 바꾸면 두 요청을 모두 보낸다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changeUsername = jest.spyOn(profileApi, 'changeUsername').mockResolvedValue('ok');
    const changePassword = jest.spyOn(profileApi, 'changePassword').mockResolvedValue('ok');
    const onBack = jest.fn();

    const { user } = await renderWithProviders(<ProfileEditScreen onBack={onBack} />);

    const input = await screen.findByDisplayValue('pingdom_user');
    await user.clear(input);
    await user.type(input, 'renamed_user');
    await user.type(screen.getByPlaceholderText('현재 비밀번호를 입력하세요'), 'current123');
    await user.type(screen.getByPlaceholderText('8자 이상 입력하세요'), 'newpassword1');
    await user.type(screen.getByPlaceholderText('새 비밀번호를 다시 입력하세요'), 'newpassword1');
    await user.press(screen.getByText('변경 사항 저장하기'));

    await waitFor(() => expect(changeUsername).toHaveBeenCalledWith('renamed_user'));
    expect(changePassword).toHaveBeenCalledWith({
      confirmPassword: 'newpassword1',
      currentPassword: 'current123',
      newPassword: 'newpassword1',
    });
    await waitFor(() => expect(onBack).toHaveBeenCalled());
  });

  test('바뀐 값이 없으면 요청 없이 돌아간다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changeUsername = jest.spyOn(profileApi, 'changeUsername');
    const onBack = jest.fn();

    const { user } = await renderWithProviders(<ProfileEditScreen onBack={onBack} />);

    await screen.findByDisplayValue('pingdom_user');
    await user.press(screen.getByText('변경 사항 저장하기'));

    expect(changeUsername).not.toHaveBeenCalled();
    expect(onBack).toHaveBeenCalled();
  });
});
