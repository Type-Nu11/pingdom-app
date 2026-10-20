import React from 'react';
import { createInstance } from 'i18next';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { createTestI18n, renderWithProviders } from '../../../app/testing/testProviders';
import { ApiError } from '../../api/ApiError';
import ApiErrorState from '../ApiErrorState';

test.each(['LIGHT', 'DARK'] as const)('safe copy follows language changes in %s', async appearancePreference => {
  const { i18n } = await renderWithProviders(<ApiErrorState error={new ApiError('<html>token=secret https://internal</html>', { status: 503 })} />, { appearancePreference });
  expect(screen.getByText('서비스에 잠시 연결할 수 없어요')).toBeTruthy();
  await act(() => i18n.changeLanguage('en'));
  expect(screen.getByText('Service temporarily unavailable')).toBeTruthy();
  expect(screen.queryByText(/token=secret/)).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});

test('retry is locked synchronously until its promise settles and can run again', async () => {
  let finish!: () => void;
  const retry = jest.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  await renderWithProviders(<ApiErrorState error={new Error('private')} onRetry={retry} />, { language: 'en' });
  const button = screen.getByRole('button', { name: 'Try again' });
  await fireEvent.press(button);
  await fireEvent.press(button);
  expect(retry).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button').props.accessibilityState).toEqual({ busy: true, disabled: true });
  await act(async () => finish());
  await fireEvent.press(screen.getByRole('button'));
  expect(retry).toHaveBeenCalledTimes(2);
  await act(async () => finish());
});

test('cancellation is silent and authorization never offers sign-in', async () => {
  const { rerender } = await renderWithProviders(<ApiErrorState error={new ApiError('cancel', { code: 'ERR_CANCELED' })} onRetry={jest.fn()} />);
  expect(screen.queryByRole('button')).toBeNull();
  await rerender(<ApiErrorState error={new ApiError('secret', { status: 403 })} onSignIn={jest.fn()} />);
  expect(screen.queryByRole('button')).toBeNull();
});

test('full-screen errors can scroll and do not truncate scaled text', async () => {
  await renderWithProviders(<ApiErrorState error={new ApiError('secret', { status: 503 })} fill onRetry={jest.fn()} />, { language: 'en' });
  const title = screen.getByRole('header');
  expect(title.props.numberOfLines).toBeUndefined();
  expect(title.props.allowFontScaling).not.toBe(false);
  expect(screen.getByText('Please try loading again in a moment.').props.numberOfLines).toBeUndefined();
});

test('missing localized error copy falls back to English without exposing the server message', async () => {
  const baseline = await createTestI18n();
  const ownedResources = JSON.parse(JSON.stringify(baseline.options.resources));
  delete ownedResources.ko.translation.common.apiError.server;
  const i18n = createInstance();
  await i18n.init({ lng: 'ko', fallbackLng: 'en', resources: ownedResources, initAsync: false });
  await renderWithProviders(<ApiErrorState error={new ApiError('token=secret', { status: 503 })} />, { i18n });
  expect(screen.getByText('Service temporarily unavailable')).toBeTruthy();
  expect(screen.queryByText('token=secret')).toBeNull();
});
