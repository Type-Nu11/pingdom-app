import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '../../../../app/testing/testProviders';
import CommunityImage from '../CommunityImage';
import PhotoCountBadge from '../PhotoCountBadge';

describe('CommunityImage', () => {
  test('renders the remote photo at the requested box size', async () => {
    await renderWithProviders(
      <CommunityImage height={80} radius={12} testID="photo" uri="https://cdn.test/a.jpg" width={80} />,
    );

    const photo = screen.getByTestId('photo');
    expect(photo.props.source).toEqual({ uri: 'https://cdn.test/a.jpg' });
    expect(photo).toHaveStyle({ borderTopLeftRadius: 12, height: 80, width: 80 });
  });

  test('shows the placeholder tile without a URL', async () => {
    await renderWithProviders(<CommunityImage height={80} radius={12} testID="photo" width={80} />);

    expect(screen.queryByTestId('photo')).toBeNull();
    expect(screen.getByTestId('photo-fallback')).toHaveStyle({ borderTopLeftRadius: 12, height: 80, width: 80 });
  });

  test('swaps to the placeholder on a load error and recovers when the URL changes', async () => {
    const view = await renderWithProviders(
      <CommunityImage height={264} radius={12} testID="photo" uri="https://cdn.test/broken.jpg" width={264} />,
    );

    await act(async () => { fireEvent(screen.getByTestId('photo'), 'error'); });
    expect(screen.getByTestId('photo-fallback')).toBeTruthy();

    await act(async () => {
      view.rerender(<CommunityImage height={264} radius={12} testID="photo" uri="https://cdn.test/ok.jpg" width={264} />);
    });
    expect(screen.getByTestId('photo').props.source).toEqual({ uri: 'https://cdn.test/ok.jpg' });
  });

  test('draws the Figma hairline only when asked', async () => {
    await renderWithProviders(
      <>
        <CommunityImage bordered height={264} radius={12} testID="framed" uri="https://cdn.test/a.jpg" width={264} />
        <CommunityImage height={80} radius={12} testID="plain" uri="https://cdn.test/a.jpg" width={80} />
      </>,
    );

    expect(screen.getByTestId('framed')).toHaveStyle({ borderColor: '#F2F2F3', borderWidth: 1 });
    expect(screen.getByTestId('plain')).toHaveStyle({ borderWidth: 0 });
  });
});

describe('PhotoCountBadge', () => {
  test('pins the label inside the photo corner per variant', async () => {
    await renderWithProviders(
      <>
        <PhotoCountBadge label="+3" testID="thumb-badge" variant="thumbnail" />
        <PhotoCountBadge label="1/4" testID="gallery-badge" variant="gallery" />
      </>,
    );

    expect(screen.getByTestId('thumb-badge')).toHaveTextContent('+3');
    expect(screen.getByTestId('thumb-badge')).toHaveStyle({ bottom: 6, right: 6 });
    expect(screen.getByTestId('gallery-badge')).toHaveTextContent('1/4');
    expect(screen.getByTestId('gallery-badge')).toHaveStyle({ bottom: 12, right: 12 });
    expect(screen.getByTestId('thumb-badge')).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.6)', borderTopLeftRadius: 8, height: 20 });
    expect(screen.getByTestId('gallery-badge')).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.4)', height: 22 });
  });
});
