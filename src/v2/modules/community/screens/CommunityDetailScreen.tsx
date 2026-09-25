import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackButtonIcon from '../../../../assets/v2/icons/community/back-button.svg';
import ChevronRightIcon from '../../../../assets/v2/icons/community/chevron-right.svg';
import MoreButtonIcon from '../../../../assets/v2/icons/community/more-button.svg';
import ApiErrorState from '../../../shared/components/ApiErrorState';
import { usePost, type CommunityPostDetail } from '../hooks/useCommunity';

export type CommunityDetailScreenProps = {
  onBack: () => void;
  onOpenPlace?: (placeId: number) => void;
  onSignIn?: () => void;
  postId: number;
};

// getPost only returns { postId, title, content, places } (see communityApi.ts) —
// author, tags, photos, and like/comment counts aren't part of the real
// contract yet. Comments (#341) and likes (#342) own that part of the screen
// and are intentionally left out here rather than built against guessed DTOs.
function Places({ onOpenPlace, places }: { onOpenPlace?: (placeId: number) => void; places: CommunityPostDetail['places'] }) {
  const { t } = useTranslation();
  if (!places || places.length === 0) return null;

  return (
    <PlaceList>
      {places.map((place, index) => {
        const key = place.placeId ?? `place-${index}`;
        if (place.deleted || place.placeId === undefined) {
          return (
            <PlaceRowStatic key={key}>
              <PlaceName $muted numberOfLines={1}>{place.placeName ?? t('community.detail.placeDeleted')}</PlaceName>
            </PlaceRowStatic>
          );
        }
        const placeId = place.placeId;
        return (
          <PlaceRowPressable
            accessibilityLabel={`${t('community.detail.placeTagPrefix')} ${place.placeName ?? ''}`}
            accessibilityRole="button"
            key={key}
            onPress={onOpenPlace ? () => onOpenPlace(placeId) : undefined}
          >
            <PlaceName numberOfLines={1}>{place.placeName}</PlaceName>
            <ChevronRightIcon height={20} width={20} />
          </PlaceRowPressable>
        );
      })}
    </PlaceList>
  );
}

export default function CommunityDetailScreen({ onBack, onOpenPlace, onSignIn, postId }: CommunityDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const postQuery = usePost(postId);

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-community-detail-screen">
      <Header>
        <BackButton accessibilityLabel={t('community.detail.back')} accessibilityRole="button" onPress={onBack}>
          <BackButtonIcon height={42} width={40} />
        </BackButton>
        <HeaderSpacer />
        <MoreButton accessibilityLabel={t('community.detail.settings')} accessibilityRole="button" hitSlop={8}>
          <MoreButtonIcon height={42} width={40} />
        </MoreButton>
      </Header>

      {postQuery.isLoading ? (
        <CenteredState testID="v2-community-detail-loading">
          <ActivityIndicator color={theme.colors.primary} />
        </CenteredState>
      ) : postQuery.isError ? (
        <ApiErrorState
          error={postQuery.error}
          fill
          onBack={onBack}
          onRetry={() => void postQuery.refetch()}
          onSignIn={onSignIn}
        />
      ) : (
        <Content keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <Post>
            <Title accessibilityRole="header">{postQuery.data?.title}</Title>

            <Body>
              {(postQuery.data?.content ?? '').split('\n').filter((line) => line.length > 0).map((paragraph, index) => (
                <BodyParagraph key={`${postId}-paragraph-${index}`}>{paragraph}</BodyParagraph>
              ))}
            </Body>

            <Places onOpenPlace={onOpenPlace} places={postQuery.data?.places} />
          </Post>
        </Content>
      )}
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 44px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const HeaderSpacer = styled.View`flex: 1;`;
const BackButton = styled.Pressable`width: 40px; height: 42px; align-items: center; justify-content: center;`;
const MoreButton = styled.Pressable`width: 40px; height: 42px; align-items: center; justify-content: center;`;
const Content = styled(ScrollView)`flex: 1;`;
const CenteredState = styled.View`flex: 1; align-items: center; justify-content: center;`;

const Post = styled.View`gap: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.xl}px;`;

const Title = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 20px; font-weight: 700; line-height: 26px;`;
const Body = styled.View`gap: 6px;`;
const BodyParagraph = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; line-height: ${({ theme }) => theme.typography.body.lineHeight}px;`;

const PlaceList = styled.View`gap: ${({ theme }) => theme.spacing.sm}px;`;
const PlaceRowStatic = styled.View`
  flex-direction: row; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const PlaceRowPressable = styled.Pressable`
  flex-direction: row; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const PlaceName = styled(AppText)<{ $muted?: boolean }>`flex-shrink: 1; color: ${({ $muted, theme }) => ($muted ? theme.colors.textMuted : theme.colors.textStrong)}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: 700;`;
