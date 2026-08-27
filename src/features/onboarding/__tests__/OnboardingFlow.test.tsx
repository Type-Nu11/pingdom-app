import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Pressable as MockPressable, Text as MockText } from 'react-native';

import OnboardingFlow from '../OnboardingFlow';

jest.mock('../../../v2/shared/i18n', () => ({
  setLanguage: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../SelectFirstScreen', () => ({ onNext }: { onNext: () => void }) => (
  <MockPressable onPress={onNext} testID="first-next"><MockText>first</MockText></MockPressable>
));
jest.mock('../SelectLanguageScreen', () => ({
  onNext,
}: {
  onNext: (language: 'en') => void;
}) => (
  <MockPressable onPress={() => onNext('en')} testID="language-next">
    <MockText>language</MockText>
  </MockPressable>
));
jest.mock('../SelectCountryScreen', () => ({
  onNext,
}: {
  onNext: (country: 'US') => void;
}) => (
  <MockPressable onPress={() => onNext('US')} testID="country-next">
    <MockText>country</MockText>
  </MockPressable>
));
jest.mock('../SelectAgeScreen', () => ({
  onNext,
}: {
  onNext: (year: number) => void;
}) => (
  <MockPressable onPress={() => onNext(2000)} testID="age-next">
    <MockText>age</MockText>
  </MockPressable>
));
jest.mock('../SelectGenderScreen', () => ({
  onNext,
}: {
  onNext: (gender: 'female') => void;
}) => (
  <MockPressable onPress={() => onNext('female')} testID="gender-next">
    <MockText>gender</MockText>
  </MockPressable>
));
jest.mock('../../../v2/features/onboarding-preferences', () => ({
  OnboardingPreferenceFlow: ({
    initialStep,
    onBack,
    onComplete,
  }: {
    initialStep?: 'purpose' | 'schedule';
    onBack: () => void;
    onComplete: () => Promise<void> | void;
  }) => (
    <>
      <MockPressable onPress={onBack} testID="preferences-back">
        <MockText>preferences back</MockText>
      </MockPressable>
      <MockPressable onPress={onComplete} testID="preferences-complete">
        <MockText>preferences complete</MockText>
      </MockPressable>
      <MockText testID="preferences-entry-step">{initialStep}</MockText>
    </>
  ),
}));

describe('OnboardingFlow', () => {
  test('completes only after demographics and V2 preferences are finished', async () => {
    const onComplete = jest.fn().mockResolvedValue(undefined);
    await render(<OnboardingFlow onComplete={onComplete} />);

    await fireEvent.press(screen.getByTestId('first-next'));
    await fireEvent.press(screen.getByTestId('language-next'));
    await fireEvent.press(screen.getByTestId('country-next'));
    await fireEvent.press(screen.getByTestId('age-next'));
    await fireEvent.press(screen.getByTestId('gender-next'));
    expect(screen.getByTestId('preferences-complete')).toBeVisible();
    expect(screen.getByTestId('preferences-entry-step')).toHaveTextContent('purpose');
    expect(onComplete).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('preferences-back'));
    expect(screen.getByTestId('gender-next')).toBeVisible();

    await fireEvent.press(screen.getByTestId('gender-next'));
    await fireEvent.press(screen.getByTestId('preferences-complete'));
    expect(onComplete).toHaveBeenCalledWith({
      birthYear: 2000,
      country: 'US',
      language: 'en',
    });
  });
});
