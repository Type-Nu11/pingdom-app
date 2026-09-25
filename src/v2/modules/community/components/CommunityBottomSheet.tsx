import { Text as AppText } from '../../../shared/components/Typography';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  View,
  type GestureResponderHandlers,
  type ListRenderItem,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import AddPlusIcon from '../../../../assets/v2/icons/community/add-plus.svg';
import * as GlassStyles from '../../place/map/sheet';
import { MapSheetBottomNavigation } from '../../place/map/sheet';
import type { BottomSheetSnapPoint } from '../../place/map/sheet';
import ApiErrorState from '../../../shared/components/ApiErrorState';
import { useSharedPulse } from '../../../shared/hooks/useSharedPulse';
import { useCategories, useInfinitePostsByCategory } from '../hooks/useCommunity';
import type { CommunityPostSummary } from '../api/communityApi';
import type { AnchoredMenuPosition } from './AnchoredMenu';
import PostCard from './PostCard';
import PostOverflowMenu from './PostOverflowMenu';

const SHEET_RESTING_GAP = 8;
const PAGE_LIMIT = 20;
const SKELETON_KEYS = ['skeleton-0', 'skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4'] as const;

// Each skeleton owns its own pulse subscription, scoped to its own (brief)
// mounted lifetime, rather than the whole sheet subscribing to the shared
// animation loop for as long as it's open.
function CategorySkeleton() {
  const pulse = useSharedPulse();
  return (
    <CategorySkeletonRow testID="v2-community-categories-loading">
      <Animated.View style={{ flexDirection: 'row', gap: 8, opacity: pulse }}>
        <CategorySkeletonChip />
        <CategorySkeletonChip />
        <CategorySkeletonChip />
      </Animated.View>
    </CategorySkeletonRow>
  );
}

function PostListSkeleton() {
  const pulse = useSharedPulse();
  return (
    <SkeletonList testID="v2-community-list-loading">
      {SKELETON_KEYS.map((key) => (
        <Animated.View key={key} style={{ opacity: pulse }}>
          <SkeletonRow />
        </Animated.View>
      ))}
    </SkeletonList>
  );
}

// The sheet unmounts when the map switches to another tab (see MapScreen), so
// FlatList's own scroll state doesn't survive a round trip. Keeping the last
// offset per category outside the component lets re-entry restore it instead
// of snapping back to the top.
const scrollOffsetByCategory: Record<string, number> = {};

export type CommunityBottomSheetProps = {
  collapsedTranslateY: number;
  height: number;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenMap: () => void;
  onOpenPost: (postId: number) => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  onOpenWrite: (categoryId?: string) => void;
  panHandlers: GestureResponderHandlers;
  sheetChromeBottom: Animated.Value;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

export default function CommunityBottomSheet({
  collapsedTranslateY,
  height,
  mediumTranslateY,
  onHandlePress,
  onOpenMap,
  onOpenPost,
  onOpenRecommendations,
  onOpenReservations,
  onOpenWrite,
  panHandlers,
  sheetChromeBottom,
  sheetTranslateY,
  snapPoint,
}: CommunityBottomSheetProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { colors, liquidGlass: themedGlass } = theme;
  const [manualCategoryId, setManualCategoryId] = useState<string | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<number[]>([]);
  const [overflowMenu, setOverflowMenu] = useState<{ position: AnchoredMenuPosition; postId: number } | null>(null);

  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.categories ?? [];
  // Derived synchronously from the loaded categories instead of an effect that
  // sets state after the fact — the category list is picked as soon as it's
  // available, with no extra render hop for the post query to wait through.
  const selectedCategoryId = manualCategoryId ?? categories[0]?.categoryId ?? null;

  const postsQuery = useInfinitePostsByCategory(
    selectedCategoryId ?? '',
    { limit: PAGE_LIMIT },
    { enabled: Boolean(selectedCategoryId) },
  );
  const posts = useMemo(
    () => (postsQuery.data?.pages ?? [])
      .flatMap((page) => page.posts ?? [])
      .filter((post): post is CommunityPostSummary & { postId: number } => (
        post.postId !== undefined && !hiddenPostIds.includes(post.postId)
      )),
    [hiddenPostIds, postsQuery.data],
  );

  const loadNextPage = () => {
    if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage && !postsQuery.isFetchNextPageError) {
      void postsQuery.fetchNextPage();
    }
  };

  const fadeStart = mediumTranslateY + ((collapsedTranslateY - mediumTranslateY) * 0.42);
  const opacity = sheetTranslateY.interpolate({
    extrapolate: 'clamp',
    inputRange: [mediumTranslateY, fadeStart, collapsedTranslateY],
    outputRange: [1, 0.78, 0],
  });
  const chromeGapRange = [0, Math.max(mediumTranslateY, 1)];
  const chromeGap = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, SHEET_RESTING_GAP],
  });
  const chromeBottomInset = Animated.add(sheetChromeBottom, chromeGap);
  const chromeBottomRadius = sheetChromeBottom.interpolate({
    extrapolate: 'clamp',
    inputRange: chromeGapRange,
    outputRange: [0, themedGlass.sheet.bottomRadius],
  });

  const renderPost: ListRenderItem<CommunityPostSummary & { postId: number }> = ({ item }) => (
    <PostCard
      onOpenOverflow={(event) => setOverflowMenu({
        position: { right: 16, top: event.nativeEvent.pageY + 8 },
        postId: item.postId,
      })}
      onPress={() => onOpenPost(item.postId)}
      post={item}
    />
  );

  const renderFooter = () => {
    if (postsQuery.isFetchingNextPage) {
      return (
        <FooterState>
          <ActivityIndicator color={colors.primary} />
        </FooterState>
      );
    }
    if (postsQuery.isFetchNextPageError) {
      return (
        <FooterState>
          <FooterErrorText>{t('community.list.nextPageError')}</FooterErrorText>
          <RetryButton
            accessibilityLabel={t('community.list.nextPageRetry')}
            accessibilityRole="button"
            onPress={() => void postsQuery.fetchNextPage()}
          >
            <RetryLabel>{t('community.list.nextPageRetry')}</RetryLabel>
          </RetryButton>
        </FooterState>
      );
    }
    return null;
  };

  return (
    <GlassStyles.BottomSheetContainer style={{ height, transform: [{ translateY: sheetTranslateY }] }}>
      <GlassStyles.SheetChromeShadow
        pointerEvents="none"
        style={{ boxShadow: themedGlass.sheet.shadow, bottom: chromeBottomInset, left: chromeGap, right: chromeGap }}
      >
        <GlassStyles.SheetChrome
          $borderColor={themedGlass.sheet.rim}
          style={{ borderBottomLeftRadius: chromeBottomRadius, borderBottomRightRadius: chromeBottomRadius }}
        >
          <GlassStyles.SheetGlass
            cornerRadius={themedGlass.sheet.topRadius}
            glassEffectStyle="regular"
            highlightHeight={40}
            highlightOpacity={themedGlass.sheet.highlightOpacity}
            rimColor={themedGlass.sheet.rim}
            tintColor={themedGlass.sheet.tint}
            topRimOnly
          />
        </GlassStyles.SheetChrome>
      </GlassStyles.SheetChromeShadow>

      <GlassStyles.SheetInner $clipContent $inset={SHEET_RESTING_GAP}>
        <HandleArea {...panHandlers}>
          <HandleButton accessibilityLabel={t('community.sheetAdjust')} accessibilityRole="adjustable" onPress={onHandlePress}>
            <Handle />
          </HandleButton>
        </HandleArea>

        <Animated.View pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'} style={{ flex: 1, opacity }}>
          <TitleRow>
            <Title accessibilityRole="header">{t('community.title')}</Title>
          </TitleRow>

          {categoriesQuery.isLoading ? (
            <CategorySkeleton />
          ) : categoriesQuery.isError ? (
            <CategoriesErrorRow testID="v2-community-categories-error">
              <ApiErrorState error={categoriesQuery.error} onRetry={() => void categoriesQuery.refetch()} />
            </CategoriesErrorRow>
          ) : (
            <CategoryScroll contentContainerStyle={CATEGORY_CONTENT_STYLE} horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => {
                const selected = category.categoryId === selectedCategoryId;
                return (
                  <CategoryChip
                    $selected={selected}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    key={category.categoryId}
                    onPress={() => {
                      if (category.categoryId) setManualCategoryId(category.categoryId);
                    }}
                    testID={`v2-community-sheet-category-${category.categoryId}`}
                  >
                    <CategoryLabel $selected={selected}>{category.categoryName}</CategoryLabel>
                  </CategoryChip>
                );
              })}
            </CategoryScroll>
          )}

          <ListViewport style={snapPoint === 'medium' ? MEDIUM_VIEWPORT_STYLE : undefined}>
            {postsQuery.isLoading ? (
              <PostListSkeleton />
            ) : postsQuery.isError ? (
              <ErrorViewport testID="v2-community-list-error">
                <ApiErrorState error={postsQuery.error} onRetry={() => void postsQuery.refetch()} />
              </ErrorViewport>
            ) : (
              <FlatList
                contentContainerStyle={LIST_CONTENT_STYLE}
                contentOffset={{ x: 0, y: selectedCategoryId ? scrollOffsetByCategory[selectedCategoryId] ?? 0 : 0 }}
                data={posts}
                key={selectedCategoryId}
                keyExtractor={(post) => String(post.postId)}
                ListEmptyComponent={<EmptyText testID="v2-community-list-empty">{t('community.empty')}</EmptyText>}
                ListFooterComponent={renderFooter()}
                nestedScrollEnabled
                onEndReached={loadNextPage}
                onEndReachedThreshold={0.5}
                onScroll={(event) => {
                  if (selectedCategoryId) {
                    scrollOffsetByCategory[selectedCategoryId] = event.nativeEvent.contentOffset.y;
                  }
                }}
                renderItem={renderPost}
                scrollEventThrottle={32}
                showsVerticalScrollIndicator={false}
                testID="v2-community-post-list"
              />
            )}
          </ListViewport>
        </Animated.View>
      </GlassStyles.SheetInner>

      <WriteFab
        accessibilityLabel={t('community.write')}
        accessibilityRole="button"
        onPress={() => onOpenWrite(selectedCategoryId ?? undefined)}
        testID="v2-community-sheet-write-fab"
      >
        <AddPlusIcon height={24} width={24} />
        <WriteFabLabel>{t('community.write')}</WriteFabLabel>
      </WriteFab>

      <MapSheetBottomNavigation
        activeTab="community"
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        onOpenReservations={onOpenReservations}
        sheetTranslateY={sheetTranslateY}
      />

      <PostOverflowMenu
        onClose={() => setOverflowMenu(null)}
        onNotInterested={() => {
          if (overflowMenu) setHiddenPostIds((current) => [...current, overflowMenu.postId]);
        }}
        onReport={() => {}}
        position={overflowMenu?.position ?? { top: 0 }}
        visible={overflowMenu !== null}
      />
    </GlassStyles.BottomSheetContainer>
  );
}

const CATEGORY_CONTENT_STYLE = { gap: 8, paddingHorizontal: 16, paddingVertical: 10 } as const;
const LIST_CONTENT_STYLE = { paddingBottom: 116, paddingHorizontal: 16 } as const;
const MEDIUM_VIEWPORT_STYLE = { flex: 0, height: 182 } as const;

const HandleArea = styled(View)`align-items: center; height: 36px; justify-content: center;`;
const HandleButton = styled(Pressable)`align-items: center; height: 36px; justify-content: center; width: 96px;`;
const Handle = styled.View`background-color: ${({ theme }) => theme.colors.borderEmphasis}; border-radius: 3px; height: 5px; width: 56px;`;

const TitleRow = styled.View`flex-direction: row; align-items: center; justify-content: space-between; padding: 0 16px;`;
const Title = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 20px; font-weight: 700;`;

const CategoryScroll = styled.ScrollView`flex-grow: 0; height: 58px;`;
const CategoryChip = styled.Pressable<{ $selected: boolean }>`
  padding: 8px 12px;
  border-width: 1px;
  border-color: ${({ $selected, theme }) => ($selected ? theme.colors.primaryPressed : 'transparent')};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.primaryRange : 'rgba(255, 255, 255, 0.36)')};
`;
const CategoryLabel = styled(AppText)<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.textAlternative)};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: 500;
`;

const CategorySkeletonRow = styled.View`height: 58px; justify-content: center; padding: 0 16px;`;
const CategorySkeletonChip = styled.View`width: 64px; height: 36px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.border};`;
const CategoriesErrorRow = styled.View`min-height: 58px; justify-content: center;`;

const ListViewport = styled.View`flex: 1; margin-bottom: 92px; overflow: hidden;`;
const ErrorViewport = styled.View`flex: 1; justify-content: center;`;
const EmptyText = styled(AppText)`margin-top: ${({ theme }) => theme.spacing.xl}px; text-align: center; color: ${({ theme }) => theme.colors.textMuted};`;

const SkeletonList = styled.View`gap: 14px; padding: ${({ theme }) => theme.spacing.md}px 16px;`;
const SkeletonRow = styled.View`height: 26px; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.border};`;

const FooterState = styled.View`align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px;`;
const FooterErrorText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const RetryButton = styled.Pressable`background-color: ${({ theme }) => theme.colors.primary}; border-radius: ${({ theme }) => theme.radius.full}px; padding: 9px 18px;`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;

const WriteFab = styled.Pressable`
  position: absolute;
  right: 16px;
  bottom: 108px;
  height: 48px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 0 18px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
  shadow-color: ${({ theme }) => theme.colors.shadow};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.16;
  shadow-radius: 20px;
  elevation: 4;
`;
const WriteFabLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.label.fontSize}px; font-weight: 600;`;
