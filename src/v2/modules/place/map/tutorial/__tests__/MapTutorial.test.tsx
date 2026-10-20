import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Animated, View, type MeasureInWindowOnSuccessCallback } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { MapTutorialProvider } from '../MapTutorialProvider';
import { MapTutorialOverlay } from '../MapTutorialOverlay';
import { LocationStatusOverlay } from '../../presentation/components/MapStatusOverlays';
import { useMapTutorial } from '../context';
import { MAP_TUTORIAL_SEEN_KEY, MAP_TUTORIAL_STEPS, getTutorialCardPlacement } from '../model';

beforeEach(() => {
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: callback => callback?.({ finished: true }), stop: jest.fn(), reset: jest.fn(),
  }));
});

test('contains the welcome card inside the iPhone SE safe area without measured-height translation', async () => {
  await renderWithProviders(<MapTutorialOverlay index={0} width={375} height={667}
    target={null} username="김우성민" busy={false} onTransitionEnd={jest.fn()}
    onClose={jest.fn()} onNext={jest.fn()} onPrevious={jest.fn()} />);
  const positioner = screen.getByTestId('map-tutorial-card-position');
  expect(positioner).toHaveStyle({ top: 12, bottom: 12, justifyContent: 'center' });
  const card = screen.getByTestId('map-tutorial-card');
  expect(card).toHaveStyle({ maxHeight: 643 });
  expect(card).not.toHaveStyle({ opacity: 0 });
});

test('places verification guidance below a high button on SE and allows skipping without pressing that button', async () => {
  const target = { x: 240, y: 225, width: 120, height: 48 };
  const placement = getTutorialCardPlacement({ step: 'verification', target, height: 667, topInset: 20, bottomInset: 0 });
  expect(placement.top).toBe(297);
  expect(placement.maxHeight).toBe(358);
  const onNext = jest.fn();
  await renderWithProviders(<MapTutorialOverlay index={6} width={375} height={667}
    target={target} busy={false} onTransitionEnd={jest.fn()} onClose={jest.fn()}
    onNext={onNext} onPrevious={jest.fn()} />);
  expect(screen.getByTestId('map-tutorial-pointer')).toHaveStyle({ top: -10 });
  expect(screen.getByText('위의 검증하기 버튼에서 시작할 수 있어요.')).toBeVisible();
  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  expect(onNext).toHaveBeenCalledTimes(1);
});

test('a lower verification button keeps the card above it and points down', async () => {
  const target = { x: 240, y: 520, width: 120, height: 48 };
  await renderWithProviders(<MapTutorialOverlay index={6} width={375} height={667}
    target={target} busy={false} onTransitionEnd={jest.fn()} onClose={jest.fn()}
    onNext={jest.fn()} onPrevious={jest.fn()} />);
  expect(screen.getByTestId('map-tutorial-pointer')).toHaveStyle({ bottom: -10 });
  expect(screen.getByText('아래의 검증하기 버튼에서 시작할 수 있어요.')).toBeVisible();
  expect(screen.getByTestId('map-tutorial-highlight').props.accessibilityLabel).toBe('검증하기');
});

test('blocks next, previous, and close until the transition finishes', async () => {
  let complete: ((result: { finished: boolean }) => void) | undefined;
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({
    start: callback => { if (callback) complete = callback; }, stop: jest.fn(), reset: jest.fn(),
  }));
  await renderWithProviders(<MapTutorialProvider enabled />);
  await screen.findByTestId('map-tutorial-step-welcome');
  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  expect(screen.getByTestId('map-tutorial-step-map')).toBeVisible();
  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  await fireEvent.press(screen.getByTestId('map-tutorial-previous'));
  await fireEvent.press(screen.getByTestId('map-tutorial-close'));
  expect(screen.getByTestId('map-tutorial-step-map')).toBeVisible();
  expect(await AsyncStorage.getItem(MAP_TUTORIAL_SEEN_KEY)).toBeNull();
  await act(() => complete?.({ finished: true }));
  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  expect(screen.getByTestId('map-tutorial-step-favorites')).toBeVisible();
  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  await fireEvent.press(screen.getByTestId('map-tutorial-close'));
  expect(screen.getByTestId('map-tutorial-step-favorites')).toBeVisible();
  await act(() => complete?.({ finished: true }));
  await fireEvent.press(screen.getByTestId('map-tutorial-close'));
  expect(screen.queryByTestId('map-tutorial')).toBeNull();
});

test('keeps the current guide until the next control is measured, then changes step and spotlight together', async () => {
  jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => callback(0, 0, 402, 874));
  let resolveMap: MeasureInWindowOnSuccessCallback | undefined;
  let resolveFavorites: MeasureInWindowOnSuccessCallback | undefined;
  function Targets() {
    const { register } = useMapTutorial();
    useEffect(() => {
      register('map', { measureInWindow: (callback: MeasureInWindowOnSuccessCallback) => { resolveMap = callback; } } as View);
      register('favorites', { measureInWindow: (callback: MeasureInWindowOnSuccessCallback) => { resolveFavorites = callback; } } as View);
      return () => { register('map', null); register('favorites', null); };
    }, [register]);
    return null;
  }
  await renderWithProviders(<MapTutorialProvider enabled><Targets /></MapTutorialProvider>);
  await screen.findByTestId('map-tutorial-step-welcome');
  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  expect(screen.getByTestId('map-tutorial-step-welcome')).toBeVisible();
  await act(() => resolveMap?.(28, 798, 75, 56));
  expect(screen.getByTestId('map-tutorial-step-map')).toBeVisible();
  expect(screen.getByTestId('map-tutorial-highlight')).toHaveStyle({ left: 28, top: 798 });

  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  expect(screen.getByTestId('map-tutorial-step-map')).toBeVisible();
  expect(screen.getByTestId('map-tutorial-highlight')).toHaveStyle({ left: 28, top: 798 });
  await act(() => resolveFavorites?.(93, 798, 75, 56));
  expect(screen.getByTestId('map-tutorial-step-favorites')).toBeVisible();
  expect(screen.getByTestId('map-tutorial-highlight')).toHaveStyle({ left: 93, top: 798 });
});

test('first visit shows Pingdy, traverses all nine steps, and remembers dismissal on remount', async () => {
  const view = await renderWithProviders(<MapTutorialProvider enabled username="민지" />);
  await screen.findByTestId('map-tutorial-step-welcome');
  expect(screen.getAllByText('Pingdy')).toHaveLength(2);
  expect(screen.getByText('안녕하세요, 민지님')).toBeVisible();
  expect(screen.queryByTestId('map-tutorial-previous')).toBeNull();

  for (const step of MAP_TUTORIAL_STEPS.slice(1)) {
    await fireEvent.press(screen.getByTestId('map-tutorial-next'));
    expect(screen.getByTestId(`map-tutorial-step-${step}`)).toBeVisible();
  }
  expect(screen.getByTestId('map-tutorial-progress')).toHaveAccessibilityValue({ min: 1, max: 9, now: 9 });
  expect(screen.queryByTestId('map-tutorial-next')).toBeNull();
  await fireEvent.press(screen.getByTestId('map-tutorial-previous'));
  expect(screen.getByTestId('map-tutorial-step-categories')).toBeVisible();
  await fireEvent.press(screen.getByTestId('map-tutorial-close'));
  await waitFor(() => expect(screen.queryByTestId('map-tutorial')).toBeNull());
  expect(await AsyncStorage.getItem(MAP_TUTORIAL_SEEN_KEY)).toBe('1');
  await view.unmount();
  await renderWithProviders(<MapTutorialProvider enabled username="민지" />);
  await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledWith(MAP_TUTORIAL_SEEN_KEY));
  expect(screen.queryByTestId('map-tutorial')).toBeNull();
});

test('waits for the map home, pauses off-screen, and uses the English catalog', async () => {
  const view = await renderWithProviders(<MapTutorialProvider enabled={false} />, { language: 'en' });
  expect(screen.queryByTestId('map-tutorial')).toBeNull();
  await view.rerender(<MapTutorialProvider enabled />);
  await screen.findByTestId('map-tutorial-step-welcome');
  expect(screen.getByText('Hello, traveler!')).toBeVisible();
  await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  await view.rerender(<MapTutorialProvider enabled={false} />);
  expect(screen.queryByTestId('map-tutorial')).toBeNull();
  expect(await AsyncStorage.getItem(MAP_TUTORIAL_SEEN_KEY)).toBeNull();
  await view.rerender(<MapTutorialProvider enabled />);
  expect(screen.getByTestId('map-tutorial-step-map')).toBeVisible();
});

test('storage failure still allows closing the guide', async () => {
  jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('unavailable'));
  await renderWithProviders(<MapTutorialProvider enabled />);
  await screen.findByTestId('map-tutorial');
  await fireEvent.press(screen.getByTestId('map-tutorial-close'));
  expect(screen.queryByTestId('map-tutorial')).toBeNull();
});

test('hides location recovery during the tutorial and rechecks once on dismissal', async () => {
  const onFinish = jest.fn();
  await renderWithProviders(<MapTutorialProvider enabled onFinish={onFinish}>
    <LocationStatusOverlay location={{ status: 'denied', coordinate: null, canAskAgain: true }}
      onRefresh={jest.fn()} />
  </MapTutorialProvider>);
  await screen.findByTestId('map-tutorial-step-welcome');
  expect(screen.queryByTestId('v2-location-denied', { includeHiddenElements: true })).toBeNull();
  expect(onFinish).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('map-tutorial-close'));
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('v2-location-denied')).toBeVisible();
});

test('finishing the last tutorial step rechecks but a previously dismissed guide does not', async () => {
  const onFinish = jest.fn();
  jest.spyOn(View.prototype, 'measureInWindow').mockImplementation(callback => callback(0, 0, 375, 667));
  function ProfileTarget() {
    const { register } = useMapTutorial();
    useEffect(() => {
      register('profile', { measureInWindow: (callback: MeasureInWindowOnSuccessCallback) => callback(320, 40, 40, 40) } as View);
      return () => register('profile', null);
    }, [register]);
    return null;
  }
  const view = await renderWithProviders(<MapTutorialProvider enabled onFinish={onFinish}><ProfileTarget /></MapTutorialProvider>);
  await screen.findByTestId('map-tutorial-step-welcome');
  for (const _step of MAP_TUTORIAL_STEPS.slice(1)) {
    await fireEvent.press(screen.getByTestId('map-tutorial-next'));
  }
  await fireEvent.press(screen.getByTestId('map-tutorial-highlight'));
  expect(onFinish).toHaveBeenCalledTimes(1);
  await view.unmount();
  await renderWithProviders(<MapTutorialProvider enabled onFinish={onFinish} />);
  await waitFor(() => expect(AsyncStorage.getItem).toHaveBeenCalledWith(MAP_TUTORIAL_SEEN_KEY));
  expect(onFinish).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId('map-tutorial')).toBeNull();
});

test('anchors the card edge without waiting for content-height measurements', () => {
  const common = { height: 874, topInset: 62, bottomInset: 0 };
  const map = getTutorialCardPlacement({ ...common, step: 'map', target: { x: 28, y: 798, width: 75, height: 56 } });
  expect(map).toEqual({ top: undefined, bottom: 100, maxHeight: 700 });
  // Both a regular 232px guide and a wrapped 300px guide end 24px above the tab.
  expect(common.height - map.bottom! - 232).toBe(542);
  expect(common.height - map.bottom! - 300).toBe(474);
  expect(getTutorialCardPlacement({ ...common, step: 'profile', target: { x: 342, y: 70, width: 44, height: 44 } }))
    .toEqual({ top: 138, bottom: undefined, maxHeight: 724 });
  expect(getTutorialCardPlacement({ ...common, step: 'categories', target: { x: 8, y: 130, width: 386, height: 34 } }))
    .toEqual({ top: 188, bottom: undefined, maxHeight: 674 });
  expect(getTutorialCardPlacement({ ...common, height: 500, step: 'verification', target: { x: 270, y: 200, width: 120, height: 48 } }))
    .toEqual({ top: 272, bottom: undefined, maxHeight: 216 });
});

test('keeps the card at the same height across differently sized bottom navigation buttons', () => {
  const common = { height: 874, topInset: 62, bottomInset: 0 };
  const reservations = getTutorialCardPlacement({ ...common, step: 'reservations',
    target: { x: 250, y: 798, width: 78, height: 56 } });
  const recommendations = getTutorialCardPlacement({ ...common, step: 'recommendations',
    target: { x: 330, y: 794, width: 64, height: 64 } });
  expect(recommendations).toEqual(reservations);
});
