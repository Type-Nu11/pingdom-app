import React, { useMemo, useState } from 'react';
import { ActivityIndicator, View, type LayoutChangeEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import GlassSurface from '../../presentation/components/GlassSurface';
import type { CarRoute } from '../api/routesApi';
import type { RouteDestination, RouteMode } from '../model/routeUi';
import { routeMetrics, routeSummary } from '../model/routePresentation';
import RouteHeader from './RouteHeader';
import TransitIcon from '../assets/mode_transit.svg';
import TransitInactiveIcon from '../assets/mode_transit_unselected.svg';
import WalkIcon from '../assets/mode_walk.svg';
import WalkSelectedIcon from '../assets/mode_walk_selected.svg';
import CarIcon from '../assets/mode_car.svg';
import CarSelectedIcon from '../assets/mode_car_selected.svg';
import BikeIcon from '../assets/mode_bike.svg';
import RouteEndpointRows, { type EndpointRole } from './RouteEndpointRows';
import UnavailableStateIcon from '../../../../../shared/components/UnavailableStateIcon';
import StartIcon from '../assets/start.svg';
import RouteWarningIcon from '../assets/route_warning.svg';

type Props = {
  origin: RouteDestination | null; destination: RouteDestination | null; mode: RouteMode; stateKey: string; ready: CarRoute | null;
  canRequest: boolean; canOpenExternal: boolean; bottomInset: number; maxHeight: number;
  hasOrigin: boolean; deniedPermanently: boolean; canStart: boolean; onStart: () => void;
  onLayout: (event: LayoutChangeEvent) => void; onMode: (mode: RouteMode) => void;
  onClose: () => void; onShare: () => void; onRequest: () => void; onCancel: () => void;
  onExternal: () => void; onRefreshLocation: () => void; onSettings: () => void;
  onEditEndpoint: (role: EndpointRole) => void; onSwapEndpoints: () => void;
};
const modes = ['transit', 'walk', 'car', 'bike'] as const;
const icons = { transit: TransitInactiveIcon, walk: WalkIcon, car: CarIcon, bike: BikeIcon };
const selectedIcons = { transit: TransitIcon, walk: WalkSelectedIcon, car: CarSelectedIcon, bike: BikeIcon };

/** Figma 8548:35327. Map imagery, routes and result values remain live data. */
export default function RoutePlannerSheet(props: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [dragging, setDragging] = useState(false);
  const language = i18n.resolvedLanguage ?? 'en';
  const arrivalTime = useMemo(() => props.ready ? new Date(Date.now() + props.ready.durationSeconds * 1000) : null, [props.ready]);
  const metrics = props.ready ? routeMetrics(props.ready, language, t) : null;
  const ink = theme.colors.textStrong;
  const muted = theme.colors.textSecondary;
  const raised = theme.colorScheme === 'dark' ? 'rgba(52,52,58,0.70)' : 'rgba(255,255,255,0.56)';
  const skeletonColor = theme.colorScheme === 'dark' ? theme.colors.secondaryNormal : theme.colors.fillAlternative;
  const loading = props.stateKey === 'loading' || props.stateKey === 'location-loading';
  const idle = props.stateKey === 'idle' || props.stateKey === 'canceled';
  const denied = props.stateKey === 'location-denied';
  const noRoute = props.stateKey === 'no-route';
  function action(label: string, onPress: () => void, testID?: string, disabled = false, primary = false) {
    return <Action testID={testID} accessibilityRole="button" accessibilityLabel={label}
      accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={{ backgroundColor: primary ? theme.colors.primary : theme.colors.surfaceMuted, opacity: disabled ? 0.45 : 1 }}>
      <Text style={{ color: primary ? '#FFFFFF' : ink, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
    </Action>;
  }
  return <SheetPosition testID="route-planner-sheet" onLayout={props.onLayout}
    style={{ bottom: Math.max(8, props.bottomInset), maxHeight: props.maxHeight, boxShadow: theme.liquidGlass.sheet.shadow }}>
    <SheetGlass tintColor={theme.liquidGlass.sheet.tint} androidTintColor={theme.liquidGlass.sheet.tint}
      style={{ borderColor: theme.liquidGlass.sheet.rim }}>
      <SheetContent bounces={false} scrollEnabled={!dragging} showsVerticalScrollIndicator={false}>
        <Grabber accessible={false} style={{ backgroundColor: theme.colors.secondaryNormal }} />
        <RouteHeader onShare={props.onShare} onClose={props.onClose} />
        <ModeTrack accessibilityRole="tablist" style={{ backgroundColor: theme.liquidGlass.navigation.selectedTint, boxShadow: theme.liquidGlass.category.shadow }}>
          {modes.map(mode => {
            const selected = props.mode === mode;
            const Icon = selected ? selectedIcons[mode] : icons[mode];
            return <ModeTab key={mode} accessibilityRole="tab" accessibilityLabel={t(`routes.modes.${mode}`)}
              accessibilityState={{ selected }} onPress={() => props.onMode(mode)}
              style={{ backgroundColor: selected ? raised : 'transparent' }}><Icon /></ModeTab>;
          })}
        </ModeTrack>
        <RouteEndpointRows originDenied={denied} origin={props.origin} destination={props.destination} onDragging={setDragging}
          onEdit={props.onEditEndpoint} onSwap={props.onSwapEndpoints} />
        {metrics && props.ready ? <Result testID="route-status"
          style={{ backgroundColor: raised }}>
          <View accessible accessibilityLabel={routeSummary(props.ready, language, t)} style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={{ color: ink, fontSize: 28, lineHeight: 36.4, fontWeight: '700' }}>{metrics.duration}</Text>
            <Text style={{ color: muted, fontSize: 14, lineHeight: 18.2, fontWeight: '500' }}>{arrivalTime ? t('routes.arrival', { time: new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit' }).format(arrivalTime) }) + ' · ' : ''}{metrics.distance}</Text>
            <Text style={{ color: theme.colors.labelAssistive, fontSize: 12, lineHeight: 15.6 }}>{t('routes.providerEstimate')}</Text>
          </View>
          <Start testID="route-start" accessibilityRole="button" accessibilityLabel={t('routes.tracking.start')} accessibilityHint={t('routes.tracking.hint')}
            disabled={!props.canStart} accessibilityState={{ disabled: !props.canStart }} onPress={props.onStart}
            style={{ backgroundColor: theme.colors.primary, opacity: props.canStart ? 1 : 0.45 }}>
            <StartIcon /><StartText>{t('routes.start')}</StartText>
          </Start>
        </Result> : loading ? <StateCard style={{ backgroundColor: raised, padding: 16, gap: 10 }}>
          <SkeletonRow accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={{ gap: 8, flex: 1, minWidth: 0 }}>
              {[{ width: 96, height: 28 }, { width: 160, height: 14 }, { width: 200, height: 12 }].map((size, index) => <Skeleton key={index} style={{ ...size, maxWidth: '100%', borderRadius: size.height / 2, backgroundColor: skeletonColor }} />)}
            </View>
            <Skeleton testID="route-loading-cta" style={{ width: 88, height: 48, borderRadius: 24, backgroundColor: skeletonColor }} />
          </SkeletonRow>
          <Skeleton testID="route-loading-bar" style={{ alignSelf: 'stretch', height: 22, borderRadius: 11, backgroundColor: theme.colors.fillNeutral }} />
          <View style={{ flexDirection: 'row', alignSelf: 'stretch', alignItems: 'center', gap: 6 }}><ActivityIndicator size="small" color={theme.colors.primary} />
            <Text testID="route-status" accessibilityLiveRegion="polite" style={{ flex: 1, color: theme.colors.primary, fontSize: 12, fontWeight: '500' }}>{t(`routes.states.${props.stateKey}`)}</Text></View>
          {props.stateKey === 'loading' && action(t('routes.cancel'), props.onCancel)}
        </StateCard> : <StateCard style={{ backgroundColor: raised }}>
          {(denied || noRoute) ? <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><RouteWarningIcon /></View> : !idle && <UnavailableStateIcon size={44} />}
          <Text style={{ color: ink, fontSize: 18, lineHeight: 23.4, fontWeight: '700', textAlign: 'center' }}>{t(denied ? 'routes.permissionTitle' : noRoute ? 'routes.noRouteTitle' : idle ? 'routes.findRoute' : props.stateKey === 'unsupported' ? 'routes.externalTitle' : 'routes.cannotFind')}</Text>
          <Text testID="route-status" accessibilityLiveRegion="polite" style={{ color: muted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>{t(`routes.states.${props.stateKey}`)}</Text>
          {denied ? <ActionRow>
            {action(t('routes.directInput'), () => props.onEditEndpoint('origin'), 'route-direct-input')}
            {action(t(props.deniedPermanently ? 'routes.settings' : 'routes.location'), props.deniedPermanently ? props.onSettings : props.onRefreshLocation, 'route-permission-recovery', false, true)}
          </ActionRow> : noRoute ? <ActionRow>
            {action(t('routes.editPlaces'), () => props.onEditEndpoint('destination'))}
            {action(t('routes.request'), props.onRequest, 'route-request', !props.canRequest, true)}
          </ActionRow> : props.mode === 'car' && action(t('routes.request'), props.onRequest, 'route-request', !props.canRequest, true)}
          {!props.hasOrigin && !denied && <ActionRow>
            {action(t('routes.location'), props.onRefreshLocation)}
            {props.deniedPermanently && action(t('routes.settings'), props.onSettings, undefined, false, true)}
          </ActionRow>}
        </StateCard>}
        {props.ready && !props.canStart && <Footer><Text style={{ color: muted }}>{t('routes.tracking.startUnavailable')}</Text>{action(t(props.deniedPermanently ? 'routes.settings' : 'routes.location'), props.deniedPermanently ? props.onSettings : props.onRefreshLocation)}</Footer>}
        {!props.ready && !loading && <Footer>{action(t('routes.external'), props.onExternal, 'route-external', !props.canOpenExternal)}</Footer>}
      </SheetContent>
    </SheetGlass>
  </SheetPosition>;
}

const SheetPosition = styled.View`
  position: absolute;
  left: 8px;
  right: 8px;
`;
const SheetGlass = styled(GlassSurface)`
  border-top-left-radius: 36px;
  border-top-right-radius: 36px;
  border-bottom-left-radius: 48px;
  border-bottom-right-radius: 48px;
  border-width: 1px;
  overflow: hidden;
`;
const SheetContent = styled.ScrollView.attrs({ contentContainerStyle: { paddingTop: 8, paddingBottom: 16, paddingHorizontal: 16, gap: 12 } })``;
const Grabber = styled.View`
  width: 56px;
  height: 5px;
  border-radius: 4px;
  align-self: center;
`;
const ModeTrack = styled.View`
  height: 48px;
  padding: 4px;
  border-radius: 24px;
  flex-direction: row;
`;
const ModeTab = styled.Pressable`
  flex: 1;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  min-height: 40px;
`;
const Result = styled.View`
  padding: 16px;
  border-radius: 24px;
  min-height: 106px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;
const Start = styled.Pressable`
  height: 48px;
  padding: 0px 20px;
  border-radius: 24px;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;
const StartText = styled(Text)`
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 700;
`;
const StateCard = styled.View`
  padding: 22px 16px;
  border-radius: 24px;
  gap: 12px;
  align-items: center;
`;
const Action = styled.Pressable`
  min-height: 44px;
  border-radius: 24px;
  padding: 12px 16px;
  justify-content: center;
  align-self: stretch;
  flex-shrink: 1;
  flex-grow: 1;
`;
const ActionRow = styled.View`
  flex-direction: row;
  gap: 8px;
  align-self: stretch;
`;
const Footer = styled.View`
  gap: 8px;
`;
const Skeleton = View;
const SkeletonRow = styled.View`
  flex-direction: row;
  align-self: stretch;
  align-items: center;
  gap: 12px;
`;
