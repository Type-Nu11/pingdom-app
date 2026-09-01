import { useEffect, useMemo } from 'react';

import { useInfiniteCoupons, type Coupon } from '../../offers-coupons';

const DETAIL_PAGE_LIMIT = 100;

/**
 * Revalidates a Coupon before presenting its code. The live server has no
 * single-Coupon endpoint, so the hook follows the paginated `/coupons` contract
 * until it finds the selected id or reaches the final page.
 */
export function useCurrentCoupon(couponId: number) {
  const query = useInfiniteCoupons({ limit: DETAIL_PAGE_LIMIT });
  const coupon = useMemo<Coupon | undefined>(
    () => query.data?.pages
      .flatMap((page) => page.coupons)
      .find((item) => item.id === couponId),
    [couponId, query.data],
  );

  useEffect(() => {
    if (
      coupon
      || !query.isSuccess
      || !query.hasNextPage
      || query.isFetchingNextPage
      || query.isFetchNextPageError
    ) {
      return;
    }

    void query.fetchNextPage();
  }, [coupon, query]);

  const isScanning = !coupon && Boolean(query.hasNextPage) && !query.isFetchNextPageError;
  const error = query.isError || query.isFetchNextPageError ? query.error : null;

  return {
    coupon,
    error,
    isLoading: query.isLoading || isScanning || (query.isFetching && !query.isFetchingNextPage),
    isNotFound: query.isSuccess && !coupon && !query.hasNextPage,
    retry: () => {
      if (query.isFetchNextPageError) {
        void query.fetchNextPage();
      } else {
        void query.refetch();
      }
    },
  };
}
