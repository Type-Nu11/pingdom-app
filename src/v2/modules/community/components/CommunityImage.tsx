import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';

import PhotoIcon from '../../../../assets/v2/icons/community/photo-picker.svg';

export type CommunityImageProps = {
  accessibilityLabel?: string;
  /** Figma photo frames: a 1px `Line/Neutral` hairline around the image. */
  bordered?: boolean;
  height: number;
  radius: number;
  testID?: string;
  uri?: string | null;
  width: number;
};

const FALLBACK_ICON_MAX = 28;

// A remote community photo in a fixed box. A missing URL or a failed load
// falls back to the muted photo tile the other V2 place cards use, so a broken
// image never leaves a blank hole in the layout.
export default function CommunityImage({
  accessibilityLabel,
  bordered = false,
  height,
  radius,
  testID,
  uri,
  width,
}: CommunityImageProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);

  if (!uri || failed) {
    const iconSize = Math.min(FALLBACK_ICON_MAX, Math.round(Math.min(width, height) * 0.4));
    return (
      <Fallback
        $bordered={bordered}
        $height={height}
        $radius={radius}
        $width={width}
        accessibilityLabel={accessibilityLabel}
        accessible={Boolean(accessibilityLabel)}
        testID={testID ? `${testID}-fallback` : undefined}
      >
        <PhotoIcon height={iconSize} width={iconSize} />
      </Fallback>
    );
  }

  return (
    <Photo
      $bordered={bordered}
      $height={height}
      $radius={radius}
      $width={width}
      accessibilityIgnoresInvertColors
      accessibilityLabel={accessibilityLabel}
      accessible={Boolean(accessibilityLabel)}
      onError={() => setFailed(true)}
      resizeMode="cover"
      source={{ uri }}
      testID={testID}
    />
  );
}

type BoxProps = { $bordered: boolean; $height: number; $radius: number; $width: number };

const Photo = styled(Image)<BoxProps>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  border-radius: ${({ $radius }) => $radius}px;
  border-width: ${({ $bordered }) => ($bordered ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.lineNeutral};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Fallback = styled.View<BoxProps>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  align-items: center;
  justify-content: center;
  border-radius: ${({ $radius }) => $radius}px;
  border-width: ${({ $bordered }) => ($bordered ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.lineNeutral};
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
