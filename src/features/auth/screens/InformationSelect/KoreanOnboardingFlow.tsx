import React, { useState } from 'react';
import KoreanAgeScreen from './KoreanAgeScreen';
import KoreanCountryScreen from './KoreanCountryScreen';
import KoreanGenderScreen from './KoreanGenderScreen';
import KoreanLanguageScreen from './KoreanLanguageScreen';
import KoreanWelcomeScreen from './KoreanWelcomeScreen';
import type { KoreanOnboardingState, KoreanOnboardingStep } from './types';

const STEPS: KoreanOnboardingStep[] = ['welcome', 'country', 'language', 'age', 'gender'];

type KoreanOnboardingFlowProps = {
  onComplete?: (state: KoreanOnboardingState) => void;
  onExit?: () => void;
};

const INITIAL_STATE: KoreanOnboardingState = {
  country: 'South Korea',
  language: '한국어',
  birthYear: 2009,
  gender: 'male',
};

export default function KoreanOnboardingFlow({
  onComplete = () => {},
  onExit,
}: KoreanOnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formState, setFormState] = useState<KoreanOnboardingState>(INITIAL_STATE);

  const currentStep = STEPS[currentStepIndex];

  const handleBack = () => {
    if (currentStepIndex === 0) {
      onExit?.();
      return;
    }

    setCurrentStepIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentStepIndex === STEPS.length - 1) {
      onComplete(formState);
      return;
    }

    setCurrentStepIndex((prev) => prev + 1);
  };

  switch (currentStep) {
    case 'welcome':
      return <KoreanWelcomeScreen onBack={onExit} onStart={handleNext} />;
    case 'country':
      return (
        <KoreanCountryScreen
          onBack={handleBack}
          onChange={(country) => setFormState((prev) => ({ ...prev, country }))}
          onNext={handleNext}
          value={formState.country}
        />
      );
    case 'language':
      return (
        <KoreanLanguageScreen
          onBack={handleBack}
          onChange={(language) => setFormState((prev) => ({ ...prev, language }))}
          onNext={handleNext}
          value={formState.language}
        />
      );
    case 'age':
      return (
        <KoreanAgeScreen
          onBack={handleBack}
          onChange={(birthYear) => setFormState((prev) => ({ ...prev, birthYear }))}
          onNext={handleNext}
          value={formState.birthYear}
        />
      );
    case 'gender':
      return (
        <KoreanGenderScreen
          onBack={handleBack}
          onChange={(gender) => setFormState((prev) => ({ ...prev, gender }))}
          onNext={handleNext}
          value={formState.gender}
        />
      );
    default:
      return null;
  }
}
