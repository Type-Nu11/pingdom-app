import React, { useCallback, useMemo } from 'react';
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
  formatOfferPeriod,
  isCouponUsable,
  toCouponBoxEntries,
  toCouponBoxListState,
  type CouponBoxEntry,
} from '../model/couponBoxEntries';
import BackIcon from '../../../shared/assets/icons/back.svg';

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
  const couponsQuery = useInfiniteCoupons({ limit: PAGE_LIMIT });

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

  const renderCoupon = ({ item }: { item: CouponBoxEntry }) => (
    <CouponCard
      description={item.description}
      muted={!isCouponUsable(item.status)}
      onPress={onOpenCoupon
        ? () => {
          const coupon = couponsById.get(item.couponId);
          if (coupon) {
            onOpenCoupon(coupon);
          }
        }
        : undefined}
      periodText={formatOfferPeriod(item.issuedAt, item.expiresAt, locale, { compact: true })}
      placeName={item.placeName}
      title={item.title}
    />
  );

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
          ListEmptyComponent={<EmptyText>{t('myPage.couponBox.empty')}</EmptyText>}
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
