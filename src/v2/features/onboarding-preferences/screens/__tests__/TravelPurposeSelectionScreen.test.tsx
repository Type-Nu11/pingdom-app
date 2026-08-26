import { screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../shared/testing/testProviders';
import TravelPurposeSelectionScreen from '../TravelPurposeSelectionScreen';

describe('TravelPurposeSelectionScreen', () => {
  test('공통 모델의 표시 순서로 모든 여행 목적을 렌더링한다', async () => {
    await renderWithProviders(
      <TravelPurposeSelectionScreen
        onBack={jest.fn()}
        onChange={jest.fn()}
        onContinue={jest.fn()}
        selectedPurposes={[]}
      />,
    );

    expect(screen.getAllByRole('checkbox').map((option) => option.props.accessibilityLabel))
      .toEqual([
        'K-pop',
        '뷰티',
        '패션',
        '카페',
        '음식',
        '팝업',
        '전시',
        '나이트라이프',
        '기타',
      ]);
    expect(screen.getByTestId('travel-purpose-scroll-view')).toBeVisible();
    expect([
      'K_POP',
      'BEAUTY',
      'FASHION',
      'CAFE',
      'FOOD',
      'POP_UP',
      'EXHIBITION',
      'NIGHTLIFE',
      'OTHER',
    ].map((purpose) => screen.getByTestId(
      `travel-purpose-icon-${purpose}`,
      { includeHiddenElements: true },
    ))).toHaveLength(9);
    expect(screen.queryByText('🎤')).not.toBeOnTheScreen();
    expect(screen.getByTestId(
      'travel-purpose-icon-K_POP',
      { includeHiddenElements: true },
    ).props).toMatchObject({
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
    });
  });

  test('목적을 선택하거나 해제한 결과를 부모에 전달한다', async () => {
    const onChange = jest.fn();
    const { user } = await renderWithProviders(
      <TravelPurposeSelectionScreen
        onBack={jest.fn()}
        onChange={onChange}
        onContinue={jest.fn()}
        selectedPurposes={['K_POP']}
      />,
    );

    const kPop = screen.getByRole('checkbox', { name: 'K-pop' });
    const beauty = screen.getByRole('checkbox', { name: '뷰티' });
    expect(kPop.props.accessibilityState).toEqual({ checked: true });
    expect(beauty.props.accessibilityState).toEqual({ checked: false });

    await user.press(beauty);
    expect(onChange).toHaveBeenLastCalledWith(['K_POP', 'BEAUTY']);

    await user.press(kPop);
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  test('빈 선택에서는 Continue를 비활성화한다', async () => {
    const onContinue = jest.fn();
    const { user } = await renderWithProviders(
      <TravelPurposeSelectionScreen
        onBack={jest.fn()}
        onChange={jest.fn()}
        onContinue={onContinue}
        selectedPurposes={[]}
      />,
    );

    const continueButton = screen.getByRole('button', { name: '계속' });
    expect(continueButton.props.accessibilityState).toEqual({ busy: false, disabled: true });
    await user.press(continueButton);
    expect(onContinue).not.toHaveBeenCalled();
  });

  test('Continue와 Back 이벤트를 부모에 전달한다', async () => {
    const onBack = jest.fn();
    const onContinue = jest.fn();
    const { user } = await renderWithProviders(
      <TravelPurposeSelectionScreen
        onBack={onBack}
        onChange={jest.fn()}
        onContinue={onContinue}
        selectedPurposes={['FOOD', 'CAFE']}
      />,
    );

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    await user.press(screen.getByRole('button', { name: '계속' }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('영어 문구와 진행 상태 접근성 값을 제공한다', async () => {
    await renderWithProviders(
      <TravelPurposeSelectionScreen
        currentStep={2}
        onBack={jest.fn()}
        onChange={jest.fn()}
        onContinue={jest.fn()}
        selectedPurposes={[]}
        totalSteps={4}
      />,
      { language: 'en' },
    );

    expect(screen.getByText('Choose your travel interests')).toBeVisible();
    expect(screen.getByRole('progressbar', { name: 'Onboarding progress' }).props.accessibilityValue)
      .toEqual({ max: 4, min: 1, now: 2, text: 'Step 2 of 4' });
  });
});
