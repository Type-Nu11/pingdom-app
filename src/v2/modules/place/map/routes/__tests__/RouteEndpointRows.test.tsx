import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { PanResponder, type PanResponderCallbacks, type GestureResponderEvent, type PanResponderGestureState } from 'react-native';
import { renderWithProviders } from '../../../../../app/testing/testProviders';
import RouteEndpointRows, { endpointDragCrossesRow } from '../components/RouteEndpointRows';

test.each([
  ['origin', 29, 56, true], ['origin', 28, 56, false], ['origin', -80, 56, false],
  ['destination', -29, 56, true], ['destination', -28, 56, false], ['destination', 80, 56, false],
  ['origin', 40, 100, false], ['destination', NaN, 56, false],
] as const)('drag %s by %s crosses a %s row: %s', (role, dy, height, expected) => {
  expect(endpointDragCrossesRow(role, dy, height)).toBe(expected);
});

test('a held row swaps after crossing even when the responder acquires the first move at the other row', async () => {
  const configs: PanResponderCallbacks[] = [];
  const create = PanResponder.create;
  const spy = jest.spyOn(PanResponder, 'create').mockImplementation(config => { configs.push(config); return create(config); });
  const swap = jest.fn(), edit = jest.fn(), dragging = jest.fn();
  try {
    await renderWithProviders(<RouteEndpointRows origin={{ placeId: 0, name: 'GPS' }} destination={{ placeId: 1, name: 'Place' }} onEdit={edit} onSwap={swap} onDragging={dragging} />);
    const row = screen.getByTestId('route-origin-row');
    await fireEvent(row, 'pressIn', { nativeEvent: { pageY: 100 } });
    await fireEvent(row, 'longPress');
    const event = { nativeEvent: { pageY: 170 } } as GestureResponderEvent;
    const gesture = { dy: 0 } as PanResponderGestureState;
    await act(() => {
      configs[0].onPanResponderMove?.(event, gesture);
      configs[0].onPanResponderRelease?.(event, gesture);
    });
    await fireEvent.press(row);
    expect(swap).toHaveBeenCalledTimes(1);
    expect(edit).not.toHaveBeenCalled();
    expect(dragging).toHaveBeenLastCalledWith(false);
  } finally { spy.mockRestore(); }
});
