import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import {
  createOfferQueryOptions,
  useInfiniteCoupons,
  type Coupon,
  type Offer,
} from '../../offers-coupons';
import { ErrorState } from '../../../shared/components';
import Button from '../../../shared/components/Button';
import CouponCard from '../components/CouponCard';
import CouponCardSkeleton from '../components/CouponCardSkeleton';
import {
  COUPON_STATUS_FILTERS,
  formatCouponInstant,
  isCouponUsable,
  toCouponBoxEntries,
  toCouponBoxListState,
  type CouponBoxEntry,
  type CouponStatusFilter,
} from '../model/couponBoxEntries';
import BackIcon from '../../../shared/assets/icons/back.svg';

export type CouponBoxScreenProps = {
  onBack: () => void;
  onOpenCoupon?: (coupon: Coupon) => void;
  onUseCoupon?: (couponId: number) => void;
};

const PAGE_LIMIT = 20;
const SKELETON_KEYS = ['skeleton-0', 'skeleton-1', 'skeleton-2', 'skeleton-3'] as const;

function statusLabelKey(status: Coupon['status']): 'ISSUED' | 'REDEEMED' | 'EXPIRED' | 'UNKNOWN' {
  return status === 'ISSUED' || status === 'REDEEMED' || status === 'EXPIRED' ? status : 'UNKNOWN';
}

export default function CouponBoxScreen({
  onBack,
  onOpenCoupon,
  onUseCoupon,
}: CouponBoxScreenProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const [statusFilter, setStatusFilter] = useState<CouponStatusFilter>('ALL');

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

  const offerIds = useMemo(
    () => Array.from(new Set(coupons.map((coupon) => coupon.offerId))),
    [coupons],
  );
  const offerQueries = useQueries({
    queries: offerIds.map((offerId) => createOfferQueryOptions(offerId)),
  });
  const offersById = useMemo(() => {
    const map = new Map<number, Offer>();
    offerQueries.forEach((query, index) => {
      if (query.data) {
        map.set(offerIds[index], query.data);
      }
    });
    return map;
  }, [offerQueries, offerIds]);

  const entries = toCouponBoxEntries(coupons, offersById, {
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
    offerQueries.forEach((query) => void query.refetch());
  };

  const emptyText = statusFilter === 'ALL'
    ? t('myPage.couponBox.empty')
    : t(`myPage.couponBox.emptyByStatus.${statusFilter}`);

  const renderCoupon = ({ item }: { item: CouponBoxEntry }) => {
    const usable = isCouponUsable(item.status);
    const expiryLabel = item.status === 'EXPIRED'
      ? t('myPage.couponBox.expired')
      : t('myPage.couponBox.expiresAt', {
        date: formatCouponInstant(item.expiresAt, locale, { withTime: true }),
      });
    const redeemedLabel = item.status === 'REDEEMED'
      ? (item.redeemedAt
        ? t('myPage.couponBox.redeemedAt', {
          date: formatCouponInstant(item.redeemedAt, locale, { withTime: true }),
        })
        : t('myPage.couponBox.redeemedUnknown'))
      : undefined;

    return (
      <CouponCard
        description={item.description}
        expiryLabel={expiryLabel}
        issuedLabel={t('myPage.couponBox.issuedAt', {
          date: formatCouponInstant(item.issuedAt, locale),
        })}
        onPress={onOpenCoupon
          ? () => {
            const coupon = couponsById.get(item.couponId);
            if (coupon) {
              onOpenCoupon(coupon);
            }
          }
          : undefined}
        onUse={usable && onUseCoupon ? () => onUseCoupon(item.couponId) : undefined}
        redeemedLabel={redeemedLabel}
        status={item.status}
        statusLabel={t(`myPage.couponBox.status.${statusLabelKey(item.status)}`)}
        title={item.title}
        unusableLabel={t('myPage.couponBox.unusable')}
        usable={usable}
        useCtaLabel={t('myPage.couponBox.use')}
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

      <FilterBar
        accessibilityRole="tablist"
        contentContainerStyle={FILTER_BAR_CONTENT_STYLE}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {COUPON_STATUS_FILTERS.map((filter) => {
          const selected = filter === statusFilter;
          return (
            <FilterChip
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={filter}
              onPress={() => setStatusFilter(filter)}
              $selected={selected}
            >
              <FilterChipText $selected={selected}>
                {t(`myPage.couponBox.filters.${filter}`)}
              </FilterChipText>
            </FilterChip>
          );
        })}
      </FilterBar>

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
          ListEmptyComponent={<EmptyText>{emptyText}</EmptyText>}
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
const FILTER_BAR_CONTENT_STYLE = { gap: 8, paddingHorizontal: 24 } as const;

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
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: 500;
`;

const FilterBar = styled.ScrollView`
  flex-grow: 0;
  padding: ${({ theme }) => theme.spacing.sm}px 0 ${({ theme }) => theme.spacing.md}px;
`;

const FilterChip = styled.Pressable<{ $selected: boolean }>`
  padding: 6px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $selected, theme }) => (
    $selected ? theme.colors.primary : theme.colors.inputBackground
  )};
`;

const FilterChipText = styled.Text<{ $selected: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $selected, theme }) => (
    $selected ? theme.colors.onPrimary : theme.colors.textMuted
  )};
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
