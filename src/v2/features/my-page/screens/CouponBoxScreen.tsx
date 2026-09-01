import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import { useInfiniteCoupons, type Coupon } from '../../offers-coupons';
import { ErrorState } from '../../../shared/components';
import Button from '../../../shared/components/Button';
import CouponCard from '../components/CouponCard';
import CouponCardSkeleton from '../components/CouponCardSkeleton';
import {
  COUPON_STATUS_FILTERS,
  formatOfferPeriod,
  isCouponUsable,
  toCouponBoxEntries,
  toCouponBoxListState,
  type CouponBoxEntry,
  type CouponStatusFilter,
} from '../model/couponBoxEntries';
import BackIcon from '../../../shared/assets/icons/back.svg';
// Imported as a value (not via `useTheme`) because the filter row's content
// style is a module-level constant, outside the styled-components context.
import { theme as appTheme } from '../../../shared/theme';

export type CouponBoxScreenProps = {
  onBack: () => void;
  onOpenCoupon?: (coupon: Coupon) => void;
};

const PAGE_LIMIT = 20;
const SKELETON_KEYS = ['skeleton-0', 'skeleton-1', 'skeleton-2', 'skeleton-3'] as const;

export default function CouponBoxScreen({
  onBack,
  onOpenCoupon,
}: CouponBoxScreenProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const [statusFilter, setStatusFilter] = useState<CouponStatusFilter>('ALL');
  // `status` is a server filter (ISSUED | REDEEMED | EXPIRED); `ALL` omits it so
  // the query key and request stay identical to the unfiltered box.
  const couponsQuery = useInfiniteCoupons(
    statusFilter === 'ALL'
      ? { limit: PAGE_LIMIT }
      : { limit: PAGE_LIMIT, status: statusFilter },
  );

  const coupons = useMemo<Coupon[]>(
    () => (couponsQuery.data?.pages ?? []).flatMap((page) => page.coupons),
    [couponsQuery.data],
  );
  const couponsById = useMemo(
    () => new Map(coupons.map((coupon) => [coupon.id, coupon])),
    [coupons],
  );

  const entries = toCouponBoxEntries(coupons, {
    description: t('myPage.couponBox.fallbackDescription'),
    title: t('myPage.couponBox.fallbackTitle'),
  });

  const hasLoadedCoupons = coupons.length > 0;
  const listState = toCouponBoxListState(couponsQuery.isError && !hasLoadedCoupons, entries);

  const loadNextPage = useCallback(() => {
    // A failed page keeps `hasNextPage` true, so auto-loading again would re-fire
    // the same failing request every time the user reaches the end. The footer
    // offers an explicit retry instead.
    if (
      couponsQuery.hasNextPage
      && !couponsQuery.isFetchingNextPage
      && !couponsQuery.isFetchNextPageError
    ) {
      void couponsQuery.fetchNextPage();
    }
  }, [couponsQuery]);

  const retry = () => {
    void couponsQuery.refetch();
  };

  const renderCoupon = ({ item }: { item: CouponBoxEntry }) => {
    const period = formatOfferPeriod(item.issuedAt, item.expiresAt, locale, { compact: true });
    // A used or expired coupon has to say so in text, not only by the dimmed
    // badge, so the list is readable without relying on colour alone.
    const status = item.status;
    const stateLabel = isCouponUsable(status)
      ? undefined
      : t(`myPage.couponBox.statusLabel.${status}`);

    return (
      <CouponCard
        description={item.description}
        muted={stateLabel !== undefined}
        onPress={onOpenCoupon
          ? () => {
            const coupon = couponsById.get(item.couponId);
            if (coupon) {
              onOpenCoupon(coupon);
            }
          }
          : undefined}
        periodText={stateLabel ? `${period} · ${stateLabel}` : period}
        placeName={item.placeName}
        title={item.title}
      />
    );
  };

  const renderFooter = () => {
    if (couponsQuery.isFetchingNextPage) {
      return (
        <Footer>
          <ActivityIndicator color={theme.colors.primary} />
        </Footer>
      );
    }
    if (couponsQuery.isFetchNextPageError) {
      return (
        <Footer>
          <FooterErrorText>{t('myPage.couponBox.nextPageError')}</FooterErrorText>
          <Button
            label={t('myPage.couponBox.nextPageRetry')}
            onPress={() => void couponsQuery.fetchNextPage()}
            size="medium"
            variant="secondary"
          />
        </Footer>
      );
    }
    return null;
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-coupon-box-screen">
      <TopBar>
        <IconButton
          accessibilityLabel={t('myPage.back')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
        >
          <BackIcon height={44} width={44} />
        </IconButton>
        <TopBarTitle>{t('myPage.couponBox.title')}</TopBarTitle>
        <Spacer />
      </TopBar>

      {/* Horizontal scroll keeps every chip reachable when a translation is long
          or the display is narrow, instead of clipping the last one. */}
      <FilterRow
        contentContainerStyle={FILTER_ROW_CONTENT_STYLE}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {COUPON_STATUS_FILTERS.map((value) => {
          const selected = value === statusFilter;
          return (
            <FilterChip
              accessibilityLabel={t(`myPage.couponBox.filters.${value}`)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              hitSlop={8}
              key={value}
              onPress={() => setStatusFilter(value)}
              selected={selected}
              testID={`v2-coupon-box-filter-${value}`}
            >
              <FilterChipText selected={selected}>
                {t(`myPage.couponBox.filters.${value}`)}
              </FilterChipText>
            </FilterChip>
          );
        })}
      </FilterRow>

      {couponsQuery.isLoading ? (
        <SkeletonList>
          {SKELETON_KEYS.map((key) => <CouponCardSkeleton key={key} />)}
        </SkeletonList>
      ) : listState.kind === 'error' ? (
        <ErrorState
          actionLabel={t('myPage.retry')}
          description={t('myPage.couponBox.error')}
          fill
          onAction={retry}
        />
      ) : (
        <FlatList
          contentContainerStyle={CONTENT_CONTAINER_STYLE}
          data={listState.kind === 'ready' ? listState.entries : EMPTY_LIST}
          keyExtractor={(entry) => String(entry.couponId)}
          testID="v2-coupon-box-list"
          ListEmptyComponent={(
            <EmptyText>
              {t(statusFilter === 'ALL'
                ? 'myPage.couponBox.empty'
                : 'myPage.couponBox.emptyFiltered')}
            </EmptyText>
          )}
          ListFooterComponent={renderFooter()}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          refreshControl={(
            <RefreshControl
              onRefresh={() => void couponsQuery.refetch()}
              refreshing={couponsQuery.isRefetching && !couponsQuery.isFetchingNextPage}
              tintColor={theme.colors.primary}
            />
          )}
          renderItem={renderCoupon}
        />
      )}
    </Screen>
  );
}

const EMPTY_LIST: CouponBoxEntry[] = [];

const CONTENT_CONTAINER_STYLE = { flexGrow: 1, gap: 14, padding: 24 } as const;

const FILTER_ROW_CONTENT_STYLE = {
  gap: appTheme.spacing.sm,
  paddingHorizontal: appTheme.spacing.lg,
  paddingVertical: appTheme.spacing.sm,
} as const;

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
  font-size: 18px;
  font-weight: 500;
`;

const FilterRow = styled.ScrollView`
  flex-grow: 0;
`;

// `surface` equals `background`, so an unselected chip is read from its outline;
// `surfaceMuted` gives it a fill the eye can catch before the border.
const FilterChip = styled.Pressable<{ selected: boolean }>`
  min-height: 36px;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  border-width: 1px;
  border-color: ${({ selected, theme }) => (
    selected ? theme.colors.primary : theme.colors.border
  )};
  background-color: ${({ selected, theme }) => (
    selected ? theme.colors.primarySoft : theme.colors.surfaceMuted
  )};
`;

const FilterChipText = styled.Text<{ selected: boolean }>`
  color: ${({ selected, theme }) => (
    selected ? theme.colors.primary : theme.colors.textMuted
  )};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ selected }) => (selected ? 600 : 400)};
`;

const SkeletonList = styled.View`
  gap: 14px;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

const Footer = styled.View`
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const FooterErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  text-align: center;
`;

const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.xl}px;
`;
