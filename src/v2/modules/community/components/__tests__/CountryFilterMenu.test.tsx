import React from 'react';
import { Dimensions } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { createTestI18n, renderWithProviders } from '../../../../app/testing/testProviders';
import CountryFilterMenu from '../CountryFilterMenu';

test.each(['LIGHT', 'DARK'] as const)('%s country filter matches the Figma card and stays inside the screen', async appearancePreference => {
  const onSelect = jest.fn();
  const onClose = jest.fn();
  const { height } = Dimensions.get('window');
  await renderWithProviders(<CountryFilterMenu visible countries={['KR', 'US', 'JP', 'VN', 'CN', 'TH']}
    isError={false} isLoading={false} selectedCountryCode="KR" onRetry={jest.fn()}
    onSelect={onSelect} onClose={onClose} position={{ right: 16, top: height - 30 }} />,
  { appearancePreference, language: 'ko' });
  const card = screen.getByTestId('v2-community-country-menu');
  expect(card).toHaveStyle({ width: 200, borderRadius: 24 });
  await fireEvent(card, 'layout', { nativeEvent: { layout: { height: 358, width: 200, x: 0, y: 0 } } });
  expect(Object.assign({}, ...[card.props.style].flat(Infinity)).top).toBeLessThanOrEqual(height - 358 - 8);
  expect(screen.getByText('한국')).toHaveStyle({ color: '#FF1956', fontSize: 16, lineHeight: 21 });
  expect(screen.getByTestId('v2-community-country-US')).toHaveStyle({ height: 52, marginTop: 6, marginLeft: 8 });
  await fireEvent.press(screen.getByTestId('v2-community-country-KR'));
  expect(onSelect).toHaveBeenCalledWith(null);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('production missing-key handling never replaces country labels with Translation unavailable', async () => {
  const i18n = await createTestI18n('ko');
  i18n.options.parseMissingKeyHandler = () => 'Translation unavailable';
  await renderWithProviders(<CountryFilterMenu visible countries={['kr', 'SG', 'FR', 'XX']}
    isError={false} isLoading={false} selectedCountryCode={null} onRetry={jest.fn()}
    onSelect={jest.fn()} onClose={jest.fn()} position={{ right: 16, top: 201 }} />, { i18n });
  expect(screen.getByText('한국')).toBeVisible();
  expect(screen.getByText('싱가포르')).toBeVisible();
  expect(screen.getByText('프랑스')).toBeVisible();
  expect(screen.getByTestId('v2-community-country-XX')).toHaveTextContent('XX');
  expect(screen.queryByText('Translation unavailable')).toBeNull();
});

test('native devices without DisplayNames show country names with the six Figma choices first', async () => {
  jest.spyOn(Intl, 'DisplayNames').mockImplementation(() => { throw new Error('UNSUPPORTED'); });
  const i18n = await createTestI18n('ko');
  i18n.options.parseMissingKeyHandler = () => 'Translation unavailable';
  await renderWithProviders(<CountryFilterMenu visible countries={['AD', 'AE', 'CN', 'JP', 'KR', 'TH', 'US', 'VN']}
    isError={false} isLoading={false} selectedCountryCode={null} onRetry={jest.fn()}
    onSelect={jest.fn()} onClose={jest.fn()} position={{ right: 16, top: 201 }} />, { i18n });
  const rows = screen.getAllByTestId(/^v2-community-country-[A-Z]{2}$/);
  expect(rows.slice(0, 6).map(row => row.props.testID)).toEqual([
    'v2-community-country-KR', 'v2-community-country-US', 'v2-community-country-JP',
    'v2-community-country-VN', 'v2-community-country-CN', 'v2-community-country-TH',
  ]);
  expect(screen.getByText('안도라')).toBeVisible();
  expect(screen.getByText('아랍에미리트')).toBeVisible();
});
