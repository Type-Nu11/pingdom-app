import { Alert } from 'react-native';
import { renderHook } from '@testing-library/react-native';

import { useDiscardOnLeaveGuard, type LeaveGuardNavigation } from '../useDiscardOnLeaveGuard';

function createNavigation() {
  let listener: ((event: { data: { action: string }; preventDefault: () => void }) => void) | null = null;
  const navigation: LeaveGuardNavigation<string> = {
    addListener: jest.fn((_event, callback) => {
      listener = callback;
      return jest.fn();
    }),
    dispatch: jest.fn(),
  };
  return {
    navigation,
    fireBeforeRemove: (action = 'GO_BACK') => {
      const preventDefault = jest.fn();
      listener?.({ data: { action }, preventDefault });
      return preventDefault;
    },
  };
}

describe('useDiscardOnLeaveGuard', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('입력이 없으면 이탈을 막지 않는다', async () => {
    const { navigation, fireBeforeRemove } = createNavigation();
    await renderHook(() => useDiscardOnLeaveGuard(navigation));

    const preventDefault = fireBeforeRemove();

    expect(preventDefault).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test('입력이 있으면 이탈을 막고 폐기 확인을 띄운다', async () => {
    const { navigation, fireBeforeRemove } = createNavigation();
    const { result } = await renderHook(() => useDiscardOnLeaveGuard(navigation));
    result.current.current = true;

    const preventDefault = fireBeforeRemove('GO_BACK');

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(navigation.dispatch).not.toHaveBeenCalled();
  });

  test('폐기를 확인하면 원래 이탈 액션을 그대로 실행한다', async () => {
    const { navigation, fireBeforeRemove } = createNavigation();
    const { result } = await renderHook(() => useDiscardOnLeaveGuard(navigation));
    result.current.current = true;

    fireBeforeRemove('GO_BACK');
    const [, , buttons] = jest.mocked(Alert.alert).mock.calls[0];
    const confirmButton = buttons?.find((button) => button.style === 'destructive');
    confirmButton?.onPress?.();

    expect(navigation.dispatch).toHaveBeenCalledWith('GO_BACK');
  });

  test('제출 성공으로 dirty 플래그를 false로 되돌리면 이탈을 막지 않는다', async () => {
    const { navigation, fireBeforeRemove } = createNavigation();
    const { result } = await renderHook(() => useDiscardOnLeaveGuard(navigation));
    result.current.current = true;
    result.current.current = false;

    const preventDefault = fireBeforeRemove();

    expect(preventDefault).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test('취소를 누르면 이탈 액션을 실행하지 않는다', async () => {
    const { navigation, fireBeforeRemove } = createNavigation();
    const { result } = await renderHook(() => useDiscardOnLeaveGuard(navigation));
    result.current.current = true;

    fireBeforeRemove('GO_BACK');
    const [, , buttons] = jest.mocked(Alert.alert).mock.calls[0];
    const cancelButton = buttons?.find((button) => button.style === 'cancel');

    expect(cancelButton?.onPress).toBeUndefined();
    expect(navigation.dispatch).not.toHaveBeenCalled();
  });
});
