import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import {
  TrackingTop, GuidanceShadow, Guidance, Maneuver, ManeuverIcon, GuidanceText, Next,
  LocationSurface, LocationButton, SheetPosition, Sheet, SheetContent, Grabber,
  SummaryRow, Stats, Stat, StopButton, Tags, Tag, Recovery, RecoveryAction,
} from '../styles/RouteTrackingSheet.styles';
import type { Coordinate } from '../../camera/model/map.types';
import type { RouteState } from '../model/routeState';
import { destinationDistance } from '../model/routeTracking';
import { routeMetrics } from '../model/routePresentation';
import { formatDistance } from '../../../../../shared/i18n/formatters';
import CarIcon from '../assets/mode_car_selected.svg';
import WalkIcon from '../assets/mode_walk_selected.svg';
import TransitIcon from '../assets/mode_transit.svg';
import MyLocationIcon from '../assets/tracking_location.svg';

type Props = {
  mode?: 'car' | 'walk' | 'transit';
  name: string; destination: Coordinate; coordinate: Coordinate | null; state: RouteState; arrived: boolean;
  following: boolean; preview?: boolean; topInset: number; bottomInset: number; maxHeight: number; deniedPermanently: boolean;
  onStop: () => void; onFollow: () => void; onRefresh: () => void; onSettings: () => void;
};

/** Figma 9533:11658. The API supplies totals, not live ETA or turn instructions. */
export default function RouteTrackingSheet(props: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const language = i18n.resolvedLanguage ?? 'en';
  const loading = props.state.kind === 'loading';
  const failed = props.state.kind !== 'ready' && !loading;
  const title = props.arrived ? 'arrived' : loading ? 'loading' : failed ? 'failed' : props.preview ? 'preview' : props.coordinate ? 'active' : 'paused';
  const metrics = props.state.kind === 'ready' && !props.arrived ? routeMetrics(props.state.route, language, t) : null;
  const distance = props.coordinate && metrics ? formatDistance(destinationDistance(props.coordinate, props.destination), language) : null;
  const ink = theme.colors.labelStrong;
  const muted = theme.colors.labelAssistive;
  const glass = theme.liquidGlass.sheet;
  const needsRecovery = !props.arrived && !props.coordinate;
  const needsFollow = !props.arrived && !!props.coordinate && props.state.kind === 'ready' && !props.following;

  function action(key: string, testID: string, onPress: () => void) {
    return <RecoveryAction testID={testID} accessibilityRole="button" onPress={onPress}
      style={({ pressed }) => ({ backgroundColor: pressed ? theme.colors.surfacePressed : theme.colors.fillNeutral })}>
      <Text style={[theme.typography.labelMedium, { color: ink, textAlign: 'center' }]}>{t(key === 'settings' ? 'routes.settings' : `routes.tracking.${key}`)}</Text>
    </RecoveryAction>;
  }

  return <>
    <TrackingTop pointerEvents="box-none" style={{ top: props.topInset + 4 }}>
      <GuidanceShadow style={{ boxShadow: glass.shadow }}>
        <Guidance testID="route-tracking-guidance" tintColor={glass.tint} androidTintColor={glass.tint}
          style={{ maxHeight: props.maxHeight * 0.4 }}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Maneuver>
              <ManeuverIcon accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
                style={{ backgroundColor: theme.liquidGlass.category.activeTint }}>
                {loading ? <ActivityIndicator color={theme.colors.primary} /> : props.mode === 'walk' ? <WalkIcon color={theme.colors.primary} /> : props.mode === 'transit' ? <TransitIcon color={theme.colors.primary} /> : <CarIcon color={theme.colors.primary} />}
              </ManeuverIcon>
              {distance ? <GuidanceText testID="route-tracking-distance" accessible accessibilityLabel={t('routes.tracking.distance', { distance })}>
                <Text style={[theme.typography.title1Bold, { color: ink }]}>{distance}</Text>
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.labelNeutral }]}>{t('routes.tracking.distanceLabel')}</Text>
              </GuidanceText> : <Text accessibilityRole="header" accessibilityLiveRegion="polite"
                style={[theme.typography.headline1Bold, { color: ink, flex: 1 }]}>{t(`routes.tracking.${title}`)}</Text>}
            </Maneuver>
            <Next style={{ backgroundColor: glass.tint }}>
              <Text accessibilityLiveRegion="polite" style={[theme.typography.labelMedium, { color: theme.colors.textAlternative }]}>
                {failed && !props.arrived ? t(`routes.states.${props.state.kind}`) : distance ? `${props.name} · ${t(`routes.tracking.${title}`)}` : props.name}
              </Text>
            </Next>
          </ScrollView>
        </Guidance>
      </GuidanceShadow>
      <LocationSurface tintColor={theme.liquidGlass.navigation.tint} style={{ boxShadow: theme.liquidGlass.navigation.shadow }}>
        <LocationButton testID="route-tracking-recenter" accessibilityRole="button" accessibilityLabel={t(`routes.tracking.${props.preview ? 'previewFollow' : 'follow'}`)}
          onPress={props.coordinate ? props.onFollow : props.onRefresh} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <MyLocationIcon />
        </LocationButton>
      </LocationSurface>
    </TrackingTop>
    <SheetPosition style={{ maxHeight: props.maxHeight * 0.45, boxShadow: glass.shadow }}>
      <Sheet testID="route-tracking-sheet" tintColor={glass.tint} androidTintColor={glass.tint}>
        <SheetContent bounces={false} showsVerticalScrollIndicator={false} $bottomInset={props.bottomInset}>
          <Grabber accessible={false} style={{ backgroundColor: theme.colors.secondaryNormal }} />
          <SummaryRow>
            {metrics ? <Stats testID="route-tracking-summary" accessible accessibilityLabel={`${t('routes.tracking.estimate')}: ${metrics.duration}, ${metrics.distance}`}>
              <Stat>
                <Text style={[theme.typography.headline1Bold, { color: ink }]}>{metrics.duration}</Text>
                <Text style={[theme.typography.captionMedium, { color: muted }]}>{t('routes.tracking.durationAtLookup')}</Text>
              </Stat>
              <Stat>
                <Text style={[theme.typography.headline1Bold, { color: ink }]}>{metrics.distance}</Text>
                <Text style={[theme.typography.captionMedium, { color: muted }]}>{t('routes.tracking.totalDistance')}</Text>
              </Stat>
            </Stats> : <Text numberOfLines={2} style={[theme.typography.bodyMedium, { color: ink, flex: 1 }]}>{props.name}</Text>}
            <StopButton testID="route-tracking-stop" accessibilityRole="button" accessibilityLabel={t(`routes.tracking.${props.arrived ? 'done' : 'stop'}`)} onPress={props.onStop}
              style={({ pressed }) => ({ backgroundColor: theme.colors.danger, opacity: pressed ? 0.7 : 1 })}>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.textInverse, fontWeight: '700', textAlign: 'center' }]}>{t(`routes.tracking.${props.arrived ? 'done' : 'end'}`)}</Text>
            </StopButton>
          </SummaryRow>
          {!props.arrived && <Tags>
            <Tag style={{ backgroundColor: theme.colors.fillNeutral }}>
              <Text style={[theme.typography.captionMedium, { color: theme.colors.labelNeutral }]}>{t('routes.tracking.noTurnGuidance')}</Text>
            </Tag>
          </Tags>}
          {(needsRecovery || needsFollow) && <Recovery>
            {needsRecovery && props.deniedPermanently && action('settings', 'route-tracking-settings', props.onSettings)}
            {needsRecovery && action('refresh', 'route-tracking-refresh', props.onRefresh)}
            {needsFollow && action(props.preview ? 'previewFollow' : 'follow', 'route-tracking-follow', props.onFollow)}
          </Recovery>}
        </SheetContent>
      </Sheet>
    </SheetPosition>
  </>;
}
