import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import MyLocationIcon from '../assets/my_location.svg';
import { env } from '../../../../../shared/config';
import MapCanvas from '../../native/components/MapCanvas';
import { useCurrentLocation } from '../../location/hooks/useCurrentLocation';
import RoutePlannerSheet from '../components/RoutePlannerSheet';
import RoutePlacePicker from '../components/RoutePlacePicker';
import { type RouteDestination, type RouteMode, type RouteUiState } from '../model/routeUi';
import { canPreviewRoutes, endpointCoordinate, fitRouteCamera, sampleRoute, type RouteEndpoint } from '../model/routePreparation';
import { openNaverRoute } from '../services/openNaverRoute';

type Props = { navigation: { goBack: () => void }; route: { params: { destination: RouteDestination } } };
type Demo = 'off' | 'ready' | 'empty' | 'error';
export default function RoutePlannerScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useCurrentLocation();
  const [destination, setDestination] = useState(route.params.destination);
  // null means current location; manually selected endpoints always carry coordinates.
  const [manualOrigin, setManualOrigin] = useState<RouteEndpoint | null>(null);
  const [mode, setMode] = useState<RouteMode>('transit');
  const [picker, setPicker] = useState<'origin' | 'destination' | null>(null);
  const [showPreviewControls, setShowPreviewControls] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const sheetHeight = Math.min(600, windowHeight * 0.64);
  const [demo, setDemo] = useState<Demo>('off');
  const [demoLoading, setDemoLoading] = useState(false);
  const [detail, setDetail] = useState(false);
  const [opening, setOpening] = useState(false);
  const [mapSize, setMapSize] = useState({ width: 360, height: 260 });
  const previewEnabled = canPreviewRoutes(__DEV__, env.appEnvironment);
  const isDemo = previewEnabled && demo !== 'off';
  useEffect(() => {
    if (!isDemo) { setDemoLoading(false); return; }
    setDemoLoading(true);
    const timer = setTimeout(() => setDemoLoading(false), 400);
    return () => clearTimeout(timer);
  }, [isDemo, demo, mode]);
  const currentOrigin: RouteEndpoint | null = location.status === 'granted' ? {
    placeId: 0, name: t('map.route.myLocation'), latitude: location.coordinate.lat, longitude: location.coordinate.lng,
  } : null;
  const origin = isDemo ? sampleRoute.origin : manualOrigin ?? currentOrigin;
  const target: RouteEndpoint = isDemo ? sampleRoute.destination : destination;
  const state: RouteUiState = !endpointCoordinate(target) ? { kind: 'missing-destination' }
    : isDemo ? demoLoading ? { kind: 'loading' }
      : mode === 'bike' ? { kind: 'unavailable' }
        : demo === 'empty' ? { kind: 'no-route' }
          : demo === 'error' ? { kind: 'error' }
            : { kind: 'ready', preview: { arrival: '14:08', duration: t('map.route.sampleDuration'), distance: '450 m', meta: t('map.route.preview') } }
    : !manualOrigin && location.status === 'loading' ? { kind: 'loading' }
      : !manualOrigin && location.status === 'denied' ? { kind: 'location-denied' }
        : !origin ? { kind: 'location-failed' } : { kind: 'unavailable' };
  const path = isDemo && state.kind === 'ready' ? sampleRoute.path : [];
  const endpoints = [endpointCoordinate(origin), endpointCoordinate(target)].filter((p): p is NonNullable<typeof p> => p !== null);
  const camera = fitRouteCamera(path.length ? path : endpoints, mapSize.width, mapSize.height);
  const buttonStyle = { padding: 10, borderRadius: 12, backgroundColor: theme.colors.surface };
  const external = async () => {
    if (opening || isDemo) return;
    setOpening(true);
    try {
      const result = await openNaverRoute(destination, manualOrigin ?? currentOrigin, mode);
      if (result === 'not-installed') Alert.alert(t('map.route.installTitle'), t('map.route.installBody'), [
        { text: t('map.route.back'), style: 'cancel' },
        { text: t('map.route.install'), onPress: () => void Linking.openURL(Platform.OS === 'ios' ? 'https://apps.apple.com/app/id311867728' : 'https://play.google.com/store/apps/details?id=com.nhn.android.nmap').catch(() => Alert.alert(t('map.route.externalFailed'))) },
        { text: t('map.route.share'), onPress: () => void Share.share({ message: [destination.name, destination.address].filter(Boolean).join('\n') }).catch(() => Alert.alert(t('map.route.externalFailed'))) },
      ]);
      else if (result !== 'opened') Alert.alert(t(result === 'invalid' ? 'map.route.missingTitle' : 'map.route.externalFailed'));
    } finally { setOpening(false); }
  };
  if (picker) return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <RoutePlacePicker onCancel={() => setPicker(null)} onSelect={point => {
      if (picker === 'origin') setManualOrigin(point); else setDestination(point);
      setPicker(null); setDemo('off');
    }} onCurrentLocation={picker === 'origin' ? () => {
      setManualOrigin(null); setPicker(null); setDemo('off'); void location.refresh(true);
    } : undefined} />
  </SafeAreaView>;
  if (detail && state.kind === 'ready') return <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, padding: 24, gap: 20 }}>
    <Pressable accessibilityRole="button" onPress={() => setDetail(false)}><Text style={{ color: theme.colors.primary }}>{t('map.route.back')}</Text></Pressable>
    <Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 24 }}>{t('map.route.detail')}</Text>
    <Text style={{ color: theme.colors.primary }}>{t('map.route.previewHint')}</Text>
    <Text style={{ color: theme.colors.textStrong }}>{origin?.name} → {target.name}</Text>
    <Text style={{ color: theme.colors.textStrong }}>{state.preview.duration} · {state.preview.distance}</Text>
  </SafeAreaView>;
  return <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: theme.colors.backgroundAssistive }}>
    <View style={{ flex: 1, marginBottom: sheetHeight - 36 }} onLayout={e => setMapSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
      <MapCanvas centerLat={camera.lat} centerLng={camera.lng} zoomLevel={camera.zoom} followUser={false}
        routeCoordinates={path}
        markers={endpoints.map((p, i) => ({ ...p, id: `route-${i}`, category: 'etc' as const, caption: i === 0 && origin ? t('map.route.from') : t('map.route.to') }))}
        onMarkerPress={() => undefined} />
      <Pressable accessibilityRole="button" accessibilityLabel={t('map.route.locate')} onPress={() => { setManualOrigin(null); setDemo('off'); void location.refresh(true); }} style={{ ...buttonStyle, position: 'absolute', top: 8, right: 12, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
        <MyLocationIcon />
      </Pressable>
      {isDemo ? <Text style={{ position: 'absolute', top: 12, left: 12, backgroundColor: theme.colors.surface, color: theme.colors.primary, padding: 8 }}>{t('map.route.preview')}</Text> : null}
    </View>
    <View style={{ position: 'absolute', bottom: Math.max(8, insets.bottom), left: 0, right: 0, height: sheetHeight }}>
      <RoutePlannerSheet destination={target} originName={origin?.name} mode={mode} onModeChange={setMode} state={state}
        onTogglePreviewControls={previewEnabled ? () => setShowPreviewControls(value => !value) : undefined}
        onSwap={!isDemo && origin && endpointCoordinate(destination) ? () => { setManualOrigin(destination); setDestination(origin); } : undefined}
        onClose={navigation.goBack} onEditOrigin={() => { setDemo('off'); setPicker('origin'); }} onEditPlaces={() => { setDemo('off'); setPicker('destination'); }}
        onOpenSettings={() => void Linking.openSettings().catch(() => Alert.alert(t('map.route.deniedBody')))}
        onRetry={() => { if (isDemo) { setDemo('ready'); } else void location.refresh(true); }}
        onPreviewAction={() => setDetail(true)} onOpenExternal={isDemo ? undefined : () => void external()} externalBusy={opening}
        onShare={() => void Share.share({ message: [target.name, target.address].filter(Boolean).join('\n') }).catch(() => Alert.alert(t('map.route.externalFailed')))} />
    </View>
    {previewEnabled && showPreviewControls ? <ScrollView horizontal style={{ position: 'absolute', top: 60, left: 8, right: 8, flexGrow: 0 }} contentContainerStyle={{ gap: 8, padding: 8 }}>
      {(['off', 'ready', 'empty', 'error'] as const).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: demo === value }} onPress={() => setDemo(value)} style={buttonStyle}><Text style={{ color: theme.colors.primary }}>{t(`map.route.demo_${value}`)}</Text></Pressable>)}
    </ScrollView> : null}
  </SafeAreaView>;
}
