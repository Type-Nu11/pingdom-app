import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, waitFor } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import {
  ONBOARDING_PREFERENCE_STORAGE_KEY,
  useOnboardingPreferenceStore,
} from '../..';
import OnboardingPreferenceFlow from '../OnboardingPreferenceFlow';

function resetStoreMemory() {
  useOnboardingPreferenceStore.setState(
    useOnboardingPreferenceStore.getInitialState(),
    true,
  );
}

async function seedPreferences() {
  await AsyncStorage.setItem(ONBOARDING_PREFERENCE_STORAGE_KEY, JSON.stringify({
    selectedPurposes: ['CAFE'],
    selectedSchedule: {
      endDateText: '2026-07-18',
      startDateText: '2026-07-05',
    },
    version: 1,
  }));
}

describe('OnboardingPreferenceFlow', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    resetStoreMemory();
  });

  test('restores values and connects purpose, schedule, back, and completion as steps 5 and 6', async () => {
    await seedPreferences();
    const onBack = jest.fn();
    const onComplete = jest.fn();
    const { user } = await renderWithProviders(
      <OnboardingPreferenceFlow onBack={onBack} onComplete={onComplete} />,
    );

    const cafe = await screen.findByRole('checkbox', { name: '카페' });
    expect(cafe.props.accessibilityState).toEqual({ checked: true });
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      max: 6,
      min: 1,
      now: 5,
      text: '6단계 중 5단계',
    });

    await user.press(screen.getByRole('button', { name: '계속' }));
    expect(await screen.findByTestId('travel-schedule-screen')).toBeVisible();
    expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
      max: 6,
      min: 1,
      now: 6,
      text: '6단계 중 6단계',
    });

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(await screen.findByTestId('travel-purpose-screen')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: '카페' }).props.accessibilityState)
      .toEqual({ checked: true });
    expect(onBack).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: '계속' }));
    await screen.findByTestId('travel-schedule-screen');
    await user.press(screen.getByRole('button', { name: '계속' }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  test('returns to the host from the purpose step without discarding the in-memory draft', async () => {
    const onBack = jest.fn();
    const { unmount, user } = await renderWithProviders(
      <OnboardingPreferenceFlow onBack={onBack} onComplete={jest.fn()} />,
    );

    await screen.findByTestId('travel-purpose-screen');
    await user.press(screen.getByRole('checkbox', { name: '음식' }));
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(await AsyncStorage.getItem(ONBOARDING_PREFERENCE_STORAGE_KEY)).toBeNull();

    unmount();
    await renderWithProviders(
      <OnboardingPreferenceFlow onBack={jest.fn()} onComplete={jest.fn()} />,
    );

    expect((await screen.findByRole('checkbox', { name: '음식' })).props.accessibilityState)
      .toEqual({ checked: true });
  });

  test('keeps the current step and selection after a save failure so Continue can retry', async () => {
    await seedPreferences();
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write failed'));
    const { user } = await renderWithProviders(
      <OnboardingPreferenceFlow onBack={jest.fn()} onComplete={jest.fn()} />,
    );

    await screen.findByRole('checkbox', { name: '카페' });
    await user.press(screen.getByRole('button', { name: '계속' }));

    expect(await screen.findByTestId('travel-purpose-error')).toHaveTextContent(
      '선택값을 저장하지 못했어요. 계속 버튼을 다시 눌러 주세요.',
    );
    expect(screen.queryByTestId('travel-schedule-screen')).toBeNull();
    expect(screen.getByRole('checkbox', { name: '카페' }).props.accessibilityState)
      .toEqual({ checked: true });

    await user.press(screen.getByRole('button', { name: '계속' }));
    expect(await screen.findByTestId('travel-schedule-screen')).toBeVisible();
  });

  test('recovers from a restore failure with safe empty values', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('read failed'));
    await renderWithProviders(
      <OnboardingPreferenceFlow onBack={jest.fn()} onComplete={jest.fn()} />,
    );

    expect(await screen.findByTestId('travel-purpose-error')).toHaveTextContent(
      '저장된 선택을 불러오지 못했어요. 새로 선택해 계속할 수 있어요.',
    );
    expect(screen.getByRole('button', { name: '계속' }).props.accessibilityState.disabled)
      .toBe(true);
  });

  test('can re-enter at the schedule step from the existing completion screen', async () => {
    await seedPreferences();
    await renderWithProviders(
      <OnboardingPreferenceFlow
        initialStep="schedule"
        onBack={jest.fn()}
        onComplete={jest.fn()}
      />,
    );

    expect(await screen.findByTestId('travel-schedule-screen')).toBeVisible();
    expect(screen.getByText('2026.07.05')).toBeVisible();
    expect(screen.getByText('2026.07.18')).toBeVisible();
  });

  test('uses Korean when selected and English as the fallback for other V1 languages', async () => {
    const koreanRender = await renderWithProviders(
      <OnboardingPreferenceFlow
        language="ko"
        onBack={jest.fn()}
        onComplete={jest.fn()}
      />,
      { language: 'en' },
    );

    expect(await screen.findByText('여행 목적을 선택해 주세요')).toBeVisible();
    koreanRender.unmount();

    resetStoreMemory();
    await renderWithProviders(
      <OnboardingPreferenceFlow
        language="ja"
        onBack={jest.fn()}
        onComplete={jest.fn()}
      />,
      { language: 'ko' },
    );

    expect(await screen.findByText('Choose your travel interests')).toBeVisible();
  });
});
