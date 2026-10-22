import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { createReservationsQueryOptions } from '../../../../booking/reservations';
import { createPlaceDetailQueryOptions } from '../../../detail';
import { ApiErrorState, Skeleton } from '../../../../../shared/components';
import { Text } from '../../../../../shared/components/Typography';
import type { RecentSearchOwner } from '../../../search/services/recentSearchStorage';
import { hasRouteDestinationCoordinates, type RouteDestination } from '../model/routeUi';
import ClockIcon from '../assets/recent_clock.svg';

export default function RecentReservationPlaces({ owner, onSelect }: {
  owner?: RecentSearchOwner; onSelect: (destination: RouteDestination) => void;
}) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const client = useQueryClient();
  const ownerId = owner?.kind === 'user' ? owner.userId : null;
  const ownerScope = useMemo(() => ({ ownerId }), [ownerId]);
  const scope = useRef(ownerScope);
  scope.current = ownerScope;
  const mounted = useRef(true);
  const selecting = useRef(false);
  const [pending, setPending] = useState<number | null>(null);
  const [failed, setFailed] = useState<number | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { selecting.current = false; setPending(null); setFailed(null); }, [ownerId]);
  const firstPage = createReservationsQueryOptions({ page: 1, limit: 20 });
  const query = useInfiniteQuery({
    queryKey: [...firstPage.queryKey, `user:${ownerId}`],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) => createReservationsQueryOptions({ page: pageParam, limit: 20 }).queryFn({ signal }),
    getNextPageParam: (lastPage, pages) => lastPage.hasNext ? pages.length + 1 : undefined,
    enabled: ownerId !== null,
    staleTime: 30_000,
  });
  const seen = new Set<number>();
  const reservations = ownerId === null ? [] : (query.data?.pages.flatMap(page => page.reservations ?? []) ?? [])
    .filter(item => {
      const valid = !seen.has(item.id) && (item.status === 'PENDING' || item.status === 'CONFIRMED')
        && Number.isSafeInteger(item.confirmation?.placeId) && item.confirmation!.placeId > 0
        && Boolean(item.confirmation?.placeName?.trim());
      seen.add(item.id);
      return valid;
    })
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));

  async function select(reservationId: number, placeId: number) {
    if (selecting.current || ownerId === null) return;
    selecting.current = true; setPending(reservationId); setFailed(null);
    const selectedOwner = ownerScope;
    try {
      const place = await client.fetchQuery(createPlaceDetailQueryOptions(placeId));
      if (!mounted.current || scope.current !== selectedOwner) return;
      if (place.id !== placeId || !place.name.trim() || !hasRouteDestinationCoordinates(place)) throw new Error('Missing reservation place');
      onSelect({ placeId: place.id, name: place.name, address: place.roadAddress || place.address,
        latitude: place.latitude, longitude: place.longitude });
    } catch {
      if (mounted.current && scope.current === selectedOwner) setFailed(reservationId);
    } finally {
      if (mounted.current && scope.current === selectedOwner) { selecting.current = false; setPending(null); }
    }
  }

  return <View style={{ gap: 8 }} testID="route-recent-reservations">
    <Text accessibilityRole="header" style={{ color: colors.textStrong, fontSize: 18, fontWeight: '700' }}>{t('routes.reservationPlaces.title')}</Text>
    {ownerId !== null && query.isLoading ? <Skeleton accessibilityLabel={t('reservation.box.loading')} />
      : ownerId !== null && query.isError && !reservations.length ? <ApiErrorState error={query.error} busy={query.isFetching} onRetry={() => query.refetch()} />
        : !reservations.length ? <Text style={{ color: colors.textSecondary }}>{t('routes.reservationPlaces.empty')}</Text> : null}
    {reservations.map(item => {
      const confirmation = item.confirmation!;
      const instant = item.reservationStartsAt ?? confirmation.startsAt;
      const date = new Date(instant);
      let dateLabel = '';
      if (Number.isFinite(date.getTime())) {
        try {
          dateLabel = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'en', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: confirmation.timezone,
          }).format(date);
        } catch { /* Keep the place selectable if a legacy timezone cannot be formatted. */ }
      }
      return <View key={item.id}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('routes.reservationPlaces.select', { name: confirmation.placeName })}
          accessibilityState={{ busy: pending === item.id, disabled: pending !== null }} disabled={pending !== null}
          onPress={() => { void select(item.id, confirmation.placeId); }}
          style={{ minHeight: 64, paddingVertical: 12, gap: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><ClockIcon /></View>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text numberOfLines={1} style={{ color: colors.textStrong, fontSize: 16, fontWeight: '500' }}>{confirmation.placeName}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{[dateLabel, t(`reservation.list.statuses.${item.status.toLowerCase()}`)].filter(Boolean).join(' · ')}</Text>
          </View>
          {pending === item.id ? <ActivityIndicator color={colors.primary} /> : null}
        </Pressable>
        {failed === item.id ? <Text accessibilityLiveRegion="polite" style={{ color: colors.danger, fontSize: 12 }}>{t('routes.reservationPlaces.failed')}</Text> : null}
      </View>;
    })}
    {query.hasNextPage ? <Pressable accessibilityRole="button" disabled={query.isFetchingNextPage} onPress={() => { void query.fetchNextPage(); }} style={{ minHeight: 44, justifyContent: 'center' }}>
      <Text style={{ color: colors.primary }}>{t(query.isFetchNextPageError ? 'reservation.list.retry' : 'routes.editor.more')}</Text>
    </Pressable> : null}
  </View>;
}
