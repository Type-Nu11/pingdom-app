import React, { useState } from 'react';
import { OnboardingPreferenceFlow } from '../../v2/features/onboarding-preferences';
import type { SignupOnboardingContext } from '../../v2/features/onboarding-entry';
import { setLanguage as setV2Language } from '../../v2/shared/i18n';
import SelectAgeScreen from './SelectAgeScreen';
import SelectCountryScreen from './SelectCountryScreen';
import SelectFirstScreen from './SelectFirstScreen';
import SelectGenderScreen from './SelectGenderScreen';
import SelectLanguageScreen from './SelectLanguageScreen';
import type { Country, Gender, Language } from './types';

type Step =
  | 'first'
  | 'language'
  | 'country'
  | 'age'
  | 'gender'
  | 'travel-preferences';

type PreferenceEntryStep = 'purpose' | 'schedule';

type OnboardingFlowProps = Readonly<{
  onComplete: (
    signupContext: Omit<SignupOnboardingContext, 'entryVariant'>,
  ) => Promise<void>;
}>;

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('first');
  const [language, setLanguage] = useState<Language>('en');
  const [country, setCountry] = useState<Country>('US');
  const [birthYear, setBirthYear] = useState(2000);
  const [, setGender] = useState<Gender>('male');
  const [preferenceEntryStep, setPreferenceEntryStep] =
    useState<PreferenceEntryStep>('purpose');

  switch (step) {
    case 'first':
      return <SelectFirstScreen onNext={() => setStep('language')} />;

    case 'language':
      return (
        <SelectLanguageScreen
          onBack={() => setStep('first')}
          onNext={(lang) => {
            setLanguage(lang);
            void setV2Language(lang);
            setStep('country');
          }}
        />
      );

    case 'country':
      return (
        <SelectCountryScreen
          onBack={() => setStep('language')}
          onNext={(c) => { setCountry(c); setStep('age'); }}
        />
      );

    case 'age':
      return (
        <SelectAgeScreen
          onBack={() => setStep('country')}
          onNext={(year) => { setBirthYear(year); setStep('gender'); }}
        />
      );

    case 'gender':
      return (
        <SelectGenderScreen
          onBack={() => setStep('age')}
          onNext={(g) => {
            setGender(g);
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
