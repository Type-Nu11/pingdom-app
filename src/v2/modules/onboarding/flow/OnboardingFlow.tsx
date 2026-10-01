import React, { useState } from 'react';

import type { SupportedLanguage } from '../../../shared/i18n';
import BirthYearSelectionScreen from '../age/screens/BirthYearSelectionScreen';
import CountrySelectionScreen from '../country/screens/CountrySelectionScreen';
import { INITIAL_SELECTED_COUNTRY } from '../country/model/countries';
import type { OnboardingCountry, SignupOnboardingContext } from '../entry/model/onboardingEntry';
import GenderSelectionScreen from '../gender/screens/GenderSelectionScreen';
import { LanguageSelectionScreen } from '../language';
import { OnboardingPreferenceFlow } from '../preferences';
import WelcomeScreen from '../welcome/screens/WelcomeScreen';

type Step = 'first' | 'language' | 'country' | 'age' | 'gender' | 'travel-preferences';

type PreferenceEntryStep = 'purpose' | 'schedule';

export type OnboardingFlowProps = Readonly<{
  onComplete: (signupContext: Omit<SignupOnboardingContext, 'entryVariant'>) => Promise<void>;
}>;

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('first');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [country, setCountry] = useState<OnboardingCountry>(INITIAL_SELECTED_COUNTRY);
  const [birthYear, setBirthYear] = useState(2000);
  const [preferenceEntryStep, setPreferenceEntryStep] = useState<PreferenceEntryStep>('purpose');

  switch (step) {
    case 'first':
      return <WelcomeScreen onNext={() => setStep('language')} />;

    case 'language':
      return (
        <LanguageSelectionScreen
          onBack={() => setStep('first')}
          onNext={(selectedLanguage) => {
            setLanguage(selectedLanguage);
            setStep('country');
          }}
        />
      );

    case 'country':
      return (
        <CountrySelectionScreen
          onBack={() => setStep('language')}
          onNext={(selectedCountry) => {
            setCountry(selectedCountry);
            setStep('age');
          }}
        />
      );

    case 'age':
      return (
        <BirthYearSelectionScreen
          onBack={() => setStep('country')}
          onNext={(year) => {
            setBirthYear(year);
            setStep('gender');
          }}
        />
      );

    case 'gender':
      return (
        <GenderSelectionScreen
          onBack={() => setStep('age')}
          onNext={() => {
            setPreferenceEntryStep('purpose');
            setStep('travel-preferences');
          }}
        />
      );

    case 'travel-preferences':
      return (
        <OnboardingPreferenceFlow
          initialStep={preferenceEntryStep}
          language={language}
          onBack={() => {
            setPreferenceEntryStep('purpose');
            setStep('gender');
          }}
          onComplete={async () => {
            setPreferenceEntryStep('schedule');
            await onComplete({ birthYear, country, language });
          }}
        />
      );
  }
}
