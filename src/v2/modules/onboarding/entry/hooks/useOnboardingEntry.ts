import { useCallback, useState } from 'react';

import {
  createOnboardingCompletion,
  type OnboardingEntryState,
  type SignupOnboardingContext,
} from '../model/onboardingEntry';
import {
  persistOnboardingCompletion,
  restoreOnboardingCompletion,
} from '../services/onboardingCompletionStorage';

export function useOnboardingEntry() {
  const [state, setState] = useState<OnboardingEntryState>({ kind: 'hydrating' });

  const hydrate = useCallback(async () => {
    setState({ kind: 'hydrating' });

    try {
      const result = await restoreOnboardingCompletion();
      setState(result.kind === 'restored'
        ? { completion: result.completion, kind: 'completed' }
        : { kind: 'incomplete' });
    } catch (error) {
      setState({
        error: error instanceof Error ? error : new Error('Onboarding completion restore failed'),
        kind: 'incomplete',
      });
    }
  }, []);

  const complete = useCallback(async (
    signupContext: Omit<SignupOnboardingContext, 'entryVariant'>,
  ) => {
    const completion = createOnboardingCompletion(signupContext);
    await persistOnboardingCompletion(completion);
    setState({ completion, kind: 'completed' });
  }, []);

  return { complete, hydrate, state };
}
