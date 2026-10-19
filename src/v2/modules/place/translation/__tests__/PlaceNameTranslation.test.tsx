import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { Text } from '../../../../shared/components/Typography';
import PlaceNameTranslation from '../PlaceNameTranslation';
import { offlineTranslation } from '../service';

const mockProfile = { id: 402, country: 'US' };
jest.mock('../../../user/profile', () => ({ useProfile: () => ({ profile: mockProfile }) }));
jest.mock('../service', () => ({ offlineTranslation: {
  available: jest.fn(() => true), models: jest.fn(), download: jest.fn(), delete: jest.fn(), translate: jest.fn(),
} }));
const models = offlineTranslation.models as jest.Mock;
const translate = offlineTranslation.translate as jest.Mock;
beforeEach(async () => {
  await AsyncStorage.clear(); mockProfile.country = 'US';
  (offlineTranslation.available as jest.Mock).mockReturnValue(true);
  models.mockResolvedValue(['ko']);
  translate.mockResolvedValue('Translated server name');
});
async function ready(original = '서버 장소명') {
  const view = await renderWithProviders(<PlaceNameTranslation original={original} />, { language: 'en' });
  await screen.findByText('Translated server name');
  return view;
}
async function manage() {
  await fireEvent(screen.getByTestId('place-name-translation-title'), 'longPress');
  await screen.findByTestId('place-translation-dialog');
}

test('automatically translates the real original on entry without a translation/switch button', async () => {
  await ready();
  expect(translate).toHaveBeenCalledWith('서버 장소명', 'en');
  expect(translate).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('button', { name: 'Translate · Google' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Show original' })).toBeNull();
  expect(screen.getByLabelText('Translated by Google')).toBeVisible();
  expect(offlineTranslation.download).not.toHaveBeenCalled();
  await manage();
  expect(screen.getByText('서버 장소명')).toBeVisible();
});

test('rerendering while translation is pending does not duplicate the request', async () => {
  let resolve!: (value: string) => void;
  translate.mockImplementationOnce(() => new Promise<string>(done => { resolve = done; }));
  const view = await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  await waitFor(() => expect(translate).toHaveBeenCalledTimes(1));
  expect(screen.getByLabelText('Translating…')).toBeVisible();
  await view.rerender(<PlaceNameTranslation original="서버 장소명" />);
  expect(translate).toHaveBeenCalledTimes(1);
  await act(async () => { resolve('Translated server name'); });
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('Translated server name');
});

test('late results from the previous original cannot replace the next place', async () => {
  let resolve!: (value: string) => void;
  translate.mockImplementationOnce(() => new Promise<string>(done => { resolve = done; }));
  const view = await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  await waitFor(() => expect(translate).toHaveBeenCalled());
  await view.rerender(<PlaceNameTranslation original="다른 서버 장소명" />);
  await screen.findByText('Translated server name');
  await act(async () => { resolve('Old place result'); });
  expect(screen.queryByText('Old place result')).toBeNull();
  expect(translate).toHaveBeenLastCalledWith('다른 서버 장소명', 'en');
});

test('missing models require explicit download, then only the current title translates automatically', async () => {
  models.mockResolvedValue([]);
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  await fireEvent.press(await screen.findByRole('button', { name: 'Language pack required' }));
  expect(translate).not.toHaveBeenCalled();
  expect(offlineTranslation.download).not.toHaveBeenCalled();
  expect(screen.getByText(/Estimated size: ≈30 MB/)).toBeVisible();
  (offlineTranslation.download as jest.Mock).mockImplementationOnce(async () => { models.mockResolvedValue(['ko']); });
  await fireEvent.press(screen.getByRole('button', { name: 'Download over Wi-Fi' }));
  await waitFor(() => expect(translate).toHaveBeenCalledWith('서버 장소명', 'en'));
  await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('Translated server name');
  expect(translate).toHaveBeenCalledTimes(1);
});

test('manual target persists independently and changing it triggers automatic translation', async () => {
  models.mockResolvedValue(['ko', 'ja']);
  await ready(); await manage();
  await fireEvent.press(screen.getByRole('radio', { name: '日本語' }));
  await waitFor(() => expect(translate).toHaveBeenLastCalledWith('서버 장소명', 'ja'));
  expect(await AsyncStorage.getItem('@pingdom/place-translation/target/402')).toBe('ja');
});

test('selecting Korean restores the original, removes attribution and persists across remounts', async () => {
  const view = await ready(); await manage();
  await fireEvent.press(screen.getByRole('radio', { name: '한국어' }));
  await waitFor(() => expect(screen.getByText('Showing the Korean original')).toBeVisible());
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('서버 장소명');
  expect(screen.queryByLabelText('Translated by Google')).toBeNull();
  expect(await AsyncStorage.getItem('@pingdom/place-translation/target/402')).toBe('ko');
  expect(translate).toHaveBeenCalledTimes(1);
  view.unmount();
  models.mockClear(); translate.mockClear();
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  await manage();
  expect(await screen.findByText('Showing the Korean original')).toBeVisible();
  expect(models).not.toHaveBeenCalled();
  expect(translate).not.toHaveBeenCalled();
  expect(offlineTranslation.download).not.toHaveBeenCalled();
});

test('Korean can be selected during translation and rejects a late translated result', async () => {
  let resolve!: (value: string) => void;
  translate.mockImplementationOnce(() => new Promise<string>(done => { resolve = done; }));
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  await waitFor(() => expect(translate).toHaveBeenCalled());
  await manage();
  await fireEvent.press(screen.getByRole('radio', { name: '한국어' }));
  await screen.findByText('Showing the Korean original');
  await act(async () => { resolve('Late translation'); });
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('서버 장소명');
  expect(screen.queryByLabelText('Translated by Google')).toBeNull();
});

test('Korean country defaults to the original without models', async () => {
  mockProfile.country = 'KR'; models.mockResolvedValue([]);
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  await manage();
  expect(await screen.findByText('Showing the Korean original')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Language pack required' })).toBeNull();
  expect(models).not.toHaveBeenCalled(); expect(translate).not.toHaveBeenCalled();
});

test('failures retain the original and allow an explicit retry', async () => {
  translate.mockRejectedValueOnce(new Error('native failure'));
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  const retry = await screen.findByRole('button', { name: 'Check again' });
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('서버 장소명');
  expect(screen.queryByLabelText('Translated by Google')).toBeNull();
  await fireEvent.press(retry);
  await screen.findByText('Translated server name');
  expect(translate).toHaveBeenCalledTimes(2);
});

test('unsupported persisted targets fall back to the country recommendation', async () => {
  await AsyncStorage.setItem('@pingdom/place-translation/target/402', 'not-supported');
  await ready(); expect(translate).toHaveBeenCalledWith('서버 장소명', 'en');
});

test('multilingual countries require a target selection rather than guessing', async () => {
  mockProfile.country = 'CA';
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  expect(await screen.findByRole('button', { name: 'Choose language' })).toBeVisible();
  expect(translate).not.toHaveBeenCalled();
});

test('built-in English cannot be deleted and Korean explains its shared role', async () => {
  models.mockResolvedValue(['ko', 'en']); await ready(); await manage();
  expect(screen.queryByRole('button', { name: 'Delete model: English' })).toBeNull();
  expect(screen.getByText('Korean is shared by all translation languages.')).toBeVisible();
});

test('automatic translation does not activate the detail action', async () => {
  const onNamePress = jest.fn();
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" onNamePress={onNamePress} />, { language: 'en' });
  await screen.findByText('Translated server name');
  expect(onNamePress).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByTestId('place-name-translation-title'));
  expect(onNamePress).toHaveBeenCalledTimes(1);
});

test('inline category and reserved title height remain stable through automatic translation', async () => {
  let resolve!: (value: string) => void;
  translate.mockImplementationOnce(() => new Promise<string>(done => { resolve = done; }));
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" inlineCategory category={<Text>음식점</Text>} />, { language: 'en' });
  await waitFor(() => expect(translate).toHaveBeenCalled());
  const height = screen.getByTestId('place-name-translation-header').props.style.minHeight;
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('서버 장소명 음식점');
  await act(async () => { resolve('Translated server name'); });
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('Translated server name 음식점');
  expect(screen.getByTestId('place-name-translation-header')).toHaveStyle({ minHeight: height });
});

test('unavailable native builds keep the original without a download or translation request', async () => {
  (offlineTranslation.available as jest.Mock).mockReturnValue(false);
  await renderWithProviders(<PlaceNameTranslation original="서버 장소명" />, { language: 'en' });
  expect(screen.getByTestId('place-name-translation-title')).toHaveTextContent('서버 장소명');
  expect(translate).not.toHaveBeenCalled(); expect(offlineTranslation.download).not.toHaveBeenCalled();
});

test('photo attribution reports translation state without rendering a duplicate badge beside the title', async () => {
  const onTranslationChange = jest.fn();
  const view = await renderWithProviders(<PlaceNameTranslation original="서버 장소명" inlineCategory
    attributionPlacement="photos" onTranslationChange={onTranslationChange} />, { language: 'en' });
  await screen.findByText('Translated server name');
  expect(onTranslationChange).toHaveBeenLastCalledWith({ original: '서버 장소명', translated: true });
  expect(screen.queryByLabelText('Translated by Google')).toBeNull();
  translate.mockImplementationOnce(() => new Promise<string>(() => {}));
  await view.rerender(<PlaceNameTranslation original="새 장소" inlineCategory
    attributionPlacement="photos" onTranslationChange={onTranslationChange} />);
  expect(onTranslationChange).toHaveBeenLastCalledWith({ original: '새 장소', translated: false });
});
