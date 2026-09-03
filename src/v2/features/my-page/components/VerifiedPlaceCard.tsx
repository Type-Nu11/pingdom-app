import React, { useEffect, useState } from 'react';
import { Image, type GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { FavoriteIcon } from '../../../shared/components';

const CARD_WIDTH = 177;
const CARD_HEIGHT = 222;
const GRADIENT_HEIGHT = 105;

type VerifiedPlaceCardProps = {
  address: string;
  favorited: boolean;
  imageUrl: string | null;
  name: string;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export default function VerifiedPlaceCard({
  address,
  favorited,
  imageUrl,
  name,
  onPress,
  onToggleFavorite,
}: VerifiedPlaceCardProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [imageUrl]);

  const handleToggleFavorite = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite();
  };

  return (
    <Card
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
        <PhotoFallback />
      )}
      <GradientLayer pointerEvents="none">
        <Svg height={GRADIENT_HEIGHT} width={CARD_WIDTH}>
          <Defs>
            <LinearGradient id="verifiedPlaceShade" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity={0} />
              <Stop offset="0.65" stopColor="#000000" stopOpacity={0.45} />
              <Stop offset="1" stopColor="#000000" stopOpacity={0.7} />
            </LinearGradient>
          </Defs>
          <Rect fill="url(#verifiedPlaceShade)" height="100%" width="100%" />
        </Svg>
      </GradientLayer>
      <Overlay>
        <TextBlock>
          <Name numberOfLines={2}>{name}</Name>
          <Address numberOfLines={1}>{address}</Address>
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
          <FavoriteIcon selected={favorited} size={20} />
        </FavoriteButton>
      </Overlay>
    </Card>
  );
}

const Card = styled.Pressable`
  width: ${CARD_WIDTH}px;
  height: ${CARD_HEIGHT}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
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
  height: ${GRADIENT_HEIGHT}px;
`;

const Overlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${GRADIENT_HEIGHT}px;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: 0 ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.sm}px;
`;

const TextBlock = styled.View`
  flex: 1;
  gap: 2px;
`;

const Name = styled.Text`
  color: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 700;
  line-height: 20px;
`;

const Address = styled.Text`
  color: ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const FavoriteButton = styled.Pressable`
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
`;
