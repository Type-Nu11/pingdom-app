import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Platform } from 'react-native';
import { ThemeProvider } from 'styled-components/native';

import LoadingState from '../../../shared/components/LoadingState';
import { isSupportedLanguage } from '../../../shared/i18n';
import { theme } from '../../../shared/theme';
import TravelPurposeSelectionScreen from './TravelPurposeSelectionScreen';
import TravelScheduleSelectionScreen from './TravelScheduleSelectionScreen';
import { useOnboardingPreferenceStore } from '../store/onboardingPreferenceStore';

const CURRENT_PURPOSE_STEP = 6;
const CURRENT_SCHEDULE_STEP = 7;
const TOTAL_STEPS = 7;

export type OnboardingPreferenceStep = 'purpose' | 'schedule';

export type OnboardingPreferenceFlowProps = Readonly<{
  initialStep?: OnboardingPreferenceStep;
  language?: string;
  onBack: () => void;
  onComplete: () => void;
}>;

export default function OnboardingPreferenceFlow(props: OnboardingPreferenceFlowProps) {
  return (
    <ThemeProvider theme={theme}>
      <OnboardingPreferenceFlowContent {...props} />
    </ThemeProvider>
  );
}

function OnboardingPreferenceFlowContent({
  initialStep = 'purpose',
  language,
  onBack,
  onComplete,
}: OnboardingPreferenceFlowProps) {
  const { i18n, t } = useTranslation();
  const [step, setStep] = useState<OnboardingPreferenceStep>(initialStep);
  const hydrationError = useOnboardingPreferenceStore((state) => state.hydrationError);
  const hydrationStatus = useOnboardingPreferenceStore((state) => state.hydrationStatus);
  const isHydrated = useOnboardingPreferenceStore((state) => state.isHydrated);
  const saveError = useOnboardingPreferenceStore((state) => state.saveError);
  const saveStatus = useOnboardingPreferenceStore((state) => state.saveStatus);
  const selectedPurposes = useOnboardingPreferenceStore((state) => state.selectedPurposes);
  const selectedSchedule = useOnboardingPreferenceStore((state) => state.selectedSchedule);
  const hydratePreferences = useOnboardingPreferenceStore(
    (state) => state.hydratePreferences,
  );
  const persistPreferences = useOnboardingPreferenceStore(
    (state) => state.persistPreferences,
  );
  const updateSelectedPurposes = useOnboardingPreferenceStore(
    (state) => state.updateSelectedPurposes,
  );
  const updateSelectedSchedule = useOnboardingPreferenceStore(
    (state) => state.updateSelectedSchedule,
  );

  useEffect(() => {
    if (!isSupportedLanguage(language)) {
      return;
    }

    if (i18n.resolvedLanguage !== language) {
      void i18n.changeLanguage(language);
    }
  }, [i18n, language]);

  useEffect(() => {
    if (!isHydrated && hydrationStatus !== 'loading') {
      void hydratePreferences();
    }
  }, [hydratePreferences, hydrationStatus, isHydrated]);

  const handleBack = useCallback(() => {
    if (step === 'schedule') {
      setStep('purpose');
    } else {
      onBack();
    }
  }, [onBack, step]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [handleBack]);

  const continueAfterSave = async (next: () => void) => {
    if (saveStatus === 'saving') {
      return;
    }

    await persistPreferences();

    if (useOnboardingPreferenceStore.getState().saveStatus !== 'error') {
      next();
    }
  };

  if (!isHydrated) {
    return (
      <LoadingState
        description={t('onboarding.preferenceFlow.loading')}
        fill
      />
    );
  }

  const errorMessage = saveError
    ? t('onboarding.preferenceFlow.saveError')
    : hydrationError
      ? t('onboarding.preferenceFlow.restoreError')
      : null;

  if (step === 'purpose') {
    return (
      <TravelPurposeSelectionScreen
        currentStep={CURRENT_PURPOSE_STEP}
        errorMessage={errorMessage}
        isContinuing={saveStatus === 'saving'}
        onBack={handleBack}
        onChange={updateSelectedPurposes}
        onContinue={() => void continueAfterSave(() => setStep('schedule'))}
        selectedPurposes={selectedPurposes}
        totalSteps={TOTAL_STEPS}
      />
    );
  }

  return (
    <TravelScheduleSelectionScreen
      currentStep={CURRENT_SCHEDULE_STEP}
      errorMessage={errorMessage}
      isContinuing={saveStatus === 'saving'}
      onBack={handleBack}
      onChange={updateSelectedSchedule}
      onContinue={() => void continueAfterSave(onComplete)}
      selectedSchedule={selectedSchedule}
      totalSteps={TOTAL_STEPS}
    />
  );
}
