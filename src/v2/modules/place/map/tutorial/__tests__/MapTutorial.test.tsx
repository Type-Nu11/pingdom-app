import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import { MapTutorialProvider } from '../MapTutorialProvider';
import { MAP_TUTORIAL_SEEN_KEY, MAP_TUTORIAL_STEPS, getTutorialCardTop } from '../model';

test('first visit shows Pingdi, traverses all nine steps, and remembers dismissal on remount', async () => {
  const view = await renderWithProviders(<MapTutorialProvider enabled username="민지" />);
  await screen.findByTestId('map-tutorial-step-welcome');
  expect(screen.getAllByText('핑디')).toHaveLength(2);
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

test('positions the card relative to its control and keeps it inside safe areas', () => {
  const common = { height: 874, cardHeight: 232, topInset: 62, bottomInset: 0 };
  expect(getTutorialCardTop({ ...common, step: 'map', target: { x: 28, y: 798, width: 75, height: 56 } })).toBe(542);
  expect(getTutorialCardTop({ ...common, step: 'profile', target: { x: 342, y: 70, width: 44, height: 44 } })).toBe(138);
  expect(getTutorialCardTop({ ...common, step: 'categories', target: { x: 8, y: 130, width: 386, height: 34 } })).toBe(188);
  expect(getTutorialCardTop({ ...common, height: 500, cardHeight: 400, step: 'verification', target: { x: 270, y: 200, width: 120, height: 48 } })).toBe(74);
});
