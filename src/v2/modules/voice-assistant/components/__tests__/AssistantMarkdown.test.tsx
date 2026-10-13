import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { renderWithProviders } from '../../../../app/testing/testProviders';
import { VoiceCommandResults } from '../VoiceCommandResults';

test('AI replies render headings, emphasis, lists and code instead of Markdown delimiters', async () => {
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'assistant', text:
    '# 검색 결과\n\n**용짬뽕**을 찾았습니다.\n\n- 첫 번째 장소\n- 두 번째 장소\n\n1. 상세정보 확인\n\n`70095`\n\n```json\n{"id":70095}\n```' }} />);
  expect(screen.getByText('검색 결과')).toHaveStyle({ fontSize: 22 });
  expect(screen.getByText('용짬뽕')).toHaveStyle({ fontFamily: 'PretendardStdVariable-ExtraBold' });
  expect(screen.getByText('첫 번째 장소')).toBeVisible();
  expect(screen.getByText('두 번째 장소')).toBeVisible();
  expect(screen.getByText('상세정보 확인')).toBeVisible();
  expect(screen.getByText('70095')).toHaveStyle({ fontFamily: 'Courier', fontSize: 14 });
  expect(screen.getByText('{"id":70095}')).toBeVisible();
  expect(screen.getByTestId('voice-assistant-message')).not.toHaveTextContent(/\*\*|```|# 검색 결과|- 첫 번째/);
});

test.each(['LIGHT', 'DARK'] as const)('plain AI replies keep the existing bold font and %s theme colour', async appearancePreference => {
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'assistant', text: '안녕하세요!' }} />, { appearancePreference });
  expect(screen.getByText('안녕하세요!')).toHaveStyle({ fontFamily: 'PretendardStdVariable-Bold',
    color: appearancePreference === 'LIGHT' ? '#0C0C0D' : '#FFFFFF' });
});

test('Markdown links show their label and open only on a user tap', async () => {
  const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  await renderWithProviders(<VoiceCommandResults state={{ phase: 'assistant', text: '[상세정보 보기](https://www.typenull.xyz/places/70095)' }} />);
  expect(screen.getByText('상세정보 보기')).toHaveStyle({ textDecorationLine: 'underline' });
  expect(openURL).not.toHaveBeenCalled();
  await fireEvent.press(screen.getByText('상세정보 보기'));
  expect(openURL).toHaveBeenCalledWith('https://www.typenull.xyz/places/70095');
});
