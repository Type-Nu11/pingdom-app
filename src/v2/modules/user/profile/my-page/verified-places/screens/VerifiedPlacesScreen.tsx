import { Text as AppText } from '../../../../../../shared/components/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { createPlaceDetailQueryOptions } from '../../../../../place/detail';
import { usePlaceExplorationMediaList } from '../../../../../place/exploration';
import { useInfiniteMyReviews } from '../../../hooks/useProfile';
import { myVerifiedReviews } from '../model/myVerifiedReviews';
import { useBookmarkedPlaceIds, useToggleBookmark } from '../../hooks/useBookmarks';
import { ErrorState, HeaderBackButton } from '../../../../../../shared/components';
import VerifiedPlaceCard from '../components/VerifiedPlaceCard';
import VerifiedPlaceCardSkeleton from '../components/VerifiedPlaceCardSkeleton';
import {
  toVerifiedPlaceEntries,
  toVerifiedPlaceListState,
  type VerifiedPlaceEntry,
} from '../model/verifiedPlaceEntries';

import { getVerifiedPlaceGridCardWidth, VERIFIED_PLACE_GRID_GAP, VERIFIED_PLACE_GRID_PADDING } from '../model/verifiedPlaceLayout';

export type VerifiedPlacesScreenProps = {
  onBack: () => void;
  onOpenReview: (reviewId: number) => void;
};

export default function VerifiedPlacesScreen({ onBack, onOpenReview }: VerifiedPlacesScreenProps) {
  const { t } = useTranslation();
  const [listWidth, setListWidth] = useState(0);
  const cardWidth = getVerifiedPlaceGridCardWidth(listWidth);
  const reviewsQuery = useInfiniteMyReviews();
  const { bookmarkedPlaceIds } = useBookmarkedPlaceIds();
  const toggleBookmark = useToggleBookmark();

  const reviews = useMemo(() => myVerifiedReviews(
    reviewsQuery.data?.pages.flatMap((page) => page.reviews) ?? [],
  ), [reviewsQuery.data]);
  const { fetchNextPage, hasNextPage, isFetching, isError } = reviewsQuery;
  useEffect(() => {
    if (!reviews.length && hasNextPage && !isFetching && !isError) void fetchNextPage();
  }, [reviews.length, hasNextPage, isFetching, isError, fetchNextPage]);
  const placeIds = reviews.map((review) => review.placeId);

  const placeDetailQueries = useQueries({
    queries: placeIds.map((placeId) => createPlaceDetailQueryOptions(placeId)),
  });
  const imageUrlsByPlaceId = usePlaceExplorationMediaList(placeIds);

  const listState = toVerifiedPlaceListState(
    toVerifiedPlaceEntries(placeIds, placeDetailQueries),
  );
  const listData: VerifiedPlaceEntry[] = reviewsQuery.isLoading
    ? SKELETON_ENTRIES
    : listState.kind === 'ready' ? listState.entries : [];

  const retry = () => {
    void reviewsQuery.refetch();
    placeDetailQueries.forEach((query) => void query.refetch());
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-verified-places-screen">
      <TopBar>
        <HeaderBackButton accessibilityLabel={t('myPage.back')} onPress={onBack} />
        <TopBarTitle>{t('myPage.verifiedPlaces.title')}</TopBarTitle>
        <Spacer />
      </TopBar>

      {reviewsQuery.isError || listState.kind === 'error' ? (
        <ErrorState
          actionLabel={t('myPage.retry')}
          description={t('myPage.verifiedPlaces.error')}
          fill
          onAction={retry}
        />
      ) : (
      <FlatList
        testID="v2-verified-places-list"
        onLayout={({ nativeEvent }) => setListWidth(nativeEvent.layout.width)}
        extraData={cardWidth}
        columnWrapperStyle={COLUMN_WRAPPER_STYLE}
        contentContainerStyle={CONTENT_CONTAINER_STYLE}
        data={cardWidth === null ? [] : listData}
        style={LIST_STYLE}
        keyExtractor={(entry) => String(entry.placeId)}
        ListEmptyComponent={cardWidth !== null ? <EmptyPlacesText>{t('myPage.verifiedPlaces.empty')}</EmptyPlacesText> : null}
        numColumns={2}
        onEndReached={() => {
          if (reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
            void reviewsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item: entry }) => (
          cardWidth === null ? null : entry.place ? (
            <VerifiedPlaceCard
              width={cardWidth}
              address={entry.place.address}
              favorited={bookmarkedPlaceIds.has(entry.placeId)}
              imageUrl={imageUrlsByPlaceId[String(entry.placeId)]?.[0] ?? null}
              name={entry.place.name}
              onPress={() => {
                const review = reviews.find((item) => item.placeId === entry.placeId);
                if (review) onOpenReview(review.reviewId);
              }}
              onToggleFavorite={() => toggleBookmark.mutate({
                nextBookmarked: !bookmarkedPlaceIds.has(entry.placeId),
                placeId: entry.placeId,
              })}
            />
          ) : (
            <VerifiedPlaceCardSkeleton width={cardWidth} />
          )
        )}
      />
      )}
    </Screen>
  );
}

// Negative ids cannot collide with a real place id, so the skeleton placeholders
// keep stable FlatList keys while the first review page loads.
const SKELETON_ENTRIES: VerifiedPlaceEntry[] = [-1, -2, -3, -4].map((placeId) => ({
  isError: false,
  isLoading: true,
  place: null,
  placeId,
}));

const CONTENT_CONTAINER_STYLE = { flexGrow: 1, gap: VERIFIED_PLACE_GRID_GAP, padding: VERIFIED_PLACE_GRID_PADDING } as const;
const COLUMN_WRAPPER_STYLE = { gap: VERIFIED_PLACE_GRID_GAP } as const;
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

const Spacer = styled.View`
  width: 44px;
  height: 44px;
`;

const TopBarTitle = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const EmptyPlacesText = styled(AppText)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
`;
