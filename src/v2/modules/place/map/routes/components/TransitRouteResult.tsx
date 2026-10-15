import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import GlassSurface from '../../presentation/components/GlassSurface';
import type { TransitItinerary, TransitLeg } from '../api/transitRoutesApi';
import { routeMetrics } from '../model/routePresentation';
import { transitLegColor, transitMapSegments } from '../model/transitPresentation';
import { RouteSummaryCard, RoutePageIndicator } from './RouteSummaryCard';
import WalkIcon from '../assets/segment_walk.svg';
import SubwayIcon from '../assets/segment_subway.svg';
import BusIcon from '../assets/segment_bus.svg';
import BackIcon from '../assets/detail_back.svg';
import CloseIcon from '../assets/close.svg';
import ShareIcon from '../assets/share.svg';
import StartIcon from '../assets/start.svg';
import ClockIcon from '../assets/route_clock.svg';
import TimelineWalkIcon from '../assets/timeline_walk.svg';
import TransferIcon from '../assets/timeline_transfer.svg';
import TimelineBusIcon from '../assets/timeline_bus.svg';
import TimelineOriginIcon from '../assets/timeline_origin.svg';
import TimelineDestinationIcon from '../assets/timeline_destination.svg';
import DotsIcon from '../assets/timeline_dots.svg';

type Props = { alternatives?: TransitItinerary[]; itinerary: TransitItinerary; index: number; count: number; estimateAt?: number; onSelect: (index: number) => void; onDetails: () => void };

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
function TransitRouteCard({ itinerary, estimateAt, recommended, onDetails }: { itinerary: TransitItinerary; estimateAt?: number; recommended: boolean; onDetails: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useTransitLabels(itinerary, estimateAt);
  return (
    <RouteSummaryCard testID="transit-summary" duration={labels.metrics.duration}
      subtitle={[labels.arrival, labels.metrics.distance].filter(Boolean).join(' · ')} meta={labels.meta}
      recommended={recommended} onStart={onDetails} actionLabel={t('routes.transit.details')} actionHint={t('routes.design.detailsHint')}>
      <SegmentBar itinerary={itinerary} />
      <EstimateNote><ClockIcon /><Text style={{ flex: 1, fontSize: 12, lineHeight: 15.6, color: theme.colors.primary, fontWeight: '500' }}>{t('routes.design.providerEstimate')}</Text></EstimateNote>
      {!transitMapSegments(itinerary).length && <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>{t('routes.transit.noGeometry')}</Text>}
    </RouteSummaryCard>
  );
}

export function TransitRouteResult({ itinerary, alternatives, index, count, estimateAt, onSelect, onDetails }: Props) {
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
          <TransitRouteCard itinerary={page} estimateAt={estimateAt} recommended={pageIndex === 0} onDetails={onDetails} />
        </View>)}
      </ScrollView> : <TransitRouteCard itinerary={itinerary} estimateAt={estimateAt} recommended={index === 0} onDetails={onDetails} />}
    </View>
    <RoutePageIndicator index={index} count={count} onSelect={onSelect} />
  </View>;
}

function TimelineLeg({ leg, transfer }: { leg: TransitLeg; transfer: boolean }) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const walk = leg.mode === 'WALK';
  const metrics = leg.distanceMeters !== undefined && leg.durationSeconds !== undefined
    ? routeMetrics({ path: [], distanceMeters: leg.distanceMeters, durationSeconds: leg.durationSeconds }, i18n.resolvedLanguage ?? 'en', t) : null;
  const endpoints = [leg.start?.name, leg.end?.name].filter(Boolean).join(' → ');
  const label = t(`routes.transit.modes.${leg.mode}`);
  const title = walk ? [transfer ? t('routes.design.transfer') : label, metrics?.duration, metrics?.distance.replace(/ (km|m)$/, '$1')].filter(Boolean).join(' · ')
    : [leg.routeName ?? label, leg.mode === 'SUBWAY' ? endpoints : leg.start?.name].filter(Boolean).join(' · ');
  const subwayNumber = leg.mode === 'SUBWAY' ? leg.routeName?.match(/(?:^|\s)(\d+)(?:호선|$)/)?.[1] : undefined;
  const visibleStations = leg.stations.filter(station => station.name);
  return <TimelineRow>
    <Rail>
      <Badge style={{ backgroundColor: walk ? theme.colors.fillAlternative : transitLegColor(leg) }}>
        {walk ? transfer ? <TransferIcon /> : <TimelineWalkIcon /> : leg.mode === 'SUBWAY' ? subwayNumber
          ? <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{subwayNumber}</Text> : <SubwayIcon />
          : leg.mode === 'BUS' || leg.mode === 'EXPRESSBUS' ? <TimelineBusIcon /> : <LegIcon mode={leg.mode} />}
      </Badge>
      {walk ? <DottedStem><DottedCell><DotsIcon style={{ transform: [{ rotate: '90deg' }] }} /></DottedCell></DottedStem> : <SolidStem style={{ backgroundColor: transitLegColor(leg) }} />}
    </Rail>
    <TimelineBody>
      <Text style={{ color: walk ? theme.colors.textSecondary : theme.colors.textStrong, fontSize: walk ? 14 : 16, lineHeight: walk ? 18.2 : 20.8, fontWeight: walk ? '500' : '700' }}>{title}</Text>
      {!!(walk ? endpoints : leg.mode !== 'SUBWAY' ? leg.end?.name : undefined) && <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 18.2 }}>{walk ? endpoints : leg.end?.name}</Text>}
      {!walk && metrics && <Text style={{ color: theme.colors.labelAssistive, fontSize: 12, lineHeight: 15.6 }}>{metrics.duration} · {metrics.distance}</Text>}
      {!!visibleStations.length && <>
        <StopsButton accessibilityRole="button" accessibilityLabel={t('routes.transit.stations')} accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)}>
          <Text style={{ color: theme.colors.primary, fontSize: 12 }}>{t('routes.transit.stations')}</Text>
        </StopsButton>
        {expanded && visibleStations.map((station, index) => <Text key={index} style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{station.name}</Text>)}
      </>}
    </TimelineBody>
  </TimelineRow>;
}

export function TransitRouteDetails({ itinerary, originName, destinationName, originAddress, destinationAddress, estimateAt,
  recommended = true, topInset, bottomInset, onBack, onClose, onShare, onStart }: {
  itinerary: TransitItinerary; originName?: string; destinationName?: string; originAddress?: string | null; destinationAddress?: string | null;
  estimateAt?: number; recommended?: boolean; topInset: number; bottomInset: number; onBack: () => void; onClose: () => void; onShare?: () => void; onStart?: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const labels = useTransitLabels(itinerary, estimateAt);
  const tint = theme.colorScheme === 'dark' ? theme.liquidGlass.navigation.tint : 'rgba(255,255,255,0.24)';
  function circle(label: string, onPress: (() => void) | undefined, icon: React.ReactNode) {
    return <GlassSurface tintColor={tint} androidTintColor={tint} style={{ borderRadius: 22, boxShadow: theme.liquidGlass.navigation.shadow }}>
      <Circle accessibilityRole="button" accessibilityLabel={label} disabled={!onPress} accessibilityState={{ disabled: !onPress }} onPress={onPress}>{icon}</Circle>
    </GlassSurface>;
  }
  return <Details testID="transit-details" accessibilityViewIsModal style={{ paddingTop: topInset, backgroundColor: theme.colors.background }}>
    <Header>
      {circle(t('routes.transit.back'), onBack, <BackIcon />)}
      <HeaderTitle><Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 20, lineHeight: 26, fontWeight: '700' }}>{t('routes.transit.details')}</Text>
        <Text style={{ color: theme.colors.primary, fontSize: 12, lineHeight: 15.6, fontWeight: '500' }}>{t(recommended ? 'routes.design.transitRecommended' : 'routes.modes.transit')}</Text>
      </HeaderTitle>
      {circle(t('routes.close'), onClose, <CloseIcon />)}
    </Header>
    <Overview>
      <DurationRow><Text style={{ color: theme.colors.textStrong, fontSize: 28, lineHeight: 36.4, fontWeight: '700' }}>{labels.metrics.duration}</Text>
        {(labels.departure || labels.arrival) && <Text style={{ flexShrink: 1, color: theme.colors.textSecondary, fontSize: 14, lineHeight: 18.2, fontWeight: '500' }}>{t('routes.design.estimate')} {labels.departure} → {labels.arrival}</Text>}
      </DurationRow>
      <Chips>{[labels.fare, labels.transfers, labels.walk, labels.metrics.distance].filter(Boolean).map((label, index) => <Chip key={index}
        accessibilityLabel={index === 0 && labels.fare ? t('routes.transit.fare', { amount: labels.fare }) : undefined}
        style={{ backgroundColor: theme.colors.surfaceMuted }}><Text style={{ color: theme.colors.textStrong, fontSize: 14, lineHeight: 18.2, fontWeight: '500' }}>{label}</Text></Chip>)}</Chips>
      <SegmentBar itinerary={itinerary} />
    </Overview>
    <Divider style={{ backgroundColor: theme.colors.fillNeutral }} />
    <Timeline contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 24, paddingBottom: 16 }}>
      <TimelineRow><Rail><OriginBadge><TimelineOriginIcon /></OriginBadge><DottedStem><DottedCell><DotsIcon style={{ transform: [{ rotate: '90deg' }] }} /></DottedCell></DottedStem></Rail>
        <TimelineBody><Text style={{ color: theme.colors.textStrong, fontSize: 16, lineHeight: 20.8, fontWeight: '700' }}>{originName}</Text>
          {!!originAddress && <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 18.2 }}>{originAddress}</Text>}
          {!!labels.departure && <Text style={{ color: theme.colors.labelAssistive, fontSize: 12, lineHeight: 15.6 }}>{t('routes.design.estimate')} {labels.departure}</Text>}
        </TimelineBody>
      </TimelineRow>
      {itinerary.legs.map((leg, index) => <TimelineLeg key={index} leg={leg} transfer={leg.mode === 'WALK' && index > 0 && index < itinerary.legs.length - 1} />)}
      <TimelineRow><Rail><TimelineDestinationIcon /></Rail><TimelineBody style={{ paddingBottom: 0 }}>
        <Text style={{ color: theme.colors.textStrong, fontSize: 16, lineHeight: 20.8, fontWeight: '700' }}>{destinationName}</Text>
        {!!destinationAddress && <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 18.2 }}>{destinationAddress}</Text>}
        {!!labels.arrival && <Text style={{ color: theme.colors.labelAssistive, fontSize: 12, lineHeight: 15.6 }}>{t('routes.design.estimate')} {labels.arrival}</Text>}
      </TimelineBody></TimelineRow>
      <Text style={{ color: theme.colors.labelAssistive, fontSize: 12, lineHeight: 15.6 }}>{t('routes.transit.provider')}</Text>
    </Timeline>
    <Footer style={{ paddingBottom: Math.max(12, bottomInset), borderTopColor: theme.colors.border }}>
      {circle(t('routes.share'), onShare, <ShareIcon />)}
      <FooterStart accessibilityRole="button" accessibilityLabel={t(onStart ? 'routes.tracking.start' : 'routes.design.showMap')} accessibilityHint={t(onStart ? 'routes.tracking.hint' : 'routes.design.mapHint')} onPress={onStart ?? onBack}
        disabled={!!onStart && !transitMapSegments(itinerary).length} accessibilityState={{ disabled: !!onStart && !transitMapSegments(itinerary).length }} style={{ backgroundColor: theme.colors.primary }}>
        <StartIcon /><Text style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 20.8, fontWeight: '700' }}>{t('routes.design.startGuidance')}</Text>
      </FooterStart>
    </Footer>
  </Details>;
}

const Bar = styled.ScrollView`min-height: 22px; flex-grow: 0; border-radius: 11px;`;
const BarSegment = styled.View`flex-basis: 0px; flex-shrink: 1; min-height: 22px; border-radius: 11px; flex-direction: row; align-items: center; gap: 4px; padding-right: 6px;`;
const SegmentIcon = styled.View`width: 22px; height: 22px; border-radius: 11px; border-width: 2px; border-color: white; align-items: center; justify-content: center;`;
const EstimateNote = styled.View`flex-direction: row; align-items: center; gap: 6px;`;
const Details = styled.View`position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;`;
const Header = styled.View`flex-direction: row; align-items: center; justify-content: space-between; padding: 0px 16px 8px; gap: 8px;`;
const HeaderTitle = styled.View`flex: 1; align-items: center; gap: 2px;`;
const Circle = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center;`;
const Overview = styled.View`padding: 12px 24px 16px; gap: 12px;`;
const DurationRow = styled.View`flex-direction: row; align-items: center; flex-wrap: wrap; gap: 8px;`;
const Chips = styled.View`flex-direction: row; flex-wrap: wrap; gap: 6px;`;
const Chip = styled.View`padding: 8px 12px; border-radius: 16px;`;
const Divider = styled.View`height: 8px;`;
const Timeline = styled.ScrollView`flex: 1;`;
const TimelineRow = styled.View`flex-direction: row; gap: 12px; min-height: 72px;`;
const TimelineBody = styled.View`flex: 1; min-width: 0px; gap: 2px; padding-bottom: 16px;`;
const Rail = styled.View`width: 32px; align-items: center; gap: 2px; align-self: stretch;`;
const OriginBadge = styled.View`padding: 4px 0px;`;
const Badge = styled.View`width: 24px; height: 24px; border-radius: 12px; align-items: center; justify-content: center;`;
const SolidStem = styled.View`width: 4px; flex: 1; min-height: 32px; border-radius: 2px;`;
const DottedStem = styled.View`width: 3px; flex: 1; min-height: 46px; overflow: hidden;`;
const DottedCell = styled.View`width: 3px; height: 46px; align-items: center; justify-content: center;`;
const StopsButton = styled.Pressable`min-height: 28px; justify-content: center;`;
const Footer = styled.View`padding: 12px 24px; border-top-width: 1px; flex-direction: row; align-items: center; gap: 8px;`;
const FooterStart = styled.Pressable`flex: 1; min-height: 48px; border-radius: 24px; padding: 12px 20px; flex-direction: row; align-items: center; justify-content: center; gap: 6px;`;
