import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import MapCanvas from '../../native/components/MapCanvas';
import NaverMapAdapter from '../../native/components/NaverMapAdapter';
import { useDeviceHeading } from '../../location/hooks/useDeviceHeading';
jest.mock('../../location/hooks/useDeviceHeading', () => ({ useDeviceHeading: jest.fn(() => 90) }));
jest.mock('../../../../../shared/native/NaverMapNativeView', () => ({
  __esModule: true, default: require('react-native').View,
}));
test('transit legs reach the native map separately without synthesizing a connector', async () => {
  const segments = [{ path: [{ lat: 37, lng: 127 }, { lat: 37, lng: 127.001 }], color: '#767680' },
    { path: [{ lat: 37.01, lng: 127.01 }, { lat: 37.02, lng: 127.02 }], color: '#00A84D' }];
  await renderWithProviders(<NaverMapAdapter center={segments[0].path[0]} markers={[]} routeSegments={segments} />);
  expect(screen.getByTestId('v2-naver-map').props.routeSegments).toEqual(segments);
  expect(screen.getByTestId('v2-naver-map').props.routeCoordinates).toBeUndefined();
});
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

test('renders curved corners without altering provider endpoints or regenerating geometry on GPS updates', async () => {
  const path = [{ lat: 37, lng: 127 }, { lat: 37, lng: 127.001 }, { lat: 37.001, lng: 127.001 }];
  const { rerender } = await renderWithProviders(<NaverMapAdapter center={path[0]} markers={[]} routeCoordinates={path} />);
  const geometry = screen.getByTestId('v2-naver-map').props.routeCoordinates;
  expect(geometry.length).toBeGreaterThan(path.length);
  expect(geometry[0]).toBe(path[0]);
  expect(geometry.at(-1)).toBe(path.at(-1));
  await rerender(<NaverMapAdapter center={path[0]} markers={[]} routeCoordinates={path} userCoordinate={{ lat: 37, lng: 127.0001 }} />);
  expect(screen.getByTestId('v2-naver-map').props.routeCoordinates).toBe(geometry);
  expect(path).toHaveLength(3);
});


test('main map forwards manual gestures so GPS tracking can be released', async () => {
  const onCameraGesture = jest.fn();
  await renderWithProviders(<MapCanvas centerLat={37} centerLng={127} followUser={true}
    markers={[]} onMarkerPress={jest.fn()} zoomLevel={17} onCameraGesture={onCameraGesture} />);
  await fireEvent(screen.getByTestId('v2-naver-map'), 'cameraGesture', { nativeEvent: {} });
  expect(onCameraGesture).toHaveBeenCalledTimes(1);
});

test('방향은 위치 이동과 별도로 네이티브 마커에 전달되고 숨겨진 지도는 센서를 중지한다', async () => {
  const { rerender } = await renderWithProviders(<MapCanvas centerLat={37} centerLng={127} userLat={37} userLng={127}
    followUser markers={[]} onMarkerPress={jest.fn()} zoomLevel={17} headingEnabled />);
  expect(screen.getByTestId('v2-naver-map').props.userHeading).toBe(90);
  expect(useDeviceHeading).toHaveBeenLastCalledWith(true);
  await rerender(<MapCanvas centerLat={37} centerLng={127} userLat={37} userLng={127}
    followUser markers={[]} onMarkerPress={jest.fn()} zoomLevel={17} headingEnabled={false} />);
  expect(useDeviceHeading).toHaveBeenLastCalledWith(false);
});
