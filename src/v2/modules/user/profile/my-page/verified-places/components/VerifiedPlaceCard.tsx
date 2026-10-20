import { Text as AppText } from '../../../../../../shared/components/Typography';
import React, { useEffect, useState } from 'react';
import { Image, type GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { FavoriteIcon } from '../../../../../../shared/components';

import {
  VERIFIED_PLACE_CARD_HEIGHT,
  VERIFIED_PLACE_CARD_RADIUS,
  VERIFIED_PLACE_CARD_WIDTH,
} from '../model/verifiedPlaceLayout';

// Figma Component 10 (MyPage 4951:6708): the caption scrim starts 35px above the text.
const CAPTION_TOP_PADDING = 35;
const CAPTION_PADDING = 12;
// Black scrim a0 at the top → a.5 at 64.6% from the bottom → a1 at the bottom.
const SCRIM_MIDPOINT = 1 - 0.646;

type VerifiedPlaceCardProps = {
  width?: number;
  address: string;
  favorited: boolean;
  imageUrl: string | null;
  name: string;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export default function VerifiedPlaceCard({
  width = VERIFIED_PLACE_CARD_WIDTH,
  address,
  favorited,
  imageUrl,
  name,
  onPress,
  onToggleFavorite,
}: VerifiedPlaceCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageUrl]);

  const handleToggleFavorite = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite();
  };

  return (
    // The shadow lives outside the clipping card so it is not cut off by overflow: hidden.
    <CardShadow
      style={{ boxShadow: `0px 4px 20px 0px ${theme.colors.shadowFloat}` }}
      testID="v2-verified-place-card-shadow"
    >
      <Card
        style={{ width }}
        accessibilityLabel={`${name}, ${address}`}
        accessibilityRole="button"
        onPress={onPress}
        testID="v2-verified-place-card"
      >
        {imageUrl && !imageFailed ? (
          <Photo
            onError={() => setImageFailed(true)}
            source={{ uri: imageUrl }}
            testID="v2-verified-place-card-image"
          />
        ) : (
          <PhotoFallback testID="v2-verified-place-card-fallback" />
        )}
        <Overlay testID="v2-verified-place-card-overlay">
          <GradientLayer pointerEvents="none">
            <Svg height="100%" width="100%" testID="v2-verified-place-card-gradient">
              <Defs>
                <LinearGradient id="verifiedPlaceShade" x1="0" x2="0" y1="0" y2="1">
                  <Stop offset="0" stopColor={theme.colors.staticBlack} stopOpacity={0} />
                  <Stop offset={SCRIM_MIDPOINT} stopColor={theme.colors.staticBlack} stopOpacity={0.5} />
                  <Stop offset="1" stopColor={theme.colors.staticBlack} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect fill="url(#verifiedPlaceShade)" height="100%" width="100%" />
            </Svg>
          </GradientLayer>
          <TextBlock testID="v2-verified-place-card-text">
            <Name numberOfLines={2} maxFontSizeMultiplier={2}>{name}</Name>
            <Address numberOfLines={1} maxFontSizeMultiplier={2}>{address}</Address>
          </TextBlock>
          <FavoriteButton
            accessibilityLabel={t(
              favorited ? 'myPage.verifiedPlaces.unfavorite' : 'myPage.verifiedPlaces.favorite',
            )}
            accessibilityRole="button"
            accessibilityState={{ selected: favorited }}
            hitSlop={8}
            onPress={handleToggleFavorite}
          >
            <FavoriteIcon idleColor={theme.colors.staticWhite} selected={favorited} size={24} />
          </FavoriteButton>
        </Overlay>
      </Card>
    </CardShadow>
  );
}

const CardShadow = styled.View`
  flex-grow: 0;
  flex-shrink: 0;
  border-radius: ${VERIFIED_PLACE_CARD_RADIUS}px;
`;

const Card = styled.Pressable`
  height: ${VERIFIED_PLACE_CARD_HEIGHT}px;
  flex-grow: 0;
  flex-shrink: 0;
  border-radius: ${VERIFIED_PLACE_CARD_RADIUS}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const Photo = styled(Image)`
  width: 100%;
  height: 100%;
`;

const PhotoFallback = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;

const GradientLayer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
`;

const Overlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${CAPTION_TOP_PADDING}px ${CAPTION_PADDING}px ${CAPTION_PADDING}px;
`;

const TextBlock = styled.View`
  flex: 1;
  min-width: 0;
`;

const Name = styled(AppText)`
  color: ${({ theme }) => theme.colors.staticWhite};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: 700;
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight}px;
`;

const Address = styled(AppText)`
  color: ${({ theme }) => theme.colors.staticWhite};
  font-size: ${({ theme }) => theme.typography.captionMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.captionMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.captionMedium.lineHeight}px;
`;

const FavoriteButton = styled.Pressable`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
`;
