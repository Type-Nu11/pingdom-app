import React, { type PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { createTestQueryClient } from '../../../../app/testing/testProviders';
import { profileApi } from '../api/profileApi';
import { ProfileImagePermissionError } from '../hooks/useProfile';
import { useProfileImageChange } from '../hooks/useProfileImageChange';
import { getProfileImageUri } from '../model/profileImageUri';
import { profileQueryKeys } from '../model/profileQueryKeys';
import type { Profile } from '../model/profile.types';

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

const PROFILE: Profile = {
  birthYear: 1998,
  country: 'KR',
  email: 'pingdom@example.com',
  id: 7,
  language: 'ko',
  profileImageUrl: 'https://cdn/old.jpg',
  username: 'pingdom_user',
};

const FILE = { name: 'photo.jpg', type: 'image/jpeg', uri: 'file:///photo.jpg' };

function pickerReturns(file = true) {
  jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
    .mockResolvedValue({ granted: true } as never);
  const result = file
    ? { assets: [{ fileName: 'photo.jpg', mimeType: 'image/jpeg', uri: FILE.uri }], canceled: false }
    : { assets: null, canceled: true };
  jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue(result as never);
}

async function setup() {
  const client = createTestQueryClient();
  client.setQueryData(profileQueryKeys.me(), PROFILE);
  jest.spyOn(profileApi, 'getProfile').mockResolvedValue(PROFILE);
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const view = await renderHook(() => useProfileImageChange(), { wrapper });
  return { client, view };
}

// React Query notifies observers on a timer after invalidation; let that land
// inside act so it does not surface as an unwrapped state update.
async function flushQueryNotifications() {
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('useProfileImageChange', () => {
  test('업로드에 성공하면 프로필 캐시가 새 URL로 갱신된다', async () => {
    pickerReturns();
    const upload = jest.spyOn(profileApi, 'changeProfileImage')
      .mockResolvedValue({ profileImageUrl: 'https://cdn/new.jpg' });
    const { client, view } = await setup();

    let result: string | undefined;
    await act(async () => { result = await view.result.current.change('library'); });

    await flushQueryNotifications();
    expect(result).toBe('changed');
    expect(upload).toHaveBeenCalledWith(FILE, expect.any(AbortSignal));
    expect(client.getQueryData<Profile>(profileQueryKeys.me())?.profileImageUrl)
      .toBe('https://cdn/new.jpg');
  });

  test('서버가 같은 URL을 돌려주면 이미지 캐시를 무효화하는 버전이 붙는다', async () => {
    pickerReturns();
    jest.spyOn(profileApi, 'changeProfileImage')
      .mockResolvedValue({ profileImageUrl: PROFILE.profileImageUrl as string });
    const { client, view } = await setup();

    expect(getProfileImageUri(PROFILE)).toBe('https://cdn/old.jpg');
    await act(async () => { await view.result.current.change('library'); });

    await flushQueryNotifications();
    const cached = client.getQueryData<Profile>(profileQueryKeys.me());
    expect(getProfileImageUri(cached)).toBe('https://cdn/old.jpg?v=1');
  });

  test('업로드가 실패하면 이전 이미지를 유지하고 오류를 던진다', async () => {
    pickerReturns();
    jest.spyOn(profileApi, 'changeProfileImage').mockRejectedValue(new Error('network'));
    const { client, view } = await setup();

    await act(async () => {
      await expect(view.result.current.change('library')).rejects.toThrow('network');
    });

    expect(client.getQueryData<Profile>(profileQueryKeys.me())?.profileImageUrl)
      .toBe('https://cdn/old.jpg');
  });

  test('실패한 파일은 다시 고르지 않고 재시도할 수 있다', async () => {
    pickerReturns();
    const upload = jest.spyOn(profileApi, 'changeProfileImage')
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ profileImageUrl: 'https://cdn/new.jpg' });
    const { client, view } = await setup();

    await act(async () => {
      await expect(view.result.current.change('library')).rejects.toThrow();
    });
    await act(async () => { await view.result.current.retry(); });
    await flushQueryNotifications();

    expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(2);
    expect(upload).toHaveBeenLastCalledWith(FILE, expect.any(AbortSignal));
    expect(client.getQueryData<Profile>(profileQueryKeys.me())?.profileImageUrl)
      .toBe('https://cdn/new.jpg');
  });

  test('선택을 취소하면 요청도 캐시 변경도 없다', async () => {
    pickerReturns(false);
    const upload = jest.spyOn(profileApi, 'changeProfileImage');
    const { client, view } = await setup();

    let result: string | undefined;
    await act(async () => { result = await view.result.current.change('library'); });

    expect(result).toBe('cancelled');
    expect(upload).not.toHaveBeenCalled();
    expect(client.getQueryData<Profile>(profileQueryKeys.me())).toEqual(PROFILE);
  });

  test('권한이 거부되면 업로드 요청이 없고 다시 묻기 가능 여부를 알린다', async () => {
    jest.mocked(ImagePicker.requestCameraPermissionsAsync)
      .mockResolvedValue({ canAskAgain: false, granted: false } as never);
    const upload = jest.spyOn(profileApi, 'changeProfileImage');
    const { view } = await setup();

    await act(async () => {
      const error = await view.result.current.change('camera').catch((e) => e);
      expect(error).toBeInstanceOf(ProfileImagePermissionError);
      expect(error).toMatchObject({ canAskAgain: false, source: 'camera' });
    });

    expect(upload).not.toHaveBeenCalled();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });

  test('업로드 중 다시 호출해도 요청은 한 번만 나간다', async () => {
    pickerReturns();
    let finish: (value: { profileImageUrl: string }) => void = () => {};
    const upload = jest.spyOn(profileApi, 'changeProfileImage').mockImplementation(
      () => new Promise((resolve) => { finish = resolve; }),
    );
    const { view } = await setup();
    const { change } = view.result.current;

    let first: Promise<string> = Promise.resolve('');
    await act(async () => { first = change('library'); });
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));

    let second = '';
    await act(async () => { second = await change('library'); });
    expect(second).toBe('ignored');

    await act(async () => {
      finish({ profileImageUrl: 'https://cdn/new.jpg' });
      await first;
    });
    await flushQueryNotifications();

    expect(upload).toHaveBeenCalledTimes(1);
  });

  test('화면을 벗어나면 진행 중인 요청을 취소하고 선택 결과도 무시한다', async () => {
    pickerReturns();
    let signal: AbortSignal | undefined;
    jest.spyOn(profileApi, 'changeProfileImage').mockImplementation(
      (_file, abortSignal) => new Promise((_resolve, reject) => {
        signal = abortSignal;
        abortSignal?.addEventListener('abort', () => reject(new Error('aborted')));
      }),
    );
    const { view } = await setup();

    const { change } = view.result.current;
    let pending: Promise<unknown> = Promise.resolve();
    await act(async () => { pending = change('library').catch(() => 'aborted'); });
    await waitFor(() => expect(signal).toBeDefined());

    await view.unmount();
    await act(async () => { await pending; });

    expect(signal?.aborted).toBe(true);
  });

  test('선택 중에 화면을 벗어나면 업로드하지 않는다', async () => {
    let resolvePick: (value: unknown) => void = () => {};
    jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
      .mockResolvedValue({ granted: true } as never);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockImplementation(
      () => new Promise((resolve) => { resolvePick = resolve; }) as never,
    );
    const upload = jest.spyOn(profileApi, 'changeProfileImage');
    const { view } = await setup();

    const { change } = view.result.current;
    let pending: Promise<string> = Promise.resolve('');
    await act(async () => { pending = change('library'); });
    await waitFor(() => expect(resolvePick).not.toBe(undefined));
    await view.unmount();
    await act(async () => {
      resolvePick({ assets: [{ fileName: 'photo.jpg', mimeType: 'image/jpeg', uri: FILE.uri }], canceled: false });
      await pending;
    });

    expect(upload).not.toHaveBeenCalled();
  });
});
