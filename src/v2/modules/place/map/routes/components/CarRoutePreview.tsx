import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Modal, Pressable, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import NaverMapAdapter from '../../native/components/NaverMapAdapter';
import { DEFAULT_MAP_CENTER } from '../../camera/model/mapCamera';
import type { LocationState } from '../../camera/model/map.types';
import type { NaverMapNativeMarker, NaverMapCameraFit } from '../../../../../shared/native/NaverMapNativeView';
import { useCarRoute } from '../hooks/useCarRoute';
import { endpointCoordinate, fitRoutePreviewCamera } from '../model/routePreparation';
import { routeMetrics } from '../model/routePresentation';
import { Text } from '../../../../../shared/components/Typography';
import { sharePlace } from '../../actions/services/placeActions';
import MapGlassBackdrop from '../../presentation/components/MapGlassBackdrop';
import GlassSurface from '../../presentation/components/GlassSurface';
import RoutePlannerSheet from './RoutePlannerSheet';
import MyLocationIcon from '../assets/my_location.svg';
import BubbleCarIcon from '../assets/bubble_car.svg';
import type { RouteDestination, RouteMode } from '../model/routeUi';
import { openNaverRoute } from '../services/openNaverRoute';

type Props = { destination: RouteDestination; location: LocationState; onClose: () => void; onRefreshLocation: () => void };
export default function CarRoutePreview({ destination, location, onClose, onRefreshLocation }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [sheetHeight, setSheetHeight] = useState(407);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<RouteMode>('car');
  const route = useCarRoute(`${destination.placeId}:${destination.latitude}:${destination.longitude}:${mode}`);
  const [camera, setCamera] = useState<{ center: { lat: number; lng: number }; zoom: number; revision: number; fit?: NaverMapCameraFit }>({ center: endpointCoordinate(destination) ?? DEFAULT_MAP_CENTER, zoom: 14, revision: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const manualCamera = useRef(false);
  const fittedPath = useRef<unknown>(null);
  const fittedEndpoints = useRef(false);
  const mounted = useRef(true);
  const externalBusy = useRef(false);
  const [openingExternal, setOpeningExternal] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const destinationCoordinate = endpointCoordinate(destination);
  const origin = location.status === 'granted' ? { placeId: 0, name: t('routes.origin'), latitude: location.coordinate.lat, longitude: location.coordinate.lng } : null;
  const originCoordinate = endpointCoordinate(origin);
  const ready = mode === 'car' && !!originCoordinate && route.state.kind === 'ready' ? route.state.route : null;
  const markers: NaverMapNativeMarker[] = [];
  if (destinationCoordinate) markers.push({ id: 'route-destination', category: destination.category ?? 'etc', ...destinationCoordinate, caption: t('routes.destination') });

  // Frame the real endpoints without drawing a route before a provider response exists.
  useEffect(() => {
    if (fittedEndpoints.current || manualCamera.current || !viewport.width || !viewport.height || !destinationCoordinate) return;
    fittedEndpoints.current = true;
    const points = originCoordinate ? [originCoordinate, destinationCoordinate] : [destinationCoordinate];
    setCamera(previous => ({ ...fitRoutePreviewCamera(points, viewport.width, viewport.height,
      Math.max(sheetHeight, 494) + Math.max(8, insets.bottom), insets.top), revision: previous.revision + 1 }));
  }, [viewport, sheetHeight, insets, destinationCoordinate, originCoordinate]);


  // One fit per result. A gesture during loading suppresses the asynchronous fit.
  useEffect(() => {
    if (!ready || !viewport.width || !viewport.height || fittedPath.current === ready.path) return;
    fittedPath.current = ready.path;
    if (!manualCamera.current) setCamera(previous => ({ ...fitRoutePreviewCamera(ready.path, viewport.width, viewport.height, sheetHeight + Math.max(8, insets.bottom), insets.top), revision: previous.revision + 1 }));
  }, [ready, viewport, sheetHeight, insets]);
  useEffect(() => {
    if (location.status !== 'granted' || !originCoordinate) route.cancel();
    // Permission loss must dispose the previous path; GPS updates do not trigger new requests.
  }, [location.status, !!originCoordinate]);

  const stateKey = !destinationCoordinate ? 'missing-destination'
    : mode !== 'car' ? 'unsupported'
      : location.status !== 'granted' ? `location-${location.status}` : !originCoordinate ? 'location-failed' : route.state.kind;
  const canRequest = mode === 'car' && !!destinationCoordinate && !!originCoordinate;
  async function openExternal() {
    if (externalBusy.current) return;
    externalBusy.current = true; setOpeningExternal(true);
    try {
      const outcome = await openNaverRoute(destination, originCoordinate ? origin : null, mode);
      if (!mounted.current || outcome === 'opened') return;
      Alert.alert(t(outcome === 'not-installed' ? 'routes.notInstalled'
        : outcome === 'invalid' ? 'routes.states.missing-destination' : 'routes.openFailed'));
    } finally {
      externalBusy.current = false;
      if (mounted.current) setOpeningExternal(false);
    }
  }
  function request() {
    manualCamera.current = false; fittedPath.current = null; setAnchor(null);
    void route.request(origin, destination);
  }
  function fit() {
    manualCamera.current = false;
    setCamera(previous => ({
      ...(ready ? fitRoutePreviewCamera(ready.path, viewport.width, viewport.height, sheetHeight + Math.max(8, insets.bottom), insets.top)
        : { center: originCoordinate ?? destinationCoordinate ?? DEFAULT_MAP_CENTER, zoom: 16 }),
      revision: previous.revision + 1,
    }));
  }
  const metrics = ready ? routeMetrics(ready, i18n.resolvedLanguage ?? 'en', t) : null;
  return <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
    <StatusBar barStyle={theme.colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} onLayout={event => setViewport(event.nativeEvent.layout)}>
      <MapGlassBackdrop active>
        <NaverMapAdapter cameraFit={camera.fit} logoTopMargin={insets.top + 16} cameraRevision={camera.revision} center={camera.center} zoomLevel={camera.zoom}
          userCoordinate={originCoordinate ?? undefined} followUser={false} markers={markers} routeCoordinates={ready?.path}
          onRouteAnchor={setAnchor} onCameraGesture={() => { manualCamera.current = true; setAnchor(null); }} />
        {ready && metrics && anchor && anchor.y > insets.top + 60 && anchor.y < viewport.height - sheetHeight - 70
          && anchor.x > 16 && anchor.x < viewport.width - 120 && <View pointerEvents="none" accessibilityElementsHidden
            style={{ position: 'absolute', left: anchor.x, top: anchor.y - 64 }}>
            <View style={{ backgroundColor: theme.colors.primaryPressed, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><BubbleCarIcon /><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{metrics.duration}</Text></View>
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{t('routes.recommended')}</Text>
            </View>
            <View style={{ width: 10, height: 10, backgroundColor: theme.colors.primaryPressed, transform: [{ rotate: '45deg' }], marginLeft: 14, marginTop: -5 }} />
          </View>}
        <GlassSurface style={{ position: 'absolute', right: 12, top: insets.top + 8, borderRadius: 22 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t(ready ? 'routes.fit' : 'routes.recenter')} onPress={fit}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><MyLocationIcon /></Pressable>
        </GlassSurface>
        <RoutePlannerSheet destination={destination} mode={mode} stateKey={stateKey} ready={ready}
          bottomInset={insets.bottom} maxHeight={Math.max(240, viewport.height - insets.top - 70)}
          onLayout={event => setSheetHeight(event.nativeEvent.layout.height)} hasOrigin={!!originCoordinate}
          canRequest={canRequest} canOpenExternal={!!destinationCoordinate && !openingExternal}
          deniedPermanently={location.status === 'denied' && !location.canAskAgain}
          onMode={value => { if (mode !== value) { route.cancel(); setAnchor(null); setMode(value); } }}
          onClose={onClose} onShare={() => { if (destinationCoordinate) void sharePlace({ ...destination, latitude: destinationCoordinate.lat, longitude: destinationCoordinate.lng }); }}
          onRequest={request} onCancel={route.cancel} onRefreshLocation={onRefreshLocation}
          onSettings={() => { void Linking.openSettings().catch(() => undefined); }} onExternal={() => { void openExternal(); }} />
      </MapGlassBackdrop>
    </View>
  </Modal>;
}
