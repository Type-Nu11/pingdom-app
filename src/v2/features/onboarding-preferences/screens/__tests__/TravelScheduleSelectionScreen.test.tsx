import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import TravelScheduleSelectionScreen from '../TravelScheduleSelectionScreen';

describe('TravelScheduleSelectionScreen', () => {
  test('renders a selected range and delegates Back and Continue', async () => {
    const onBack = jest.fn();
    const onContinue = jest.fn();
    const { user } = await renderWithProviders(
      <TravelScheduleSelectionScreen
        onBack={onBack}
        onChange={jest.fn()}
        onContinue={onContinue}
        selectedSchedule={{
          endDateText: '2026-07-18',
          startDateText: '2026-07-05',
        }}
      />,
    );

    expect(screen.getByText('2026.07.05')).toBeVisible();
    expect(screen.getByText('2026.07.18')).toBeVisible();
    expect(screen.getByTestId('travel-schedule-day-2026-07-05').props.accessibilityState)
      .toEqual({ disabled: false, selected: true });
    expect(screen.getByTestId('travel-schedule-day-2026-07-18').props.accessibilityState)
      .toEqual({ disabled: false, selected: true });

    const continueButton = screen.getByRole('button', { name: '계속' });
    expect(continueButton.props.accessibilityState).toEqual({ busy: false, disabled: false });
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    await user.press(continueButton);

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('prevents an end date before the selected start date', async () => {
    const onChange = jest.fn();
    const { user } = await renderWithProviders(
      <TravelScheduleSelectionScreen
        onBack={jest.fn()}
        onChange={onChange}
        onContinue={jest.fn()}
        selectedSchedule={{ endDateText: '', startDateText: '2026-07-05' }}
      />,
    );

    const earlierDate = screen.getByTestId('travel-schedule-day-2026-07-04');
    expect(earlierDate.props.accessibilityState).toEqual({ disabled: true, selected: false });
    await user.press(earlierDate);
    expect(onChange).not.toHaveBeenCalled();

    await user.press(screen.getByTestId('travel-schedule-day-2026-07-18'));
    expect(onChange).toHaveBeenCalledWith({
      endDateText: '2026-07-18',
      startDateText: '2026-07-05',
    });
  });

  test('moves between months without changing the selected schedule', async () => {
    const onChange = jest.fn();
    const { user } = await renderWithProviders(
      <TravelScheduleSelectionScreen
        onBack={jest.fn()}
        onChange={onChange}
        onContinue={jest.fn()}
        selectedSchedule={{
          endDateText: '2026-07-18',
          startDateText: '2026-07-05',
        }}
      />,
    );

    expect(screen.getByRole('header', { name: '2026년 7월' })).toBeVisible();
    await user.press(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByRole('header', { name: '2026년 8월' })).toBeVisible();
    await user.press(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByRole('header', { name: '2026년 7월' })).toBeVisible();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('shows empty and invalid input safely with Continue disabled', async () => {
    const emptyRender = await renderWithProviders(
      <TravelScheduleSelectionScreen
        onBack={jest.fn()}
        onChange={jest.fn()}
        onContinue={jest.fn()}
        selectedSchedule={{ endDateText: '', startDateText: '' }}
      />,
    );

    expect(screen.getAllByText('선택 전')).toHaveLength(2);
    expect(screen.getByTestId('travel-schedule-scroll-view')).toBeVisible();
    expect(screen.getByRole('button', { name: '계속' }).props.accessibilityState.disabled)
      .toBe(true);
    emptyRender.unmount();

    const onChange = jest.fn();
    const { user } = await renderWithProviders(
      <TravelScheduleSelectionScreen
        onBack={jest.fn()}
        onChange={onChange}
        onContinue={jest.fn()}
        selectedSchedule={{
          endDateText: '2026-07-04',
          startDateText: '2026-07-05',
        }}
      />,
    );

    expect(screen.getByText('날짜를 확인하고 올바른 기간을 다시 선택해 주세요.'))
      .toBeVisible();
    expect(screen.getByRole('button', { name: '계속' }).props.accessibilityState.disabled)
      .toBe(true);
    await user.press(screen.getByTestId('travel-schedule-day-2026-07-12'));
    expect(onChange).toHaveBeenCalledWith({
      endDateText: '',
      startDateText: '2026-07-12',
    });
  });

  test('supports English copy and exposes progress accessibility state', async () => {
    await renderWithProviders(
      <TravelScheduleSelectionScreen
        currentStep={3}
        onBack={jest.fn()}
        onChange={jest.fn()}
        onContinue={jest.fn()}
        selectedSchedule={{
          endDateText: '2026-07-18',
          startDateText: '2026-07-05',
        }}
        totalSteps={7}
      />,
      { language: 'en' },
    );

    expect(screen.getByText('Tell us your travel dates')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Onboarding progress' }).props.accessibilityValue)
      .toEqual({ max: 7, min: 1, now: 3, text: 'Step 3 of 7' });
  });
});
