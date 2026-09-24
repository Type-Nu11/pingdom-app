import React from 'react';
import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../../../app/testing/testProviders';
import RoutePlannerSheet from '../RoutePlannerSheet';
import type { RouteUiState } from '../../model/routeUi';

const destination = { latitude: 35.677, longitude: 128.465, name: '대성반점', placeId: 17 };

async function renderSheet(state: RouteUiState) {
  const onModeChange = jest.fn();
  const result = await renderWithProviders(
    <RoutePlannerSheet
      destination={destination}
      mode="transit"
      onClose={jest.fn()}
      onEditPlaces={jest.fn()}
      onModeChange={onModeChange}
      onOpenSettings={jest.fn()}
      onPreviewAction={jest.fn()}
      onShare={jest.fn()}
      state={state}
    />,
  );
  return { ...result, onModeChange };
}

describe('RoutePlannerSheet', () => {
  test('mode tabs are accessible and can change mode', async () => {
    const { user, onModeChange } = await renderSheet({ kind: 'unavailable' });
    expect(screen.getByTestId('route-mode-transit').props.accessibilityState).toEqual({ selected: true });
    await user.press(screen.getByTestId('route-mode-walk'));
    expect(onModeChange).toHaveBeenCalledWith('walk');
    expect(screen.getByTestId('route-unavailable')).toBeVisible();
  });

  test.each(['loading', 'location-denied', 'missing-destination', 'no-transit'] as const)('shows %s state without a route estimate', async (kind) => {
    await renderSheet({ kind });
    expect(screen.getByTestId(`route-${kind}`)).toBeVisible();
    expect(screen.queryByTestId('route-preview-ready')).toBeNull();
  });

  test('only a supplied preview shows duration and arrival', async () => {
    await renderSheet({ kind: 'ready', preview: { arrival: '14:40', distance: '12.3km', duration: '38분', meta: '1회 환승' } });
    expect(screen.getByTestId('route-preview-ready')).toBeVisible();
    expect(screen.getByText('38분')).toBeVisible();
  });
});
