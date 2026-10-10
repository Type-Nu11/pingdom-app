import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import GlassSurface from '../../presentation/components/GlassSurface';
import type { Coordinate } from '../../camera/model/map.types';
import type { RouteState } from '../model/routeState';
import { destinationDistance } from '../model/routeTracking';
import { routeMetrics } from '../model/routePresentation';
import { formatDistance } from '../../../../../shared/i18n/formatters';
import CarIcon from '../assets/bubble_car.svg';

type Props = {
  name: string; destination: Coordinate; coordinate: Coordinate | null; state: RouteState; arrived: boolean;
  following: boolean; topInset: number; bottomInset: number; maxHeight: number; deniedPermanently: boolean;
  onStop: () => void; onFollow: () => void; onRefresh: () => void; onSettings: () => void;
};

/** Map-first driving view. Only provider totals and actual GPS distance are shown. */
export default function RouteTrackingSheet(props: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const language = i18n.resolvedLanguage ?? 'en';
  const loading = props.state.kind === 'loading';
  const failed = props.state.kind !== 'ready' && !loading;
  const title = props.arrived ? 'arrived' : loading ? 'loading' : failed ? 'failed' : props.coordinate ? 'active' : 'paused';
  const metrics = props.state.kind === 'ready' ? routeMetrics(props.state.route, language, t) : null;
  const distance = props.coordinate ? formatDistance(destinationDistance(props.coordinate, props.destination), language) : null;
  function action(key: string, testID: string, onPress: () => void) {
    return <Pressable testID={testID} accessibilityRole="button" onPress={onPress}
      style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 22, backgroundColor: theme.colors.surfaceMuted }}>
      <Text style={{ color: theme.colors.textStrong, textAlign: 'center', fontWeight: '600' }}>{t(key === 'settings' ? 'routes.settings' : `routes.tracking.${key}`)}</Text>
    </Pressable>;
  }
  return <>
    <View testID="route-tracking-guidance" style={{ position: 'absolute', left: 12, right: 76, top: props.topInset + 8,
      borderRadius: 24, backgroundColor: theme.colors.primary, maxHeight: props.maxHeight * 0.45, boxShadow: theme.liquidGlass.sheet.shadow }}>
      <ScrollView bounces={false} contentContainerStyle={{ padding: 18, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 32, height: 32, borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' }}><CarIcon /></View>
          <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={{ flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{t(`routes.tracking.${title}`)}</Text>
        </View>
        {loading && <ActivityIndicator color="#FFFFFF" />}
        {!loading && failed && <Text style={{ color: '#FFFFFF' }}>{t(`routes.states.${props.state.kind}`)}</Text>}
        {!props.arrived && distance && !failed && !loading && <View testID="route-tracking-distance" accessible
          accessibilityLabel={t('routes.tracking.distance', { distance })}>
          <Text style={{ color: '#FFFFFF', fontSize: 36, lineHeight: 44, fontWeight: '700' }}>{distance}</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{t('routes.tracking.distanceLabel')}</Text>
        </View>}
      </ScrollView>
    </View>
    <GlassSurface testID="route-tracking-sheet" style={{ position: 'absolute', left: 8, right: 8,
      bottom: Math.max(8, props.bottomInset), borderRadius: 28, maxHeight: props.maxHeight * 0.45 }}>
      <ScrollView bounces={false} contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Text numberOfLines={2} style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '600' }}>{props.name}</Text>
        {metrics && !props.arrived && <View testID="route-tracking-summary" style={{ gap: 2 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>{t('routes.tracking.estimate')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ color: theme.colors.textStrong, fontSize: 24, fontWeight: '700' }}>{metrics.duration}</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 18 }}>{metrics.distance}</Text>
          </View>
        </View>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {!props.arrived && !props.coordinate && props.deniedPermanently && action('settings', 'route-tracking-settings', props.onSettings)}
          {!props.arrived && !props.coordinate && action('refresh', 'route-tracking-refresh', props.onRefresh)}
          {!props.arrived && props.coordinate && props.state.kind === 'ready' && !props.following && action('follow', 'route-tracking-follow', props.onFollow)}
          {action(props.arrived ? 'done' : 'stop', 'route-tracking-stop', props.onStop)}
        </View>
      </ScrollView>
    </GlassSurface>
  </>;
}
