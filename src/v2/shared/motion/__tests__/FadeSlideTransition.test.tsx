import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Animated, Text } from 'react-native';

import { FadeSlideTransition } from '../FadeSlideTransition';

const mockUseReducedMotion = jest.fn(() => false);

jest.mock('../useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

describe('FadeSlideTransition', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('초기 화면은 움직이지 않고 state가 바뀔 때 opacity와 이동 전환을 실행한다', async () => {
    const start = jest.fn();
    const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
      reset: jest.fn(),
      start,
      stop: jest.fn(),
    } as unknown as Animated.CompositeAnimation);
    const result = await render(
      <FadeSlideTransition direction={0} stateKey="map" testID="section-transition">
        <Text>지도</Text>
      </FadeSlideTransition>,
    );

    expect(timing).not.toHaveBeenCalled();

    await result.rerender(
      <FadeSlideTransition direction={1} stateKey="favorites" testID="section-transition">
        <Text>즐겨찾기</Text>
      </FadeSlideTransition>,
    );

    expect(screen.getByText('즐겨찾기')).toBeOnTheScreen();
    expect(screen.getByTestId('section-transition')).toHaveStyle({
      opacity: 0,
      transform: [{ translateX: 24 }],
    });
    expect(timing).toHaveBeenCalledTimes(2);
    expect(start).toHaveBeenCalledTimes(2);
  });

  test('Reduce Motion에서는 state가 바뀌어도 timing을 시작하지 않는다', async () => {
    mockUseReducedMotion.mockReturnValue(true);
    const timing = jest.spyOn(Animated, 'timing');
    const result = await render(
      <FadeSlideTransition direction={0} stateKey="map">
        <Text>지도</Text>
      </FadeSlideTransition>,
    );

    await result.rerender(
      <FadeSlideTransition direction={1} stateKey="favorites">
        <Text>즐겨찾기</Text>
      </FadeSlideTransition>,
    );

    expect(screen.getByText('즐겨찾기')).toBeVisible();
    expect(timing).not.toHaveBeenCalled();
  });
});
