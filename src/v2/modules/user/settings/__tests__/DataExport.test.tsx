import { Platform } from 'react-native';
import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { accountApi } from '../../account';
import { userDataExportWriter as writer } from '../../account/__tests__';
import DataExportScreen from '../screens/DataExportScreen';

beforeEach(() => {
  jest.spyOn(accountApi, 'getUserDataExport').mockResolvedValue({ user: { id: 1, username: 'actual' } });
  jest.spyOn(writer, 'writeUserDataExport').mockResolvedValue({ fileName: 'actual.json', uri: 'file:///actual.json' });
});

test('cancelling confirmation never requests or writes user data', async () => {
  const view = await renderWithProviders(<DataExportScreen onBack={jest.fn()} />);
  await view.user.press(screen.getByText('내 데이터 다운로드'));
  await view.user.press(screen.getByTestId('app-dialog-action-0'));
  expect(accountApi.getUserDataExport).not.toHaveBeenCalled();
  expect(writer.writeUserDataExport).not.toHaveBeenCalled();
  expect(screen.getByText('다운로드를 취소했습니다.')).toBeVisible();
});

test('exports server response and reports file preparation, not unobservable share success', async () => {
  const view = await renderWithProviders(<DataExportScreen onBack={jest.fn()} />);
  await view.user.press(screen.getByText('내 데이터 다운로드'));
  await view.user.press(screen.getByTestId('app-dialog-action-1'));
  expect(await screen.findByText(/파일을 준비했습니다/)).toBeVisible();
  expect(writer.writeUserDataExport).toHaveBeenCalledWith({ user: { id: 1, username: 'actual' } }, undefined);
});

test('export failure is visible and retryable without success text', async () => {
  jest.mocked(accountApi.getUserDataExport).mockRejectedValue(new Error('offline'));
  const view = await renderWithProviders(<DataExportScreen onBack={jest.fn()} />);
  await view.user.press(screen.getByText('내 데이터 다운로드'));
  await view.user.press(screen.getByTestId('app-dialog-action-1'));
  expect(await screen.findByText('다운로드하지 못했습니다. 다시 시도해 주세요.')).toBeVisible();
  expect(writer.writeUserDataExport).not.toHaveBeenCalled();
});

beforeEach(() => { jest.replaceProperty(Platform, 'OS', 'android'); });
