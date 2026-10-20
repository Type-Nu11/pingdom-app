import Skeleton from '../../../shared/components/Skeleton';
import { Text as AppText } from '../../../shared/components/Typography';
import React, { useMemo, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import AddPlusIcon from '../../../../assets/v2/icons/community/add-plus.svg';
import SliderIcon from '../../../../assets/v2/icons/community/slider.svg';
import * as GlassStyles from '../../place/map/sheet';
import { getMapSheetNavigationBottom, MapSheetBottomNavigation } from '../../place/map/sheet';
import { GlassSurface } from '../../place/map/presentation';
import type { BottomSheetSnapPoint } from '../../place/map/sheet';
import ApiErrorState from '../../../shared/components/ApiErrorState';
import { textStyleCss } from '../../../shared/theme/typography';
import { useCategories, useCommunityFeed, useCountries } from '../hooks/useCommunity';
import type { CommunityPostSummary } from '../api/communityApi';
import type { AnchoredMenuPosition } from './AnchoredMenu';
import CountryFilterMenu from './CountryFilterMenu';
import PostCard from './PostCard';
import PostOverflowMenu from './PostOverflowMenu';

// Figma `FAB/Write` sits 12px above the 64px bottom navigation bar.
const NAVIGATION_BAR_HEIGHT = 64;
const WRITE_FAB_NAVIGATION_GAP = 12;
const PAGE_LIMIT = 20;
function CategorySkeleton() {
  return <Skeleton variant="chips" style={{ paddingHorizontal: 16 }} testID="v2-community-categories-loading" />;
}

function PostListSkeleton() {
  return <Skeleton variant="post-list" style={{ padding: 16 }} testID="v2-community-list-loading" />;
}

// The sheet unmounts when the map switches to another tab (see MapScreen), so
// FlatList's own scroll state doesn't survive a round trip. Keeping the last
// offset per feed (category tab + country filter) outside the component lets
// re-entry restore it instead of snapping back to the top.
const scrollOffsetByFeed: Record<string, number> = {};
// Figma: the country menu's right edge lines up with the button, 8px below it.
const FILTER_MENU_GAP = 8;

export type CommunityBottomSheetProps = {
  collapsedTranslateY: number;
  /** Snap offset of the raised sheet; the chrome reaches full width there (Figma *-Up frames). */
  expandedTranslateY?: number;
  height: number;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenMap: () => void;
  onOpenFavorites?: () => void;
  onOpenPost: (postId: number) => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  onOpenWrite: (categoryId?: string) => void;
  panHandlers: GestureResponderHandlers;
  sheetChromeBottom: Animated.Value;
  parentOwnsMotion?: boolean;
  sheetTranslateY: Animated.Value;
  snapPoint: BottomSheetSnapPoint;
};

export default function CommunityBottomSheet({
  collapsedTranslateY,
  expandedTranslateY = 0,
  height,
  mediumTranslateY,
  onHandlePress,
  onOpenMap,
  onOpenFavorites,
  onOpenPost,
  onOpenRecommendations,
  onOpenReservations,
  onOpenWrite,
  panHandlers,
  sheetChromeBottom,
  parentOwnsMotion = false,
  sheetTranslateY,
  snapPoint,
}: CommunityBottomSheetProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { colors, liquidGlass: themedGlass } = theme;
  // `null` is the Figma "전체" tab — every category.
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [countryMenu, setCountryMenu] = useState<AnchoredMenuPosition | null>(null);
  const filterButtonRef = useRef<View>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<number[]>([]);
  const [overflowMenu, setOverflowMenu] = useState<{ position: AnchoredMenuPosition; postId: number } | null>(null);

  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.categories ?? [];
  const countriesQuery = useCountries();
  const feedKey = `${selectedCategoryId ?? ''}|${selectedCountryCode ?? ''}`;

  // Both filters are real query parameters and part of the query key, so
  // switching either one restarts the feed at page 1.
  const postsQuery = useCommunityFeed({
    categoryId: selectedCategoryId,
    countryCode: selectedCountryCode ?? undefined,
    limit: PAGE_LIMIT,
  });
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

  // Each item carries its own category; the selected category only backs the
  // tag for an item the server returned without one.
  const now = new Date();
  const selectedCategoryName = categories.find((category) => category.categoryId === selectedCategoryId)?.categoryName;
  // Half-sheet chips float as glass (Shadow/Float); the expanded page uses flat chips.
  const isExpanded = snapPoint === 'expanded';
  const chipShadowStyle = isExpanded ? undefined : { boxShadow: themedGlass.category.shadow };

  const openCountryMenu = () => {
    const fallbackTop = insets.top + 160;
    setCountryMenu({ right: 16, top: fallbackTop });
    filterButtonRef.current?.measureInWindow?.((_x, y, _width, measuredHeight) => {
      if (Number.isFinite(y) && measuredHeight > 0) {
        setCountryMenu({ right: 16, top: y + measuredHeight + FILTER_MENU_GAP });
      }
    });
  };

  const renderPost: ListRenderItem<CommunityPostSummary & { postId: number }> = ({ item }) => (
    <PostCard
      categoryName={selectedCategoryName}
      now={now}
      onOpenOverflow={(anchor) => setOverflowMenu({
        // Figma: the menu's right edge lines up with the card, 8px below the icon.
        position: { right: 16, top: anchor.bottom + 8 },
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
    <GlassStyles.BottomSheetContainer style={{ height, transform: parentOwnsMotion ? undefined : [{ translateY: sheetTranslateY }] }}>
      <GlassStyles.MapSheetSurface sheetChromeBottom={sheetChromeBottom} expandedTranslateY={expandedTranslateY} mediumTranslateY={mediumTranslateY} contentInset={8} innerTestID="v2-community-sheet-inner" testID="community-sheet">
        <HandleArea {...panHandlers}>
          <HandleButton accessibilityLabel={t('community.sheetAdjust')} accessibilityRole="adjustable" onPress={onHandlePress}>
            <Handle />
          </HandleButton>
        </HandleArea>

        <Animated.View
          pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'}
          style={{ flex: 1, opacity }}
        >
          {/* The title row and chips are a drag area too; taps and horizontal chip swipes still work. */}
          <View {...panHandlers} testID="v2-community-sheet-header">
          <TitleRow>
            <Title accessibilityRole="header">{t('community.title')}</Title>
            <FilterButton
              accessibilityLabel={t('community.filter.open')}
              accessibilityRole="button"
              accessibilityState={{ expanded: countryMenu !== null, selected: selectedCountryCode !== null }}
              onPress={openCountryMenu}
              ref={filterButtonRef}
              style={{ boxShadow: themedGlass.navigation.shadow }}
              testID="v2-community-sheet-filter"
            >
              <SliderIcon color={colors.textAlternative} height={24} width={24} />
            </FilterButton>
          </TitleRow>

          {categoriesQuery.isLoading ? (
            <CategorySkeleton />
          ) : categoriesQuery.isError ? null : (
            <CategoryScroll contentContainerStyle={CATEGORY_CONTENT_STYLE} horizontal showsHorizontalScrollIndicator={false}>
              <CategoryChip
                $expanded={isExpanded}
                $selected={selectedCategoryId === null}
                accessibilityRole="tab"
                accessibilityState={{ selected: selectedCategoryId === null }}
                onPress={() => setSelectedCategoryId(null)}
                style={chipShadowStyle}
                testID="v2-community-sheet-category-all"
              >
                <CategoryLabel $selected={selectedCategoryId === null}>{t('community.categories.all')}</CategoryLabel>
              </CategoryChip>
              {categories.map((category) => {
                const selected = category.categoryId === selectedCategoryId;
                return (
                  <CategoryChip
                    $expanded={isExpanded}
                    $selected={selected}
                    accessibilityRole="tab"
                    style={chipShadowStyle}
                    accessibilityState={{ selected }}
                    key={category.categoryId}
                    onPress={() => {
                      if (category.categoryId) setSelectedCategoryId(category.categoryId);
                    }}
                    testID={`v2-community-sheet-category-${category.categoryId}`}
                  >
                    <CategoryLabel $selected={selected}>{category.categoryName}</CategoryLabel>
                  </CategoryChip>
                );
              })}
            </CategoryScroll>
          )}

          </View>

          <ListViewport style={snapPoint === 'medium' ? MEDIUM_VIEWPORT_STYLE : undefined}>
            {categoriesQuery.isError ? (
              // The full error block doesn't fit the 34px chip row, and with no
              // category there is no list to call empty — it takes the list area.
              <ErrorViewport testID="v2-community-categories-error">
                <ApiErrorState error={categoriesQuery.error} onRetry={() => void categoriesQuery.refetch()} />
              </ErrorViewport>
            ) : postsQuery.isLoading ? (
              <PostListSkeleton />
            ) : postsQuery.isError ? (
              <ErrorViewport testID="v2-community-list-error">
                <ApiErrorState error={postsQuery.error} onRetry={() => void postsQuery.refetch()} />
              </ErrorViewport>
            ) : (
              <FlatList
                contentContainerStyle={LIST_CONTENT_STYLE}
                contentOffset={{ x: 0, y: scrollOffsetByFeed[feedKey] ?? 0 }}
                data={posts}
                key={feedKey}
                keyExtractor={(post) => String(post.postId)}
                ListEmptyComponent={<EmptyText testID="v2-community-list-empty">{t('community.empty')}</EmptyText>}
                ListFooterComponent={renderFooter()}
                nestedScrollEnabled
                onEndReached={loadNextPage}
                onEndReachedThreshold={0.5}
                onScroll={(event) => {
                  scrollOffsetByFeed[feedKey] = event.nativeEvent.contentOffset.y;
                }}
                renderItem={renderPost}
                scrollEventThrottle={32}
                showsVerticalScrollIndicator={false}
                testID="v2-community-post-list"
              />
            )}
          </ListViewport>
        </Animated.View>
      </GlassStyles.MapSheetSurface>

      {snapPoint === 'expanded' ? (
        // Pinned to the screen like MapSheetBottomNavigation: the sheet
        // container is translated, so the FAB cancels that translation.
        <WriteFabAnchor
          style={{
            bottom: getMapSheetNavigationBottom(insets.bottom) + NAVIGATION_BAR_HEIGHT + WRITE_FAB_NAVIGATION_GAP,
            transform: [{ translateY: Animated.multiply(sheetTranslateY, -1) }],
          }}
        >
          <WriteFab
            accessibilityLabel={t('community.write')}
            accessibilityRole="button"
            onPress={() => onOpenWrite(selectedCategoryId ?? undefined)}
            style={{ boxShadow: themedGlass.primaryCta.shadow }}
            testID="v2-community-sheet-write-fab"
          >
            <WriteFabSurface pointerEvents="none" tintColor={theme.colors.primary}>
              <AddPlusIcon height={24} width={24} />
              <WriteFabLabel>{t('community.write')}</WriteFabLabel>
            </WriteFabSurface>
          </WriteFab>
        </WriteFabAnchor>
      ) : null}

      <MapSheetBottomNavigation
        activeTab="community"
        onOpenFavorites={onOpenFavorites}
        onOpenMap={onOpenMap}
        onOpenRecommendations={onOpenRecommendations}
        onOpenReservations={onOpenReservations}
        sheetTranslateY={sheetTranslateY}
      />

      <CountryFilterMenu
        countries={countriesQuery.data ?? []}
        isError={countriesQuery.isError}
        isLoading={countriesQuery.isLoading}
        onClose={() => setCountryMenu(null)}
        onRetry={() => void countriesQuery.refetch()}
        onSelect={setSelectedCountryCode}
        position={countryMenu ?? { top: 0 }}
        selectedCountryCode={selectedCountryCode}
        visible={countryMenu !== null}
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

const CATEGORY_CONTENT_STYLE = { gap: 8, paddingHorizontal: 16 } as const;
const LIST_CONTENT_STYLE = { paddingBottom: 116, paddingHorizontal: 16 } as const;
const MEDIUM_VIEWPORT_STYLE = { flex: 0, height: 182 } as const;

// Figma sheet header: 6px above a 5px grabber, 8px below it, then a 44px
// title row and a 34px category row.
const HandleArea = styled(View)`align-items: center; height: 19px;`;
const HandleButton = styled(Pressable)`align-items: center; height: 19px; padding-top: 6px; width: 160px;`;
const Handle = styled.View`background-color: ${({ theme }) => theme.colors.secondaryNormal}; border-radius: 3px; height: 5px; width: 56px;`;

const TitleRow = styled.View`height: 44px; flex-direction: row; align-items: center; justify-content: space-between; padding: 0 16px;`;
// Figma filter button (8241:45578): 44px `Glass/FillRaised` circle with the
// 24px `Interface / Slider_03` glyph and the shared 0/4/20 6% drop shadow.
const FilterButton = styled(Pressable)`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.colors.glassFillRaised};
`;
const Title = styled(AppText)`color: ${({ theme }) => theme.colors.labelStrong}; ${({ theme }) => textStyleCss(theme.typography.headline1Bold)}`;

// Figma Community (10250:35439/35556): the 44px title row sits right under the handle
// and the chip row follows it with no gap.
const CategoryScroll = styled.ScrollView`flex-grow: 0; height: 34px; overflow: visible;`;
// Figma Community (10250:35439) glass chips vs Community-Up (10250:35556) flat
// chips: Background/Normal with a 1px Fill/Neutral stroke when unselected.
const CategoryChip = styled.Pressable<{ $expanded: boolean; $selected: boolean }>`
  height: 34px;
  justify-content: center;
  padding: 0 11px;
  border-width: 1px;
  border-color: ${({ $expanded, $selected, theme }) => (
    $selected ? theme.liquidGlass.category.activeBorder : $expanded ? theme.colors.fillNeutral : theme.liquidGlass.category.border
  )};
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $expanded, $selected, theme }) => (
    $selected ? theme.liquidGlass.category.activeTint : $expanded ? theme.colors.background : theme.liquidGlass.category.tint
  )};
`;
const CategoryLabel = styled(AppText)<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.liquidGlass.category.activeForeground : theme.colors.textAlternative)};
  ${({ theme }) => textStyleCss(theme.typography.labelMedium)}
`;


// Figma lets the feed run underneath the glass bottom navigation; the list's
// bottom padding still lets the last card scroll clear of it.
const ListViewport = styled.View`flex: 1; overflow: hidden;`;
// Top-aligned: the viewport spans the full sheet height, so a centred error
// would sit below the visible part of the medium sheet.
const ErrorViewport = styled.View`flex: 1; justify-content: flex-start;`;
const EmptyText = styled(AppText)`margin-top: ${({ theme }) => theme.spacing.xl}px; text-align: center; color: ${({ theme }) => theme.colors.textMuted};`;


const FooterState = styled.View`align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px;`;
const FooterErrorText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; text-align: center;`;
const RetryButton = styled.Pressable`background-color: ${({ theme }) => theme.colors.primaryAction}; border-radius: ${({ theme }) => theme.radius.full}px; padding: 9px 18px;`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;

const WriteFabAnchor = styled(Animated.View)`position: absolute; right: 24px;`;
// Glass primary CTA over a solid `Primary/Normal` base: Figma's FAB renders
// fully saturated, while native glass alone washes the 56% tint out.
const WriteFab = styled.Pressable`
  height: 48px;
  border-radius: 24px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.primary};
`;
const WriteFabSurface = styled(GlassSurface)`
  height: 48px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 0 17px;
  border-radius: 24px;
`;
const WriteFabLabel = styled(AppText)`color: ${({ theme }) => theme.liquidGlass.primaryCta.foreground}; ${({ theme }) => textStyleCss(theme.typography.bodyMedium)}`;
