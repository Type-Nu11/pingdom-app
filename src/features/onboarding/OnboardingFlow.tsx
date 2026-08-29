import React, { useState } from 'react';
import { OnboardingPreferenceFlow } from '../../v2/features/onboarding-preferences';
import type { SignupOnboardingContext } from '../../v2/features/onboarding-entry';
import { setLanguage as setV2Language } from '../../v2/shared/i18n';
<<<<<<< HEAD
import { LoginFormScreen } from '../auth/screens/login';
import { PasswordResetScreen } from '../auth/screens/password-reset';
import SignUpDetailsScreen from '../auth/screens/signup/SignUpDetailsScreen';
import LogInForeignScreen from './LogInForeignScreen';
import LogInKrScreen from './LogInKrScreen';
=======
>>>>>>> origin/dev
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
<<<<<<< HEAD
  | 'travel-preferences'
  | 'login-kr'
  | 'login-foreign'
  | 'login'
  | 'password-reset'
  | 'signup-details';
=======
  | 'travel-preferences';
>>>>>>> origin/dev

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
<<<<<<< HEAD

    case 'login-kr':
      return (
        <LogInKrScreen
          onBack={() => {
            setPreferenceEntryStep('schedule');
            setStep('travel-preferences');
          }}
          onSignup={() => setStep('signup-details')}
          onLogin={() => setStep('login')}
        />
      );

    case 'login-foreign':
      return (
        <LogInForeignScreen
          onBack={() => {
            setPreferenceEntryStep('schedule');
            setStep('travel-preferences');
          }}
          onStart={() => setStep('signup-details')}
        />
      );

    case 'login':
      return (
        <LoginFormScreen
          onBack={() => setStep('login-kr')}
          onFindPassword={() => setStep('password-reset')}
          onSignup={() => setStep('signup-details')}
        />
      );

    case 'password-reset':
      return (
        <PasswordResetScreen
          onBack={() => setStep('login')}
          onCompleted={() => setStep('login')}
        />
      );

    case 'signup-details':
      return (
        <SignUpDetailsScreen
          onBack={() => setStep(loginStep)}
          onboardingData={{ language, country, birthYear, gender }}
        />
      );
=======
>>>>>>> origin/dev
  }
}
