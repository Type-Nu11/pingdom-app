export type KoreanOnboardingStep = 'welcome' | 'country' | 'language' | 'age' | 'gender';

export type KoreanOnboardingState = {
  country: string;
  language: string;
  birthYear: number;
  gender: 'male' | 'female' | 'undisclosed';
};
