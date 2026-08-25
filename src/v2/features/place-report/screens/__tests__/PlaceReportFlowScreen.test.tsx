import { fireEvent, screen } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert } from 'react-native';

import { V2_ROUTES, type V2ScreenProps } from '../../../../app/navigation/types';
import { createTestI18n, renderWithProviders } from '../../../../shared/testing/testProviders';
import { useCurrentLocation } from '../../../map/hooks/useCurrentLocation';
import { registerPlaceReportResources } from '../../i18n/placeReportResources';
import PlaceReportFlowScreen from '../PlaceReportFlowScreen';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));
jest.mock('../../../map/hooks/useCurrentLocation', () => ({ useCurrentLocation: jest.fn() }));
jest.mock('../../../map/components/KakaoMapAdapter', () => {
  const ReactLibrary = require('react');
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: ({ onCameraIdle }: { onCameraIdle?: (coordinate: { lat: number; lng: number }) => void }) =>
      ReactLibrary.createElement(
        ReactNative.Pressable,
        {
          accessibilityLabel: '테스트 지도 위치 선택',
          onPress: () => onCameraIdle?.({ lat: 37.57, lng: 126.98 }),
          testID: 'mock-place-report-map',
        },
      ),
  };
});

const navigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as unknown as V2ScreenProps<typeof V2_ROUTES.PlaceReport>['navigation'];

async function renderFlow() {
  const i18n = await createTestI18n();
  registerPlaceReportResources(i18n);
  return renderWithProviders(<PlaceReportFlowScreen navigation={navigation} />, { i18n });
}

async function moveToFirstRecord() {
  const rendered = await renderFlow();
  const { user } = rendered;

  await user.press(screen.getByTestId('mock-place-report-map'));
  await user.type(screen.getByTestId('v2-place-report-address'), '종로구 테스트로 12 1층');
  await user.press(screen.getByTestId('v2-place-report-step1-next'));
  await user.type(screen.getByTestId('v2-place-report-name'), '오아시스 팝업 스토어');
  await user.press(screen.getByTestId('v2-place-report-category-popup'));
  await user.type(screen.getByTestId('v2-place-report-opening-time'), '900');
  await user.type(screen.getByTestId('v2-place-report-closing-time'), '2000');
  await user.press(screen.getByTestId('v2-place-report-step2-next'));

  return rendered;
}

describe('PlaceReportFlowScreen', () => {
  beforeEach(() => {
    jest.mocked(useCurrentLocation).mockReturnValue({
      canAskAgain: true,
      coordinate: { lat: 37.56, lng: 126.97 },
      refresh: jest.fn(),
      status: 'granted',
    });
    jest.mocked(navigation.goBack).mockClear();
  });

  test('필수 위치와 상세 주소가 없으면 1단계를 벗어나지 않는다', async () => {
    const { user } = await renderFlow();

    await user.press(screen.getByTestId('v2-place-report-step1-next'));

    expect(screen.getByText('지도를 움직여 장소 위치를 선택해 주세요.')).toBeVisible();
    expect(screen.getByText('상세 주소를 입력해 주세요.')).toBeVisible();
    expect(screen.queryByTestId('v2-place-report-name')).toBeNull();
  });

  test('2단계 필수값을 검증하고 이전 단계 입력값을 유지한다', async () => {
    const { user } = await renderFlow();
    await user.press(screen.getByTestId('mock-place-report-map'));
    await user.type(screen.getByTestId('v2-place-report-address'), '종로구 테스트로 12 1층');
    await user.press(screen.getByTestId('v2-place-report-step1-next'));

    await user.press(screen.getByTestId('v2-place-report-step2-next'));
    expect(screen.getByText('장소 이름을 입력해 주세요.')).toBeVisible();
    expect(screen.getByText('카테고리를 선택해 주세요.')).toBeVisible();
    expect(screen.getByText('오픈 시간과 마감 시간을 올바르게 입력해 주세요.')).toBeVisible();

    const openingTime = screen.getByTestId('v2-place-report-opening-time');
    await user.type(openingTime, '999');
    expect(screen.getByDisplayValue('09:59')).toBeVisible();
    await user.clear(screen.getByTestId('v2-place-report-opening-time'));
    await user.type(screen.getByTestId('v2-place-report-opening-time'), '900');

    await user.type(screen.getByTestId('v2-place-report-name'), '오아시스 팝업 스토어');
    await user.press(screen.getByTestId('v2-place-report-category-popup'));
    await user.type(screen.getByTestId('v2-place-report-closing-time'), '2000');
    await user.press(screen.getByTestId('v2-place-report-step2-next'));
    await user.press(screen.getByLabelText('뒤로'));

    expect(screen.getByDisplayValue('오아시스 팝업 스토어')).toBeVisible();
    expect(screen.getByDisplayValue('09:00')).toBeVisible();
    expect(screen.getByDisplayValue('20:00')).toBeVisible();
    expect(screen.getByTestId('v2-place-report-category-popup').props.accessibilityState)
      .toEqual({ checked: true });

    await user.press(screen.getByLabelText('뒤로'));
    expect(screen.getByDisplayValue('종로구 테스트로 12 1층')).toBeVisible();
  });

  test('필수 사진을 추가하면 로컬 완료 상태로 제출하고 CTA는 준비 상태를 안내한다', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    const { user } = await moveToFirstRecord();

    expect(screen.getByText('사진 1장 추가 (필수)')).toBeVisible();
    await user.press(screen.getByTestId('v2-place-report-submit'));
    expect(screen.getByText('사진 1장을 추가해 주세요.')).toBeVisible();
    expect(screen.queryByTestId('v2-place-report-complete')).toBeNull();

    jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync).mockResolvedValue({
      granted: true,
    } as ImagePicker.MediaLibraryPermissionResponse);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      assets: [{ uri: 'file:///test-place.jpg' }],
      canceled: false,
    } as ImagePicker.ImagePickerSuccessResult);
    await user.press(screen.getByTestId('v2-place-report-photo-picker'));
    await user.press(screen.getByTestId('v2-place-report-submit'));

    expect(screen.getByTestId('v2-place-report-complete')).toBeVisible();
    expect(screen.getByText('오아시스 팝업 스토어')).toBeVisible();
    await user.press(screen.getByTestId('v2-place-report-card-action'));
    await user.press(screen.getByTestId('v2-place-report-interest-action'));
    expect(alert).toHaveBeenCalledTimes(2);
    expect(alert).toHaveBeenLastCalledWith('연동 준비 중', expect.any(String));
  });

  test('지도에서 제보 화면을 닫으면 내비게이션 뒤로가기를 호출한다', async () => {
    await renderFlow();
    fireEvent.press(screen.getByLabelText('뒤로'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
