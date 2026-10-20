import { getPageEntrySnapPoint, useMapSheetStore } from '../mapSheetStore';

test('a raised sheet stays raised on the next page; other states open at the resting height', () => {
  expect(getPageEntrySnapPoint('expanded')).toBe('expanded');
  expect(getPageEntrySnapPoint('medium')).toBe('medium');
  expect(getPageEntrySnapPoint('collapsed')).toBe('medium');
});

test('the shared page sheet position is kept outside the map screen', () => {
  useMapSheetStore.getState().setSnapPoint('expanded');
  expect(useMapSheetStore.getState().snapPoint).toBe('expanded');
  useMapSheetStore.getState().setSnapPoint('medium');
  expect(useMapSheetStore.getState().snapPoint).toBe('medium');
});
