import { screen } from '@testing-library/react-native';
import React from 'react';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { LocationStatusOverlay } from '../MapStatusOverlays';

describe('LocationStatusOverlay', () => {
  test('위치 복구 액션을 지도와 바텀시트보다 높은 터치 레이어에 표시한다', async () => {
    const onRefresh = jest.fn();
    const view = await renderWithProviders(
      <LocationStatusOverlay
        location={{ canAskAgain: false, coordinate: null, status: 'denied' }}
        onRefresh={onRefresh}
      />,
      { language: 'en' },
    );

    expect(screen.getByTestId('v2-location-denied')).toHaveStyle({
      elevation: 12,
      zIndex: 70,
    });

    await view.user.press(screen.getByRole('button', { name: 'Check again' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
