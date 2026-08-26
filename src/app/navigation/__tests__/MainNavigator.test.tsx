import { screen } from '@testing-library/react-native';
import React from 'react';

import { createTestI18n, renderWithProviders } from '../../../v2/shared/testing/testProviders';
import { MapRouteScreen } from '../MainNavigator';
import { MAIN_ROUTES, type MainScreenProps } from '../types';

jest.mock('../../../features/place/screens/MapScreen', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ({ onOpenVisitVerification }: { onOpenVisitVerification: () => void }) => ReactLibrary.createElement(
      ReactNative.View,
      { testID: 'current-map-screen' },
      ReactLibrary.createElement(
        ReactNative.Pressable,
        { onPress: onOpenVisitVerification, testID: 'current-map-verification-entry' },
      ),
    ),
  };
});

const navigation = {
  navigate: jest.fn(),
  setParams: jest.fn(),
} as unknown as MainScreenProps<'Map'>['navigation'];

const route = {
  key: 'Map-test',
  name: MAIN_ROUTES.Map,
  params: undefined,
} as MainScreenProps<'Map'>['route'];

describe('현재 지도 경계', () => {
  beforeEach(() => jest.clearAllMocks());

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
});
