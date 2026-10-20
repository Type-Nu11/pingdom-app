import React from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { useSharedPulse } from '../useSharedPulse';

function Probe() { useSharedPulse(); return <View />; }

test('does not start a looping animation when reduced motion is enabled', async () => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
  const loop = jest.spyOn(Animated, 'loop');
  await act(async () => { await render(<Probe />); });
  expect(loop).not.toHaveBeenCalled();
});

test('shares one driver and stops it on a live reduced-motion change', async () => {
  jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  const subscribe = jest.spyOn(AccessibilityInfo, 'addEventListener');
  const driver = { start: jest.fn(), stop: jest.fn(), reset: jest.fn() };
  const loop = jest.spyOn(Animated, 'loop').mockReturnValue(driver);
  const view = await render(<><Probe /><Probe /></>);
  const onMotionChange = subscribe.mock.calls[0][1] as unknown as (enabled: boolean) => void;
  const remove = jest.spyOn(subscribe.mock.results[0].value, 'remove');
  expect(loop).toHaveBeenCalledTimes(1);
  expect(driver.start).toHaveBeenCalledTimes(1);
  await act(async () => { onMotionChange?.(true); });
  expect(driver.stop).toHaveBeenCalledTimes(1);
  await act(async () => { onMotionChange?.(false); });
  expect(driver.start).toHaveBeenCalledTimes(2);
  await view.unmount();
  expect(remove).toHaveBeenCalledTimes(1);
  expect(driver.stop).toHaveBeenCalledTimes(2);
});
