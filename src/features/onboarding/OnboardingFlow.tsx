import i18n from 'i18next';
import React, { useState } from 'react';
import { OnboardingPreferenceFlow } from '../../v2/features/onboarding-preferences';
import { LoginFormScreen } from '../auth/screens/login';
import SignUpDetailsScreen from '../auth/screens/signup/SignUpDetailsScreen';
import LogInForeignScreen from './LogInForeignScreen';
import LogInKrScreen from './LogInKrScreen';
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
  | 'travel-preferences'
  | 'login-kr'
  | 'login-foreign'
  | 'login'
  | 'signup-details';

type PreferenceEntryStep = 'purpose' | 'schedule';

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>('first');
  const [language, setLanguage] = useState<Language>('en');
  const [country, setCountry] = useState<Country>('US');
  const [birthYear, setBirthYear] = useState(2000);
  const [gender, setGender] = useState<Gender>('male');
  const [preferenceEntryStep, setPreferenceEntryStep] =
    useState<PreferenceEntryStep>('purpose');

  const loginStep = country === 'KR' ? 'login-kr' : 'login-foreign';

  switch (step) {
    case 'first':
      return <SelectFirstScreen onNext={() => setStep('language')} />;

    case 'language':
      return (
        <SelectLanguageScreen
          onBack={() => setStep('first')}
          onNext={(lang) => {
            setLanguage(lang);
            void i18n.changeLanguage(lang);
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
          onComplete={() => {
            setPreferenceEntryStep('schedule');
            setStep(loginStep);
          }}
        />
      );

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
          onSignup={() => setStep('signup-details')}
        />
      );

    case 'signup-details':
      return (
        <SignUpDetailsScreen
          onBack={() => setStep(loginStep)}
          onboardingData={{ language, country, birthYear, gender }}
        />
      );
  }
}
