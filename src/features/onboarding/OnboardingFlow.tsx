import React, { useState } from 'react';
import LogInForeignScreen from './LogInForeignScreen';
import LogInKrScreen from './LogInKrScreen';
import SelectAgeScreen from './SelectAgeScreen';
import SelectCountryScreen from './SelectCountryScreen';
import SelectFirstScreen from './SelectFirstScreen';
import SelectGenderScreen from './SelectGenderScreen';
import SelectLanguageScreen from './SelectLanguageScreen';
import type { Country, Gender, Language } from './types';

type Step = 'first' | 'language' | 'country' | 'age' | 'gender' | 'login-kr' | 'login-foreign';

type Props = {
  onSignup: () => void;
  onLogin: () => void;
};

export default function OnboardingFlow({ onSignup, onLogin }: Props) {
  const [step, setStep] = useState<Step>('first');
  const [language, setLanguage] = useState<Language>('en');
  const [country, setCountry] = useState<Country>('US');
  const [birthYear, setBirthYear] = useState(2000);
  const [gender, setGender] = useState<Gender>('male');

  switch (step) {
    case 'first':
      return <SelectFirstScreen onNext={() => setStep('language')} />;

    case 'language':
      return (
        <SelectLanguageScreen
          onBack={() => setStep('first')}
          onNext={(lang) => { setLanguage(lang); setStep('country'); }}
        />
      );

    case 'country':
      return (
        <SelectCountryScreen
          language={language}
          onBack={() => setStep('language')}
          onNext={(c) => { setCountry(c); setStep('age'); }}
        />
      );

    case 'age':
      return (
        <SelectAgeScreen
          language={language}
          onBack={() => setStep('country')}
          onNext={(year) => { setBirthYear(year); setStep('gender'); }}
        />
      );

    case 'gender':
      return (
        <SelectGenderScreen
          language={language}
          onBack={() => setStep('age')}
          onNext={(g) => {
            setGender(g);
            setStep(country === 'KR' ? 'login-kr' : 'login-foreign');
          }}
        />
      );

    case 'login-kr':
      return (
        <LogInKrScreen
          onBack={() => setStep('gender')}
          onSignup={onSignup}
          onLogin={onLogin}
        />
      );

    case 'login-foreign':
      return (
        <LogInForeignScreen
          onBack={() => setStep('gender')}
          onStart={onSignup}
        />
      );
  }
}
