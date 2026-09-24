import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../v2/app/testing/testProviders';
import { createProductionMainNavigator } from '../navigation/MainNavigator';
import { MAIN_ROUTES, type MainScreenProps } from '../navigation/types';

jest.mock('../../v2/modules/place/map/screens/MapScreen', () => {
  const ReactLibrary = require('react');
  const { Pressable: MockPressable } = require('react-native');
  return {
    __esModule: true,
    default: ({ onOpenDirections }: { onOpenDirections: (destination: unknown) => void }) => ReactLibrary.createElement(
      MockPressable,
      {
        onPress: () => onOpenDirections({ latitude: 35.677, longitude: 128.465, name: '대성반점', placeId: 17 }),
        testID: 'directions-entry',
      },
    ),
  };
});

const { MapRouteScreen } = createProductionMainNavigator({
  useAuthStore: selector => selector({ isHydrating: false, isLoggedIn: true, logout: async () => {} }),
  CheckInScreen: () => null,
  RoutePlaceholderScreen: () => null,
});

test('production map passes the selected place and coordinates to the in-app route', async () => {
  const navigate = jest.fn();
  const view = await renderWithProviders(
    <MapRouteScreen
      navigation={{ navigate, setParams: jest.fn() } as unknown as MainScreenProps<'Map'>['navigation']}
      route={{ key: 'map', name: MAIN_ROUTES.Map, params: undefined }}
    />,
  );

  await view.user.press(screen.getByTestId('directions-entry'));
  expect(navigate).toHaveBeenCalledWith(MAIN_ROUTES.RoutePlanner, {
    destination: { latitude: 35.677, longitude: 128.465, name: '대성반점', placeId: 17 },
  });
});
