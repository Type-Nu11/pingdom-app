import { screen } from '@testing-library/react-native';
import React from 'react';

import { createTestI18n, renderWithProviders } from '../../../v2/shared/testing/testProviders';
import { useProfile } from '../../../features/profile/hooks/useProfile';
import {
  MapRouteScreen,
  MyPageRouteScreen,
  ProfileEditRouteScreen,
  SettingsRouteScreen,
} from '../MainNavigator';
import { MAIN_ROUTES, type MainScreenProps } from '../types';

jest.mock('../../../v2/features/map/screens/MapScreen', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ({
      onOpenVisitVerification,
      onStartVisitVerification,
    }: {
      onOpenVisitVerification: () => void;
      onStartVisitVerification: (placeId: number) => void;
    }) => ReactLibrary.createElement(
      ReactNative.View,
      { testID: 'current-map-screen' },
      ReactLibrary.createElement(
        ReactNative.Pressable,
        { onPress: onOpenVisitVerification, testID: 'current-map-verification-entry' },
      ),
      ReactLibrary.createElement(
        ReactNative.Pressable,
        { onPress: () => onStartVisitVerification(17), testID: 'selected-place-verification-entry' },
      ),
    ),
  };
});

jest.mock('../../../features/profile/hooks/useProfile', () => ({
  useProfile: jest.fn(),
}));

jest.mock('../../../v2/features/my-page/screens/MyPageScreen', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ({
      onOpenProfileEdit,
      onOpenSettings,
    }: {
      onOpenProfileEdit: () => void;
      onOpenSettings: () => void;
    }) => ReactLibrary.createElement(
      ReactNative.View,
      null,
      ReactLibrary.createElement(
        ReactNative.Pressable,
        { onPress: onOpenProfileEdit, testID: 'current-my-page-profile-edit-entry' },
      ),
      ReactLibrary.createElement(
        ReactNative.Pressable,
        { onPress: onOpenSettings, testID: 'current-my-page-settings-entry' },
      ),
    ),
  };
});

jest.mock('../../../v2/features/settings/screens/SettingsScreen', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ({ onOpenProfileEdit }: { onOpenProfileEdit: () => void }) => ReactLibrary.createElement(
      ReactNative.Pressable,
      { onPress: onOpenProfileEdit, testID: 'current-settings-profile-edit-entry' },
    ),
  };
});

jest.mock('../../../v2/features/my-page/screens/ProfileEditScreen', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ({ onBack }: { onBack: () => void }) => ReactLibrary.createElement(
      ReactNative.Pressable,
      { onPress: onBack, testID: 'current-profile-edit-back' },
    ),
  };
});

const navigation = {
  addListener: jest.fn(() => jest.fn()),
  goBack: jest.fn(),
  navigate: jest.fn(),
  setParams: jest.fn(),
} as unknown as MainScreenProps<'Map'>['navigation'];

const route = {
  key: 'Map-test',
  name: MAIN_ROUTES.Map,
  params: undefined,
} as MainScreenProps<'Map'>['route'];

describe('현재 지도 경계', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useProfile).mockReturnValue({
      profile: {
        birthYear: 1998,
        country: 'KR',
        email: 'pingdom@example.com',
        id: 1,
        language: 'ko',
        profileImageUrl: null,
        role: 'USER',
        username: 'pingdom_user',
      },
    } as ReturnType<typeof useProfile>);
  });

  test('MainNavigator의 지도 화면을 렌더링한다', async () => {
    const i18n = await createTestI18n();
    await renderWithProviders(
      <MapRouteScreen navigation={navigation} route={route} />,
      { i18n },
    );

    expect(screen.getByTestId('current-map-screen')).toBeVisible();
  });

  test('방문 검증 CTA callback을 명확한 후보 route로 연결한다', async () => {
    const i18n = await createTestI18n();
    const view = await renderWithProviders(
      <MapRouteScreen navigation={navigation} route={route} />,
      { i18n },
    );

    await view.user.press(screen.getByTestId('current-map-verification-entry'));
    expect(navigation.navigate).toHaveBeenCalledWith(MAIN_ROUTES.VisitVerificationPlaces);
  });

  test('선택한 장소의 실제 ID로 체류 인증 세션에 진입한다', async () => {
    const i18n = await createTestI18n();
    const view = await renderWithProviders(
      <MapRouteScreen navigation={navigation} route={route} />,
      { i18n },
    );

    await view.user.press(screen.getByTestId('selected-place-verification-entry'));
    expect(navigation.navigate).toHaveBeenCalledWith(
      MAIN_ROUTES.VisitVerificationSession,
      { placeId: 17 },
    );
  });

  test('production 마이페이지에서 프로필 편집으로 진입하고 뒤로 복귀한다', async () => {
    const myPageRoute = {
      key: 'MyPage-test',
      name: MAIN_ROUTES.MyPage,
      params: undefined,
    } as MainScreenProps<'MyPage'>['route'];
    const profileEditRoute = {
      key: 'ProfileEdit-test',
      name: MAIN_ROUTES.ProfileEdit,
      params: undefined,
    } as MainScreenProps<'ProfileEdit'>['route'];
    const view = await renderWithProviders(
      <MyPageRouteScreen navigation={navigation as never} route={myPageRoute} />,
    );

    await view.user.press(screen.getByTestId('current-my-page-profile-edit-entry'));
    await view.user.press(screen.getByTestId('current-my-page-profile-edit-entry'));
    expect(navigation.navigate).toHaveBeenCalledWith(MAIN_ROUTES.ProfileEdit);
    expect(navigation.navigate).toHaveBeenCalledTimes(1);

    await view.rerender(
      <ProfileEditRouteScreen navigation={navigation as never} route={profileEditRoute} />,
    );
    await view.user.press(screen.getByTestId('current-profile-edit-back'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  test('production 마이페이지에서 V2 설정으로 진입하고 프로필 편집 route를 유지한다', async () => {
    const myPageRoute = {
      key: 'MyPage-test',
      name: MAIN_ROUTES.MyPage,
      params: undefined,
    } as MainScreenProps<'MyPage'>['route'];
    const settingsRoute = {
      key: 'Settings-test',
      name: MAIN_ROUTES.Settings,
      params: undefined,
    } as MainScreenProps<'Settings'>['route'];
    const view = await renderWithProviders(
      <MyPageRouteScreen navigation={navigation as never} route={myPageRoute} />,
    );

    await view.user.press(screen.getByTestId('current-my-page-settings-entry'));
    expect(navigation.navigate).toHaveBeenCalledWith(MAIN_ROUTES.Settings);

    await view.rerender(
      <SettingsRouteScreen navigation={navigation as never} route={settingsRoute} />,
    );
    await view.user.press(screen.getByTestId('current-settings-profile-edit-entry'));
    expect(navigation.navigate).toHaveBeenLastCalledWith(MAIN_ROUTES.ProfileEdit);
  });
});
