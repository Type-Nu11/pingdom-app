import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import MapCanvas from '../../native/components/MapCanvas';
import NaverMapAdapter from '../../native/components/NaverMapAdapter';
jest.mock('../../../../../shared/native/NaverMapNativeView', () => ({
  __esModule: true, default: require('react-native').View,
}));
test.each(['light', 'dark'] as const)('preserves %s SDK theme and forwards full geometry and camera commands', async colorScheme => {
  const path = [{ lat: 37.5, lng: 127 }, { lat: 37.8, lng: 127.3 }, { lat: 37.6, lng: 127.1 }];
  await renderWithProviders(<NaverMapAdapter center={path[0]} markers={[]} routeCoordinates={path}
    cameraRevision={3} logoTopMargin={16} />, { colorScheme, appearancePreference: colorScheme === 'dark' ? 'DARK' : 'LIGHT' });
  const native = screen.getByTestId('v2-naver-map');
  expect(native.props.routeCoordinates).toEqual(path);
  expect(native.props.nightMode).toBe(colorScheme === 'dark');
  expect(native.props.cameraRevision).toBe(3);
  expect(native.props.logoTopMargin).toBe(16);
  expect(native.props.followUser).toBe(false);
});


test('native projected route anchor is forwarded as screen points', async () => {
  const onRouteAnchor = jest.fn();
  await renderWithProviders(<NaverMapAdapter center={{ lat: 37, lng: 127 }} markers={[]} onRouteAnchor={onRouteAnchor} />);
  await fireEvent(screen.getByTestId('v2-naver-map'), 'routeAnchor', { nativeEvent: { x: 100, y: 250 } });
  expect(onRouteAnchor).toHaveBeenCalledWith({ x: 100, y: 250 });
});


test('main map forwards manual gestures so GPS tracking can be released', async () => {
  const onCameraGesture = jest.fn();
  await renderWithProviders(<MapCanvas centerLat={37} centerLng={127} followUser={true}
    markers={[]} onMarkerPress={jest.fn()} zoomLevel={17} onCameraGesture={onCameraGesture} />);
  await fireEvent(screen.getByTestId('v2-naver-map'), 'cameraGesture', { nativeEvent: {} });
  expect(onCameraGesture).toHaveBeenCalledTimes(1);
});
