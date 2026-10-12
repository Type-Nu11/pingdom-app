import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import CommunityPlaceCard from '../CommunityPlaceCard';

describe('CommunityPlaceCard', () => {
  test('shows the thumbnail and "category · region" line the response carries', async () => {
    await renderWithProviders(
      <CommunityPlaceCard
        category="카페"
        imageUrl="https://cdn.test/place.jpg"
        name="오아시스 팝업 스토어"
        region="구지면"
        testID="place"
      />,
      { language: 'ko' },
    );

    expect(screen.getByTestId('place-thumbnail').props.source).toEqual({ uri: 'https://cdn.test/place.jpg' });
    expect(screen.getByTestId('place-meta')).toHaveTextContent('카페 · 구지면');
    expect(screen.getByText('오아시스 팝업 스토어')).toBeTruthy();
  });

  test('renders no thumbnail slot and no meta line when the response has neither', async () => {
    await renderWithProviders(<CommunityPlaceCard name="대소고" testID="place" />, { language: 'ko' });

    expect(screen.queryByTestId('place-thumbnail')).toBeNull();
    expect(screen.queryByTestId('place-thumbnail-fallback')).toBeNull();
    expect(screen.queryByTestId('place-meta')).toBeNull();
  });

  test('shows only the part of the meta line that is present', async () => {
    await renderWithProviders(<CommunityPlaceCard category="카페" name="대소고" testID="place" />, { language: 'ko' });

    expect(screen.getByTestId('place-meta')).toHaveTextContent('카페');
  });

  test('falls back to the placeholder tile when the thumbnail fails to load', async () => {
    await renderWithProviders(
      <CommunityPlaceCard imageUrl="https://cdn.test/broken.jpg" name="대소고" testID="place" />,
      { language: 'ko' },
    );

    await act(async () => { fireEvent(screen.getByTestId('place-thumbnail'), 'error'); });

    expect(screen.queryByTestId('place-thumbnail')).toBeNull();
    expect(screen.getByTestId('place-thumbnail-fallback')).toBeTruthy();
  });

  test('a muted (deleted) place hides its thumbnail and meta', async () => {
    await renderWithProviders(
      <CommunityPlaceCard category="카페" imageUrl="https://cdn.test/place.jpg" muted name="삭제된 장소예요" region="구지면" testID="place" />,
      { language: 'ko' },
    );

    expect(screen.queryByTestId('place-thumbnail')).toBeNull();
    expect(screen.queryByTestId('place-meta')).toBeNull();
  });

  test('renders the name accessory and trailing slots', async () => {
    await renderWithProviders(
      <CommunityPlaceCard name="대소고" nameAccessory={<Text>accessory</Text>} trailing={<Text>trailing</Text>} />,
      { language: 'ko' },
    );

    expect(screen.getByText('accessory')).toBeTruthy();
    expect(screen.getByText('trailing')).toBeTruthy();
  });
});
