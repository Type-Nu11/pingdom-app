import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { ApiError } from '../../../../shared/api';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { profileApi } from '../../api/profileApi';
import type { Profile } from '../../model/profile.types';
import ProfileEditScreen from '../ProfileEditScreen';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const PROFILE: Profile = {
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

async function enterPasswordChange(user: ReturnType<typeof import('@testing-library/react-native').userEvent.setup>) {
  await user.type(screen.getByLabelText('현재 비밀번호'), 'current123');
  await user.type(screen.getByLabelText('새 비밀번호'), 'newpassword1');
  await user.type(screen.getByLabelText('새 비밀번호 확인'), 'newpassword1');
}

async function renameUsername(
  user: ReturnType<typeof import('@testing-library/react-native').userEvent.setup>,
  value = 'renamed_user',
) {
  const input = await screen.findByLabelText('아이디');
  await user.clear(input);
  await user.type(input, value);
}

describe('ProfileEditScreen', () => {
  test('프로필이 늦게 도착해도 아이디 입력칸을 채운다', async () => {
    let resolveProfile: (profile: Profile) => void = () => {};
    jest.spyOn(profileApi, 'getProfile').mockImplementation(
      () => new Promise<Profile>((resolve) => { resolveProfile = resolve; }),
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

  test('첫 프로필 응답 전 입력을 시작해도 응답이 사용자 값을 덮어쓰지 않는다', async () => {
    let resolveProfile: (profile: Profile) => void = () => {};
    jest.spyOn(profileApi, 'getProfile').mockImplementation(
      () => new Promise<Profile>((resolve) => { resolveProfile = resolve; }),
    );

    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await user.type(screen.getByLabelText('아이디'), 'typed_first');
    await act(async () => { resolveProfile(PROFILE); });

    await waitFor(() => expect(screen.getByDisplayValue('typed_first')).toBeTruthy());
    expect(screen.queryByDisplayValue('pingdom_user')).toBeNull();
  });

  test('프로필 조회 실패 상태에서는 저장을 비활성화하고 요청하지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockRejectedValue(new Error('profile failed'));
    const changeUsername = jest.spyOn(profileApi, 'changeUsername');

    await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    const saveButtons = await screen.findAllByRole('button', { name: '변경 사항 저장하기' });
    expect(saveButtons).toHaveLength(2);
    for (const button of saveButtons) {
      expect(button.props.accessibilityState.disabled).toBe(true);
      fireEvent.press(button);
    }
    expect(changeUsername).not.toHaveBeenCalled();
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

  test('아이디만 바꾸면 아이디 요청만 보낸다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changeUsername = jest.spyOn(profileApi, 'changeUsername').mockResolvedValue('ok');
    const changePassword = jest.spyOn(profileApi, 'changePassword');
    const onBack = jest.fn();
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={onBack} />);

    await renameUsername(user);
    await user.press(screen.getByText('변경 사항 저장하기'));

    await waitFor(() => expect(changeUsername).toHaveBeenCalledWith('renamed_user'));
    expect(changePassword).not.toHaveBeenCalled();
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
  });

  test('비밀번호만 바꾸면 비밀번호 요청만 보낸다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changeUsername = jest.spyOn(profileApi, 'changeUsername');
    const changePassword = jest.spyOn(profileApi, 'changePassword').mockResolvedValue('ok');
    const onBack = jest.fn();
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={onBack} />);

    await screen.findByDisplayValue('pingdom_user');
    await enterPasswordChange(user);
    await user.press(screen.getByText('변경 사항 저장하기'));

    expect(changeUsername).not.toHaveBeenCalled();
    await waitFor(() => expect(changePassword).toHaveBeenCalled());
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
  });

  test('비밀번호 API 오류 코드는 인증 토큰 오류와 현재 비밀번호 오류를 혼동하지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changePassword = jest.spyOn(profileApi, 'changePassword');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await screen.findByDisplayValue('pingdom_user');
    await enterPasswordChange(user);
    changePassword.mockRejectedValueOnce(new ApiError('현재 비밀번호 불일치', {
      code: 'INVALID_CREDENTIALS',
      status: 401,
    }));
    await user.press(screen.getByText('변경 사항 저장하기'));
    await waitFor(() => expect(alertMessages(alertSpy)).toContain(
      '현재 비밀번호가 올바르지 않습니다',
    ));

    changePassword.mockRejectedValueOnce(new ApiError('유효하지 않은 토큰입니다.', {
      code: 'INVALID_TOKEN',
      status: 401,
    }));
    await user.press(screen.getByText('변경 사항 저장하기'));
    await waitFor(() => expect(alertMessages(alertSpy)).toContain('유효하지 않은 토큰입니다.'));
  });

  test('동시 변경에서 아이디 요청 실패 시 비밀번호 요청을 실행하지 않고 아이디 오류를 표시한다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changeUsername = jest.spyOn(profileApi, 'changeUsername').mockRejectedValue(
      new ApiError('입력값을 확인해주세요.', {
        fieldErrors: [{ field: 'newUsername', reason: '이미 사용 중인 아이디입니다.' }],
        status: 400,
      }),
    );
    const changePassword = jest.spyOn(profileApi, 'changePassword');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await renameUsername(user);
    await enterPasswordChange(user);
    await user.press(screen.getByText('변경 사항 저장하기'));

    await waitFor(() => expect(changeUsername).toHaveBeenCalled());
    expect(changePassword).not.toHaveBeenCalled();
    await waitFor(() => expect(alertMessages(alertSpy)).toContain('이미 사용 중인 아이디입니다.'));
  });

  test('아이디 성공 후 비밀번호 실패 시 부분 성공을 알리고 프로필 캐시를 다시 조회한다', async () => {
    let currentProfile = PROFILE;
    const getProfile = jest.spyOn(profileApi, 'getProfile').mockImplementation(async () => currentProfile);
    jest.spyOn(profileApi, 'changeUsername').mockImplementation(async () => {
      currentProfile = { ...PROFILE, username: 'renamed_user' };
      return 'ok';
    });
    jest.spyOn(profileApi, 'changePassword').mockRejectedValue(
      new ApiError('입력값을 확인해주세요.', {
        fieldErrors: [{ field: 'currentPassword', reason: '현재 비밀번호가 일치하지 않습니다.' }],
        status: 400,
      }),
    );
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const onBack = jest.fn();
    const { queryClient, user } = await renderWithProviders(
      <ProfileEditScreen onBack={onBack} />,
    );

    await renameUsername(user);
    await enterPasswordChange(user);
    await user.press(screen.getByText('변경 사항 저장하기'));

    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(2));
    expect(queryClient.getQueryData(['v2', 'users', 'me'])).toEqual(currentProfile);
    expect(alertMessages(alertSpy)).toContain(
      '아이디는 변경했지만 비밀번호는 변경하지 못했습니다. 현재 비밀번호가 일치하지 않습니다.',
    );
    expect(onBack).not.toHaveBeenCalled();
  });

  test('저장 버튼을 즉시 연속 탭해도 mutation과 복귀를 한 번만 실행한다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changeUsername = jest.spyOn(profileApi, 'changeUsername').mockResolvedValue('ok');
    const onBack = jest.fn();
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={onBack} />);

    await renameUsername(user);
    const headerSave = screen.getByTestId('v2-profile-edit-save-header');
    const bottomSave = screen.getByTestId('v2-profile-edit-save-bottom');
    await act(async () => {
      headerSave.props.onClick();
      bottomSave.props.onClick();
    });

    await waitFor(() => expect(changeUsername).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onBack).toHaveBeenCalledTimes(1));
  });

  test('뒤로가기 버튼을 즉시 연속 탭해도 복귀를 한 번만 실행한다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const onBack = jest.fn();
    await renderWithProviders(<ProfileEditScreen onBack={onBack} />);

    const backButton = await screen.findByTestId('v2-profile-edit-back');
    await act(async () => {
      backButton.props.onClick();
      backButton.props.onClick();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('아이디는 서버 계약의 4~50자 범위를 벗어나면 요청하지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const changeUsername = jest.spyOn(profileApi, 'changeUsername');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await renameUsername(user, 'abc');
    await user.press(screen.getByText('변경 사항 저장하기'));

    expect(changeUsername).not.toHaveBeenCalled();
    expect(alertMessages(alertSpy)).toContain('아이디는 4자 이상 50자 이하여야 합니다.');
  });

  test('이미지 권한 거부와 선택 취소를 각각 안전하게 처리한다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const permission = jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync);
    const launchPicker = jest.mocked(ImagePicker.launchImageLibraryAsync);
    const changeImage = jest.spyOn(profileApi, 'changeProfileImage');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    permission.mockResolvedValueOnce({ granted: false } as never);
    await user.press(screen.getByRole('button', { name: '프로필 이미지 변경' }));
    expect(alertMessages(alertSpy)).toContain(
      '프로필 이미지를 변경하려면 사진 접근 권한이 필요합니다.',
    );

    permission.mockResolvedValueOnce({ granted: true } as never);
    launchPicker.mockResolvedValueOnce({ assets: null, canceled: true } as never);
    await user.press(screen.getByRole('button', { name: '프로필 이미지 변경' }));
    expect(changeImage).not.toHaveBeenCalled();
  });

  test('서버가 받지 않는 이미지 MIME type은 업로드하지 않는다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ granted: true } as never);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      assets: [{ fileName: 'photo.heic', mimeType: 'image/heic', uri: 'file:///photo.heic' }],
      canceled: false,
    } as never);
    const changeImage = jest.spyOn(profileApi, 'changeProfileImage');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await user.press(await screen.findByRole('button', { name: '프로필 이미지 변경' }));

    expect(changeImage).not.toHaveBeenCalled();
    expect(alertMessages(alertSpy)).toContain(
      '프로필 이미지를 변경하지 못했습니다. 다시 시도해주세요.',
    );
  });

  test('이미지 업로드 실패는 기존 이미지를 유지하고 성공은 재조회된 URI를 표시한다', async () => {
    let currentProfile = { ...PROFILE, profileImageUrl: 'https://cdn/old.jpg' };
    jest.spyOn(profileApi, 'getProfile').mockImplementation(async () => currentProfile);
    const permission = jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ granted: true } as never);
    const launchPicker = jest.mocked(ImagePicker.launchImageLibraryAsync)
      .mockResolvedValue({
        assets: [{ fileName: 'photo.jpg', mimeType: 'image/jpeg', uri: 'file:///photo.jpg' }],
        canceled: false,
      } as never);
    const changeImage = jest.spyOn(profileApi, 'changeProfileImage');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await screen.findByTestId('v2-profile-edit-avatar-image');
    changeImage.mockRejectedValueOnce(new Error('upload failed'));
    await user.press(screen.getByRole('button', { name: '프로필 이미지 변경' }));
    await waitFor(() => expect(alertMessages(alertSpy)).toContain(
      '프로필 이미지를 변경하지 못했습니다. 다시 시도해주세요.',
    ));
    expect(screen.getByTestId('v2-profile-edit-avatar-image').props.source.uri)
      .toBe('https://cdn/old.jpg');

    changeImage.mockImplementationOnce(async (file) => {
      expect(file).toEqual({ name: 'photo.jpg', type: 'image/jpeg', uri: 'file:///photo.jpg' });
      currentProfile = { ...currentProfile, profileImageUrl: 'https://cdn/new.jpg' };
      return { profileImageUrl: currentProfile.profileImageUrl };
    });
    await user.press(screen.getByRole('button', { name: '프로필 이미지 변경' }));

    await waitFor(() => expect(screen.getByTestId('v2-profile-edit-avatar-image').props.source.uri)
      .toBe('https://cdn/new.jpg'));
    expect(permission).toHaveBeenCalledTimes(2);
    expect(launchPicker).toHaveBeenCalledTimes(2);
  });

  test('비밀번호 보기 버튼과 저장 버튼이 접근성 상태를 노출한다', async () => {
    jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
    const { user } = await renderWithProviders(<ProfileEditScreen onBack={jest.fn()} />);

    await screen.findByDisplayValue('pingdom_user');
    const showCurrent = screen.getByRole('button', { name: '현재 비밀번호 보기' });
    expect(showCurrent.props.accessibilityState).toEqual({ selected: false });
    await user.press(showCurrent);
    expect(screen.getByRole('button', { name: '현재 비밀번호 숨기기' }).props.accessibilityState)
      .toEqual({ selected: true });

    for (const saveButton of screen.getAllByRole('button', { name: '변경 사항 저장하기' })) {
      expect(saveButton.props.accessibilityState).toEqual({ busy: false, disabled: false });
    }
    expect(screen.getByTestId('v2-profile-edit-scroll').props)
      .toMatchObject({ automaticallyAdjustKeyboardInsets: true, keyboardShouldPersistTaps: 'handled' });
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
