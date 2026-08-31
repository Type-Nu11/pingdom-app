import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { createPlaceDetailQueryOptions } from '../../place-detail/hooks/usePlaceDetail';
import { useInfiniteCheckIns } from '../../check-ins/hooks/useCheckIns';
import { useBookmarkedPlaceIds, useToggleBookmark } from '../hooks/useBookmarks';
import { ErrorState } from '../../../shared/components';
import VerifiedPlaceCard from '../components/VerifiedPlaceCard';
import VerifiedPlaceCardSkeleton from '../components/VerifiedPlaceCardSkeleton';
import {
  toVerifiedPlaceEntries,
  toVerifiedPlaceListState,
  type VerifiedPlaceEntry,
} from '../model/verifiedPlaceEntries';
import BackIcon from '../../../shared/assets/icons/back.svg';

export type VerifiedPlacesScreenProps = {
  onBack: () => void;
};

export default function VerifiedPlacesScreen({ onBack }: VerifiedPlacesScreenProps) {
  const { t } = useTranslation();
  // Each check-in costs one place detail request, so a page here is a fan-out of
  // the same size. A page of 10 keeps that burst to roughly one screen's worth
  // of cards instead of loading two screens ahead.
  const checkInsQuery = useInfiniteCheckIns(VERIFIED_PLACES_PAGE_SIZE);
  const { bookmarkedPlaceIds } = useBookmarkedPlaceIds();
  const toggleBookmark = useToggleBookmark();

  const placeIds = useMemo(() => {
    const ids = (checkInsQuery.data?.pages ?? [])
      .flatMap((page) => page.checkIns)
      .map((checkIn) => checkIn.placeId);
    return Array.from(new Set(ids));
  }, [checkInsQuery.data]);

  const placeDetailQueries = useQueries({
    queries: placeIds.map((placeId) => createPlaceDetailQueryOptions(placeId)),
  });

  const listState = toVerifiedPlaceListState(
    toVerifiedPlaceEntries(placeIds, placeDetailQueries),
  );
  const listData: VerifiedPlaceEntry[] = checkInsQuery.isLoading
    ? SKELETON_ENTRIES
    : listState.kind === 'ready' ? listState.entries : [];

  const retry = () => {
    void checkInsQuery.refetch();
    placeDetailQueries.forEach((query) => void query.refetch());
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-verified-places-screen">
      <TopBar>
        <IconButton
          accessibilityLabel={t('myPage.back')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
        >
          <BackIcon height={44} width={44} />
        </IconButton>
        <TopBarTitle>{t('myPage.verifiedPlaces.title')}</TopBarTitle>
        <Spacer />
      </TopBar>

      {checkInsQuery.isError || listState.kind === 'error' ? (
        <ErrorState
          actionLabel={t('myPage.retry')}
          description={t('myPage.verifiedPlaces.error')}
          fill
          onAction={retry}
        />
      ) : (
      <FlatList
        columnWrapperStyle={COLUMN_WRAPPER_STYLE}
        contentContainerStyle={CONTENT_CONTAINER_STYLE}
        data={listData}
        style={LIST_STYLE}
        keyExtractor={(entry) => String(entry.placeId)}
        ListEmptyComponent={<EmptyPlacesText>{t('myPage.verifiedPlaces.empty')}</EmptyPlacesText>}
        numColumns={2}
        onEndReached={() => {
          if (checkInsQuery.hasNextPage && !checkInsQuery.isFetchingNextPage) {
            void checkInsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item: entry }) => (
          entry.place ? (
            <VerifiedPlaceCard
              address={entry.place.address}
              favorited={bookmarkedPlaceIds.has(entry.placeId)}
              imageUrl={entry.place.thumbnailUrl}
              name={entry.place.name}
              onToggleFavorite={() => toggleBookmark.mutate({
                nextBookmarked: !bookmarkedPlaceIds.has(entry.placeId),
                placeId: entry.placeId,
              })}
            />
          ) : (
            <VerifiedPlaceCardSkeleton />
          )
        )}
      />
      )}
    </Screen>
  );
}

const VERIFIED_PLACES_PAGE_SIZE = 10;

// Negative ids cannot collide with a real place id, so the skeleton placeholders
// keep stable FlatList keys while the first check-in page loads.
const SKELETON_ENTRIES: VerifiedPlaceEntry[] = [-1, -2, -3, -4].map((placeId) => ({
  isError: false,
  isLoading: true,
  place: null,
  placeId,
}));

const CONTENT_CONTAINER_STYLE = { flexGrow: 1, gap: 12, padding: 24 } as const;
const COLUMN_WRAPPER_STYLE = { gap: 12 } as const;
const LIST_STYLE = { flex: 1 } as const;

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.lg}px;
`;

const IconButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const Spacer = styled.View`
  width: 44px;
  height: 44px;
`;

const TopBarTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const EmptyPlacesText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
`;
