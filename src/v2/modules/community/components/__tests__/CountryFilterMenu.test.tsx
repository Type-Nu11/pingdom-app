import React from 'react';
import { Dimensions } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
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
