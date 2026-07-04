import i18n from 'i18next';
import React, { useState } from 'react';
import { LoginFormScreen } from '../auth/screens/login';
import SignUpCertificationScreen from '../auth/screens/signup/SignUpCertificationScreen';
import SignUpDetailsScreen from '../auth/screens/signup/SignUpDetailsScreen';
import SignUpEmailVerifyScreen from '../auth/screens/signup/SignUpEmailVerifyScreen';
import SignUpPhoneScreen from '../auth/screens/signup/SignUpPhoneScreen';
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
  | 'login-kr'
  | 'login-foreign'
  | 'login'
  | 'signup-phone'
  | 'signup-phone-verify'
  | 'signup-details'
  | 'signup-email-verify';

export default function OnboardingFlow() {
  const [step, setStep] = useState<Step>('first');
  const [language, setLanguage] = useState<Language>('en');
  const [country, setCountry] = useState<Country>('US');
  const [birthYear, setBirthYear] = useState(2000);
  const [gender, setGender] = useState<Gender>('male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyUsername, setVerifyUsername] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');

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
            setStep(country === 'KR' ? 'login-kr' : 'login-foreign');
          }}
        />
      );

    case 'login-kr':
      return (
        <LogInKrScreen
          onBack={() => setStep('gender')}
          onSignup={() => setStep('signup-phone')}
          onLogin={() => setStep('login')}
        />
      );

    case 'login-foreign':
      return (
        <LogInForeignScreen
          onBack={() => setStep('gender')}
          onStart={() => setStep('signup-phone')}
        />
      );

    case 'login':
      return (
        <LoginFormScreen
          onBack={() => setStep('login-kr')}
          onSignup={() => setStep('signup-phone')}
        />
      );

    case 'signup-phone':
      return (
        <SignUpPhoneScreen
          onBack={() => setStep(loginStep)}
          onNext={(phone) => { setPhoneNumber(phone); setStep('signup-phone-verify'); }}
        />
      );

    case 'signup-phone-verify':
      return (
        <SignUpCertificationScreen
          phoneNumber={phoneNumber}
          onBack={() => setStep('signup-phone')}
          onVerified={() => setStep('signup-details')}
        />
      );

    case 'signup-details':
      return (
        <SignUpDetailsScreen
          onBack={() => setStep('signup-phone-verify')}
          onboardingData={{ language, country, birthYear, gender }}
          onVerify={(email, username, password) => {
            setVerifyEmail(email);
            setVerifyUsername(username);
            setVerifyPassword(password);
            setStep('signup-email-verify');
          }}
        />
      );

    case 'signup-email-verify':
      return (
        <SignUpEmailVerifyScreen
          email={verifyEmail}
          username={verifyUsername}
          password={verifyPassword}
          onBack={() => setStep('signup-details')}
        />
      );
  }
}
