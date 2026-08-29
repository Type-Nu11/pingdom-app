import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';

import { useOnboardingEntry } from '../hooks/useOnboardingEntry';
import {
  createOnboardingCompletion,
  ONBOARDING_COMPLETION_VERSION,
} from '../model/onboardingEntry';
import {
  ONBOARDING_COMPLETION_STORAGE_KEY,
  persistOnboardingCompletion,
  restoreOnboardingCompletion,
} from '../services/onboardingCompletionStorage';

const signupContext = {
  birthYear: 2000,
  country: 'US' as const,
  language: 'en' as const,
};

describe('onboarding completion storage', () => {
  test('treats a missing value as incomplete and verifies the storage read', async () => {
    const getItem = jest.spyOn(AsyncStorage, 'getItem');

    await expect(restoreOnboardingCompletion()).resolves.toEqual({ kind: 'empty' });
    expect(getItem).toHaveBeenCalledWith(ONBOARDING_COMPLETION_STORAGE_KEY);
  });

  test('persists and restores the versioned minimal signup context', async () => {
    const completion = createOnboardingCompletion(signupContext);
    const setItem = jest.spyOn(AsyncStorage, 'setItem');

    await persistOnboardingCompletion(completion);

    expect(setItem).toHaveBeenCalledWith(
      ONBOARDING_COMPLETION_STORAGE_KEY,
      JSON.stringify({
        completed: true,
        signupContext: { ...signupContext, entryVariant: 'foreign' },
        version: ONBOARDING_COMPLETION_VERSION,
      }),
    );
    await expect(restoreOnboardingCompletion()).resolves.toEqual({
      completion,
      kind: 'restored',
    });
  });

  test.each([
    ['damaged JSON', '{'],
    ['unsupported version', JSON.stringify({ completed: true, version: 2 })],
    ['inconsistent entry variant', JSON.stringify({
      completed: true,
      signupContext: { ...signupContext, entryVariant: 'kr' },
      version: 1,
    })],
  ])('treats %s as incomplete', async (_label, value) => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETION_STORAGE_KEY, value);
    await expect(restoreOnboardingCompletion()).resolves.toEqual({ kind: 'invalid' });
  });

  test('read failure exits hydration with an incomplete fallback', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('read failed'));
    const { result } = await renderHook(() => useOnboardingEntry());

    await act(async () => {
      await result.current.hydrate();
    });

    expect(result.current.state.kind).toBe('incomplete');
    if (result.current.state.kind === 'incomplete') {
      expect(result.current.state.error?.message).toBe('read failed');
    }
  });

  test('write failure does not mark onboarding completed', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write failed'));
    const { result } = await renderHook(() => useOnboardingEntry());
    await act(async () => {
      await result.current.hydrate();
    });

    let writeError: unknown;
    await act(async () => {
      try {
        await result.current.complete(signupContext);
      } catch (error) {
        writeError = error;
      }
    });
    expect(writeError).toEqual(new Error('write failed'));
    expect(result.current.state.kind).toBe('incomplete');
  });

  test('successful completion updates state only after persisting signup context', async () => {
    const { result } = await renderHook(() => useOnboardingEntry());
    await act(async () => {
      await result.current.hydrate();
    });
    await act(async () => {
      await result.current.complete(signupContext);
    });

    expect(result.current.state).toEqual({
      completion: createOnboardingCompletion(signupContext),
      kind: 'completed',
    });
  });
});
