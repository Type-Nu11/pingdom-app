import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import styled from 'styled-components/native';

import { textStyleCss } from '../../../shared/theme/typography';
import { joinMeta } from '../model/photoCount';
import CommunityImage from './CommunityImage';

export type CommunityPlaceCardProps = {
  category?: string | null;
  imageUrl?: string | null;
  /** Deleted or otherwise unavailable place: dimmed, name only. */
  muted?: boolean;
  name: string;
  region?: string | null;
  testID?: string;
  /** Rendered right after the name (detail: chevron or busy spinner). */
  nameAccessory?: React.ReactNode;
  /** Rendered at the card's trailing edge (write: remove button). */
  trailing?: React.ReactNode;
};

// Figma `PlaceTag` (detail 8241:47062, write 8168:10664): 12px padding on
// `Secondary/Assistive`, a 50px thumbnail 16px before the "category · region"
// line, and the place name 4px below. The thumbnail and meta line only render
// when the response carries them — nothing is filled in on the client.
export default function CommunityPlaceCard({
  category,
  imageUrl,
  muted = false,
  name,
  nameAccessory,
  region,
  testID,
  trailing,
}: CommunityPlaceCardProps) {
  const meta = muted ? '' : joinMeta([category, region]);

  return (
    <Card $muted={muted} testID={testID}>
      {imageUrl && !muted ? (
        <CommunityImage
          height={50}
          radius={8}
          testID={testID ? `${testID}-thumbnail` : undefined}
          uri={imageUrl}
          width={50}
        />
      ) : null}
      <Info>
        {meta ? <Meta numberOfLines={1} testID={testID ? `${testID}-meta` : undefined}>{meta}</Meta> : null}
        <NameRow>
          <Name $muted={muted} numberOfLines={1}>{name}</Name>
          {nameAccessory}
        </NameRow>
      </Info>
      {trailing}
    </Card>
  );
}

const Card = styled.View<{ $muted: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
  opacity: ${({ $muted }) => ($muted ? 0.6 : 1)};
`;
const Info = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const Meta = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.bodyRegular)}`;
const NameRow = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const Name = styled(AppText)<{ $muted: boolean }>`
  flex-shrink: 1;
  color: ${({ $muted, theme }) => ($muted ? theme.colors.textMuted : theme.colors.labelStrong)};
  ${({ theme }) => textStyleCss(theme.typography.headline1Bold)}
`;
