import React, { useState } from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';

import AvatarPlaceholder from '../assets/icons/avatar-placeholder.svg';

export type ProfileAvatarProps = {
  imageTestID?: string;
  size: number;
  uri?: string | null;
};

// Shows the user's picture, and falls back to the default avatar both when there
// is no image and when the URL fails to load. The failure is remembered per URI,
// so a new upload (new URI) gets a fresh attempt.
export default function ProfileAvatar({ imageTestID, size, uri }: ProfileAvatarProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (!uri || failedUri === uri) {
    return <AvatarPlaceholder height={size} width={size} />;
  }

  return (
    <AvatarImage
      $size={size}
      onError={() => setFailedUri(uri)}
      source={{ uri }}
      testID={imageTestID}
    />
  );
}

const AvatarImage = styled(Image)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
`;
