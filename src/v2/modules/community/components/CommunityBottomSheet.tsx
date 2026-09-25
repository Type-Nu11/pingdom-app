import { Text as AppText } from '../../../shared/components/Typography';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, View, type GestureResponderHandlers } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import AddPlusIcon from '../../../../assets/v2/icons/community/add-plus.svg';
import FilterButtonIcon from '../../../../assets/v2/icons/community/filter-button.svg';
import * as GlassStyles from '../../place/map/sheet';
import { MapSheetBottomNavigation } from '../../place/map/sheet';
import type { BottomSheetSnapPoint } from '../../place/map/sheet';
import type { AnchoredMenuPosition } from './AnchoredMenu';
import PostCard from './PostCard';
import PostOverflowMenu from './PostOverflowMenu';
import RegionFilterMenu from './RegionFilterMenu';
import { COMMUNITY_POST_SUMMARIES } from '../model/fixtures';
import type { CommunityCategory, CommunityPostSummary, CommunityRegion } from '../model/types';

const SHEET_RESTING_GAP = 8;
const CATEGORIES: CommunityCategory[] = ['all', 'spot', 'diary', 'ledger'];

function matchesCategory(post: CommunityPostSummary, category: CommunityCategory) {
  return category === 'all' || post.tags.includes(category);
}

export type CommunityBottomSheetProps = {
  collapsedTranslateY: number;
  height: number;
  mediumTranslateY: number;
  onHandlePress: () => void;
  onOpenMap: () => void;
  onOpenPost: (postId: number) => void;
  onOpenRecommendations?: () => void;
  onOpenReservations?: () => void;
  onOpenWrite: () => void;
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
  const [category, setCategory] = useState<CommunityCategory>('all');
  const [region, setRegion] = useState<CommunityRegion>('kr');
  const [hiddenPostIds, setHiddenPostIds] = useState<number[]>([]);
  const [filterMenu, setFilterMenu] = useState<AnchoredMenuPosition | null>(null);
  const [overflowMenu, setOverflowMenu] = useState<{ position: AnchoredMenuPosition; postId: number } | null>(null);
  const filterButtonRef = useRef<View>(null);

  const posts = useMemo(
    () => COMMUNITY_POST_SUMMARIES.filter((post) => (
      post.region === region
      && matchesCategory(post, category)
      && !hiddenPostIds.includes(post.id)
    )),
    [category, hiddenPostIds, region],
  );

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

  const openFilterMenu = () => {
    filterButtonRef.current?.measureInWindow((x, y, width, buttonHeight) => {
      setFilterMenu({ right: 16, top: y + buttonHeight + 4 });
    });
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
          <HandleButton accessibilityLabel={t('community.filter')} accessibilityRole="adjustable" onPress={onHandlePress}>
            <Handle />
          </HandleButton>
        </HandleArea>

        <Animated.View pointerEvents={snapPoint === 'collapsed' ? 'none' : 'auto'} style={{ flex: 1, opacity }}>
          <TitleRow>
            <Title accessibilityRole="header">{t('community.title')}</Title>
            <FilterButton
              accessibilityLabel={t('community.filter')}
              accessibilityRole="button"
              onPress={openFilterMenu}
              ref={filterButtonRef}
              testID="v2-community-sheet-filter-button"
            >
              <FilterButtonIcon height={44} width={44} />
            </FilterButton>
          </TitleRow>

          <CategoryScroll contentContainerStyle={CATEGORY_CONTENT_STYLE} horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((item) => {
              const selected = item === category;
              return (
                <CategoryChip
                  $selected={selected}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  key={item}
                  onPress={() => setCategory(item)}
                  testID={`v2-community-sheet-category-${item}`}
                >
                  <CategoryLabel $selected={selected}>{t(`community.categories.${item}`)}</CategoryLabel>
                </CategoryChip>
              );
            })}
          </CategoryScroll>

          <ListViewport style={snapPoint === 'medium' ? MEDIUM_VIEWPORT_STYLE : undefined}>
            <ScrollView contentContainerStyle={LIST_CONTENT_STYLE} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {posts.length > 0 ? posts.map((post) => (
                <PostCard
                  key={post.id}
                  onOpenOverflow={(event) => setOverflowMenu({
                    position: { right: 16, top: event.nativeEvent.pageY + 8 },
                    postId: post.id,
                  })}
                  onPress={() => onOpenPost(post.id)}
                  post={post}
                />
              )) : (
                <EmptyText>{t('community.empty')}</EmptyText>
              )}
            </ScrollView>
          </ListViewport>
        </Animated.View>
      </GlassStyles.SheetInner>

      <WriteFab
        accessibilityLabel={t('community.write')}
        accessibilityRole="button"
        onPress={onOpenWrite}
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

      <RegionFilterMenu
        onClose={() => setFilterMenu(null)}
        onSelect={setRegion}
        position={filterMenu ?? { top: 0 }}
        selectedRegion={region}
        visible={filterMenu !== null}
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
const FilterButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;

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

const ListViewport = styled.View`flex: 1; margin-bottom: 92px; overflow: hidden;`;
const EmptyText = styled(AppText)`margin-top: ${({ theme }) => theme.spacing.xl}px; text-align: center; color: ${({ theme }) => theme.colors.textMuted};`;

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
