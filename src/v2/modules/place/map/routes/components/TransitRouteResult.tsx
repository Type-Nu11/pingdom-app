import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import type { TransitItinerary, TransitLeg } from '../api/transitRoutesApi';
import { routeMetrics } from '../model/routePresentation';
import { transitLegColor, transitMapSegments } from '../model/transitPresentation';
import { RouteSummaryCard, RoutePageIndicator } from './RouteSummaryCard';
import WalkIcon from '../assets/segment_walk.svg';
import SubwayIcon from '../assets/segment_subway.svg';
import BusIcon from '../assets/segment_bus.svg';
import ClockIcon from '../assets/route_clock.svg';

type Props = { alternatives?: TransitItinerary[]; itinerary: TransitItinerary; index: number; count: number; estimateAt?: number; onSelect: (index: number) => void; onStart: () => void };

function LegIcon({ mode }: { mode: TransitLeg['mode'] }) {
  return mode === 'WALK' ? <WalkIcon /> : mode === 'SUBWAY' ? <SubwayIcon /> : mode === 'BUS' || mode === 'EXPRESSBUS' ? <BusIcon /> : null;
}

function useTransitLabels(itinerary: TransitItinerary, estimateAt?: number) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'en';
  const metrics = routeMetrics({ ...itinerary, path: [] }, language, t);
  metrics.distance = metrics.distance.replace(/ (km|m)$/, '$1');
  const number = new Intl.NumberFormat(language);
  const walk = itinerary.totalWalkTimeSeconds === undefined ? undefined : t('routes.transit.walk', {
    duration: routeMetrics({ path: [], distanceMeters: 0, durationSeconds: itinerary.totalWalkTimeSeconds }, language, t).duration });
  const fare = itinerary.totalFare === undefined ? undefined : number.format(itinerary.totalFare);
  const transfers = itinerary.transferCount === undefined ? undefined : t('routes.transit.transfers', { count: itinerary.transferCount });
  // This is a lookup-time estimate, never a timetable or a live arrival claim.
  const clock = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit', hour12: false });
  const validTime = typeof estimateAt === 'number' && Number.isFinite(estimateAt) && Number.isFinite(new Date(estimateAt + itinerary.durationSeconds * 1000).getTime());
  const arrival = validTime ? t('routes.arrival', { time: clock.format(new Date(estimateAt + itinerary.durationSeconds * 1000)) }) : undefined;
  const departure = validTime ? t('routes.design.departure', { time: clock.format(new Date(estimateAt)) }) : undefined;
  return { metrics, fare, transfers, walk, arrival, departure, meta: [fare, transfers, walk].filter(Boolean).join(' · ') };
}

/** Figma 8491:9943: a single 22px track with duration-proportional legs. */
function SegmentBar({ itinerary }: { itinerary: TransitItinerary }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  return <Bar testID="route-segment-bar" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}
    style={{ backgroundColor: theme.colors.fillNeutral }}>
    {itinerary.legs.map((leg, index) => {
      const walk = leg.mode === 'WALK';
      const duration = leg.durationSeconds === undefined ? '' : routeMetrics({ path: [], distanceMeters: 0, durationSeconds: leg.durationSeconds }, i18n.resolvedLanguage ?? 'en', t).duration;
      return <BarSegment key={index} accessible accessibilityLabel={`${t(`routes.transit.modes.${leg.mode}`)} ${duration}`}
        style={{ flexGrow: leg.durationSeconds ?? 1, backgroundColor: walk ? 'transparent' : transitLegColor(leg), minWidth: walk ? index === 0 ? 56 : 40 : 44 }}>
        {(!walk || index === 0) && <SegmentIcon style={{ backgroundColor: transitLegColor(leg) }}><LegIcon mode={leg.mode} /></SegmentIcon>}
        <Text numberOfLines={1} style={{ flex: 1, minWidth: 0, textAlign: 'center', fontSize: 12, lineHeight: 15.6,
          fontWeight: walk ? '500' : '700', color: walk ? theme.colors.labelAssistive : '#FFFFFF' }}>{duration}</Text>
      </BarSegment>;
    })}
  </Bar>;
}

/** Figma 8540:11236. Static sample values are never part of this component. */
function TransitRouteCard({ itinerary, estimateAt, recommended, onStart }: { itinerary: TransitItinerary; estimateAt?: number; recommended: boolean; onStart: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useTransitLabels(itinerary, estimateAt);
  return (
    <RouteSummaryCard testID="transit-summary" duration={labels.metrics.duration}
      subtitle={[labels.arrival, labels.metrics.distance].filter(Boolean).join(' · ')} meta={labels.meta}
      recommended={recommended} onStart={onStart} actionLabel={t('routes.tracking.start')} actionHint={t('routes.tracking.hint')} disabled={!transitMapSegments(itinerary).length}>
      <SegmentBar itinerary={itinerary} />
      <EstimateNote><ClockIcon /><Text style={{ flex: 1, fontSize: 12, lineHeight: 15.6, color: theme.colors.primary, fontWeight: '500' }}>{t('routes.design.providerEstimate')}</Text></EstimateNote>
      {!transitMapSegments(itinerary).length && <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{t('routes.transit.noGeometry')}</Text>}
    </RouteSummaryCard>
  );
}

export function TransitRouteResult({ itinerary, alternatives, index, count, estimateAt, onSelect, onStart }: Props) {
  const pager = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const pages = alternatives?.length === count && count > 1 ? alternatives : undefined;
  useEffect(() => {
    if (width && pages) pager.current?.scrollTo({ x: width * index, animated: true });
  }, [width, index, pages]);
  return <View style={{ gap: 12 }}>
    <View testID="transit-pager-frame" onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      {pages && width > 0 ? <ScrollView ref={pager} testID="transit-route-pager" horizontal pagingEnabled
        directionalLockEnabled nestedScrollEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => {
          const next = Math.max(0, Math.min(count - 1, Math.round(event.nativeEvent.contentOffset.x / width)));
          if (next !== index) onSelect(next);
        }}>
        {pages.map((page, pageIndex) => <View key={pageIndex} style={{ width }}
          accessibilityElementsHidden={pageIndex !== index} importantForAccessibility={pageIndex === index ? 'auto' : 'no-hide-descendants'}>
          <TransitRouteCard itinerary={page} estimateAt={estimateAt} recommended={pageIndex === 0} onStart={onStart} />
        </View>)}
      </ScrollView> : <TransitRouteCard itinerary={itinerary} estimateAt={estimateAt} recommended={index === 0} onStart={onStart} />}
    </View>
    <RoutePageIndicator index={index} count={count} onSelect={onSelect} />
  </View>;
}

const Bar = styled.ScrollView`min-height: 22px; flex-grow: 0; border-radius: 11px;`;
const BarSegment = styled.View`flex-basis: 0px; flex-shrink: 1; min-height: 22px; border-radius: 11px; flex-direction: row; align-items: center; gap: 4px; padding-right: 6px;`;
const SegmentIcon = styled.View`width: 22px; height: 22px; border-radius: 11px; border-width: 2px; border-color: white; align-items: center; justify-content: center;`;
const EstimateNote = styled.View`flex-direction: row; align-items: center; gap: 6px;`;
