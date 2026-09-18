import React from 'react';
import { Alert } from 'react-native';
import { act, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../shared/testing/testProviders';
import { accountApi } from '../../../../modules/user/account';
import { userDataExportWriter as writer } from '../../../../modules/user/account/__tests__';
import DataExportScreen from '../DataExportScreen';

beforeEach(() => {
  jest.spyOn(accountApi, 'getUserDataExport').mockResolvedValue({ user: { id: 1, username: 'actual' } });
  jest.spyOn(writer, 'writeUserDataExport').mockResolvedValue({ fileName: 'actual.json', uri: 'file:///actual.json' });
});

test('cancelling confirmation never requests or writes user data', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  const view = await renderWithProviders(<DataExportScreen onBack={jest.fn()} />);
  await view.user.press(screen.getByText('내 데이터 다운로드'));
  await act(async () => alert.mock.calls[0][2]?.[0].onPress?.());
  expect(accountApi.getUserDataExport).not.toHaveBeenCalled();
  expect(writer.writeUserDataExport).not.toHaveBeenCalled();
  expect(screen.getByText('다운로드를 취소했습니다.')).toBeVisible();
});

test('exports server response and reports file preparation, not unobservable share success', async () => {
  const alert = jest.spyOn(Alert, 'alert');
  const view = await renderWithProviders(<DataExportScreen onBack={jest.fn()} />);
  await view.user.press(screen.getByText('내 데이터 다운로드'));
  await act(async () => alert.mock.calls[0][2]?.[1].onPress?.());
  expect(await screen.findByText(/파일을 준비했습니다/)).toBeVisible();
  expect(writer.writeUserDataExport).toHaveBeenCalledWith({ user: { id: 1, username: 'actual' } }, undefined);
});

test('export failure is visible and retryable without success text', async () => {
  jest.mocked(accountApi.getUserDataExport).mockRejectedValue(new Error('offline'));
  const alert = jest.spyOn(Alert, 'alert');
  const view = await renderWithProviders(<DataExportScreen onBack={jest.fn()} />);
  await view.user.press(screen.getByText('내 데이터 다운로드'));
  await act(async () => alert.mock.calls[0][2]?.[1].onPress?.());
  expect(await screen.findByText('다운로드하지 못했습니다. 다시 시도해 주세요.')).toBeVisible();
  expect(writer.writeUserDataExport).not.toHaveBeenCalled();
});
