import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { voiceAssistantResources } from '../../i18n';
import { voiceSessionErrors } from '../../i18n/voiceSessionErrors';
import type { VoiceSessionErrorCode } from '../../model/voiceSessionError';
import { VoiceCommandResults } from '../VoiceCommandResults';

const cases = (['ko', 'en', 'ja'] as const).flatMap(language =>
  (Object.keys(voiceSessionErrors[language]) as VoiceSessionErrorCode[]).map(code => ({ language, code })));

test.each(cases)('$language session error $code displays a specific message instead of missing translation', async ({ language, code }) => {
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'error', code }} onRetry={undefined} />, { language });
  expect(screen.getByRole('alert')).toHaveTextContent(voiceSessionErrors[language][code]);
  expect(screen.queryByText('Translation unavailable')).toBeNull();
  expect(screen.getByTestId('voice-command-retry')).toBeDisabled();
});

test('unknown session code uses the safe feature fallback with the real missing-key handler', async () => {
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'error', code: 'FUTURE_CODE' as VoiceSessionErrorCode }} onRetry={undefined} />, { language: 'ko' });
  expect(screen.getByRole('alert')).toHaveTextContent(voiceAssistantResources.ko.command.failed);
  expect(screen.queryByText('Translation unavailable')).toBeNull();
});

test('AI retry remains an explicit action and observes backoff', async () => {
  const retry = jest.fn();
  const view = await renderWithProviders(<VoiceCommandResults state={{ phase: 'error', code: 'PROVIDER_UNAVAILABLE' }}
    onRetry={retry} retryDisabled />);
  expect(retry).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('voice-command-retry'));
  expect(retry).not.toHaveBeenCalled();
  await view.rerender(<VoiceCommandResults state={{ phase: 'error', code: 'PROVIDER_UNAVAILABLE' }} onRetry={retry} />);
  await fireEvent.press(screen.getByTestId('voice-command-retry'));
  expect(retry).toHaveBeenCalledTimes(1);
});
