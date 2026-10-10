import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Modal, Pressable, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import NaverMapAdapter from '../../native/components/NaverMapAdapter';
import { DEFAULT_MAP_CENTER } from '../../camera/model/mapCamera';
import type { Coordinate, LocationState } from '../../camera/model/map.types';
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
import RouteEndpointEditor from './RouteEndpointEditor';
import RouteTrackingSheet from './RouteTrackingSheet';
import { useRouteTracking } from '../hooks/useRouteTracking';
import type { EndpointRole } from './RouteEndpointRows';
import type { RecentSearchOwner } from '../../../search/services/recentSearchStorage';
import MapPickerPin from '../assets/map_picker_pin.svg';

// Figma 8892:11154: the plain pin silhouette, displayed at 24 px wide.
const MAP_PICKER_PIN_WIDTH = 24;
const MAP_PICKER_PIN_HEIGHT = 45.7139 * (24 / 40);

type Props = { initialEndpointRole?: EndpointRole; destination: RouteDestination; location: LocationState; onClose: () => void; onRefreshLocation: () => void; recentSearchOwner?: RecentSearchOwner };
export default function CarRoutePreview({ initialEndpointRole = 'destination', destination: initialDestination, location, onClose, onRefreshLocation, recentSearchOwner }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [sheetHeight, setSheetHeight] = useState(407);
  const [bubbleSize, setBubbleSize] = useState({ width: 120, height: 64 });
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const tracking = useRouteTracking(location);
  const [following, setFollowing] = useState(true);
  const [mode, setMode] = useState<RouteMode>('car');
  // A null selection means live current location, in either endpoint slot.
  const [selections, setSelections] = useState<[RouteDestination | null, RouteDestination | null]>(() => initialEndpointRole === 'origin' ? [initialDestination, null] : [null, initialDestination]);
  const [endpointRevision, setEndpointRevision] = useState(0);
  const [editing, setEditing] = useState<EndpointRole | null>(null);
  const [mapPicking, setMapPicking] = useState(false);
  const [camera, setCamera] = useState<{ center: { lat: number; lng: number }; zoom: number; revision: number; fit?: NaverMapCameraFit }>({ center: endpointCoordinate(initialDestination) ?? DEFAULT_MAP_CENTER, zoom: 14, revision: 0 });
  const [mapPoint, setMapPoint] = useState(camera.center);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const manualCamera = useRef(false);
  const fittedPath = useRef<unknown>(null);
  const trackingCenter = useRef<Coordinate | null>(null);
  const fittedEndpoints = useRef(false);
  const mounted = useRef(true);
  const externalBusy = useRef(false);
  const [openingExternal, setOpeningExternal] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const currentPoint: RouteDestination | null = location.status === 'granted' ? { placeId: 0, name: t('routes.currentLocation'), isCurrentLocation: true, latitude: location.coordinate.lat, longitude: location.coordinate.lng } : null;
  const origin = selections[0] ?? currentPoint;
  const destination = selections[1] ?? currentPoint;
  const destinationCoordinate = endpointCoordinate(destination);
  const originCoordinate = endpointCoordinate(origin);
  // Live GPS may occupy either endpoint. Discard results for old coordinates
  // without querying again, while preserving routes between selected places.
  const route = useCarRoute(`${endpointRevision}:${mode}:${originCoordinate?.lat}:${originCoordinate?.lng}:${destinationCoordinate?.lat}:${destinationCoordinate?.lng}`);
  const ready = mode === 'car' && !!originCoordinate && route.state.kind === 'ready' ? route.state.route : null;
  const markers: NaverMapNativeMarker[] = [];
  if (destinationCoordinate) markers.push({ id: 'route-destination', category: destination?.category ?? 'etc', ...destinationCoordinate, caption: t('routes.destination') });
  if (originCoordinate && !origin?.isCurrentLocation) markers.push({ id: 'route-origin', category: origin?.category ?? 'etc', ...originCoordinate, caption: t('routes.origin') });

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
    if (tracking.tracking || !ready || !viewport.width || !viewport.height || fittedPath.current === ready.path) return;
    fittedPath.current = ready.path;
    if (!manualCamera.current) setCamera(previous => ({ ...fitRoutePreviewCamera(ready.path, viewport.width, viewport.height, sheetHeight + Math.max(8, insets.bottom), insets.top), revision: previous.revision + 1 }));
  }, [ready, viewport, sheetHeight, insets, tracking.tracking]);
  useEffect(() => {
    if (selections.some(point => point === null) && (location.status !== 'granted' || !endpointCoordinate(currentPoint))) route.cancel();
    // Permission loss must dispose the previous path; GPS updates do not trigger new requests.
  }, [location.status, !!endpointCoordinate(currentPoint), selections]);

  const stateKey = !destinationCoordinate ? 'missing-destination'
    : mode !== 'car' ? 'unsupported'
      : !originCoordinate ? location.status !== 'granted' ? `location-${location.status}` : 'location-failed' : route.state.kind;
  const canRequest = mode === 'car' && !!destinationCoordinate && !!originCoordinate;
  async function openExternal() {
    if (externalBusy.current) return;
    externalBusy.current = true; setOpeningExternal(true);
    try {
      if (!destination) return;
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
  useEffect(() => {
    if (canRequest && !tracking.tracking) request();
    // Query on entry, mode/endpoint selection, or when missing coordinates become
    // available. GPS updates alone discard stale results without repeated requests.
    // A result, error or cancellation must not restart this effect.
  }, [mode, endpointRevision, canRequest, !!tracking.tracking]);
  const canStart = !!currentPoint && !!endpointCoordinate(currentPoint) && !!destinationCoordinate && !destination?.isCurrentLocation;
  function startTracking() {
    if (!canStart || !currentPoint || !destination) return;
    setFollowing(true); setAnchor(null);
    setCamera(previous => ({ center: endpointCoordinate(currentPoint)!, zoom: 16, revision: previous.revision + 1 }));
    tracking.start(currentPoint, destination, origin?.isCurrentLocation ? ready ?? undefined : undefined);
  }
  function resumeFollowing() {
    setFollowing(true);
    if (tracking.coordinate) setCamera(previous => ({ center: tracking.coordinate!, zoom: 16, revision: previous.revision + 1 }));
  }
  function changeEndpoints(next: [RouteDestination | null, RouteDestination | null]) {
    route.cancel(); setAnchor(null); fittedPath.current = null;
    fittedEndpoints.current = false; manualCamera.current = false;
    setSelections(next); setEndpointRevision(value => value + 1);
  }
  function selectEndpoint(point: RouteDestination | null) {
    const next: typeof selections = [...selections];
    next[editing === 'origin' ? 0 : 1] = point;
    changeEndpoints(next); setEditing(null); setMapPicking(false);
  }
  function shareDestination() {
    if (destination && destinationCoordinate) void sharePlace({ ...destination, latitude: destinationCoordinate.lat, longitude: destinationCoordinate.lng });
  }
  function fit() {
    if (tracking.tracking) { resumeFollowing(); return; }
    manualCamera.current = false;
    setCamera(previous => ({
      ...(ready ? fitRoutePreviewCamera(ready.path, viewport.width, viewport.height, sheetHeight + Math.max(8, insets.bottom), insets.top)
        : { center: originCoordinate ?? destinationCoordinate ?? DEFAULT_MAP_CENTER, zoom: 16 }),
      revision: previous.revision + 1,
    }));
  }
  const tracked = tracking.tracking;
  if (!tracked) trackingCenter.current = null;
  else if (following && tracking.coordinate) trackingCenter.current = tracking.coordinate;
  const trackingDestination = endpointCoordinate(tracked?.destination ?? null);
  const displayedPath = tracked ? tracked.state.kind === 'ready' ? tracked.state.route.path : undefined : ready?.path;
  const displayedMarkers = tracked && trackingDestination
    ? [{ id: 'route-destination', category: tracked.destination.category ?? 'etc', ...trackingDestination, caption: t('routes.destination') }] : markers;
  const metrics = ready ? routeMetrics(ready, i18n.resolvedLanguage ?? 'en', t) : null;
  const visibleSheetHeight = editing ? Math.min(558, Math.max(240, viewport.height - insets.top - 70)) : sheetHeight;
  const bubbleLeft = anchor ? Math.max(16, Math.min(anchor.x - 19, viewport.width - bubbleSize.width - 16)) : 16;
  return <Modal visible animationType="slide" onRequestClose={() => { if (mapPicking) setMapPicking(false); else if (editing) setEditing(null); else onClose(); }} statusBarTranslucent navigationBarTranslucent>
    <StatusBar barStyle={theme.colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} onLayout={event => setViewport(event.nativeEvent.layout)}>
      <MapGlassBackdrop active>
        <NaverMapAdapter cameraFit={camera.fit} logoTopMargin={insets.top + 16} cameraRevision={camera.revision} center={tracked && following ? trackingCenter.current ?? camera.center : camera.center} zoomLevel={camera.zoom}
          userCoordinate={tracked ? tracking.coordinate ?? undefined : endpointCoordinate(currentPoint) ?? undefined}
          followUser={!!tracked && tracked.state.kind === 'ready' && !tracked.arrived && following && !!tracking.coordinate}
          markers={displayedMarkers} routeCoordinates={displayedPath}
          onCameraIdle={setMapPoint}
          onRouteAnchor={setAnchor} onCameraGesture={() => { manualCamera.current = true; setFollowing(false); setAnchor(null); }} />
        {!tracked && !mapPicking && ready && metrics && anchor && anchor.y > insets.top + bubbleSize.height + 8 && anchor.y < viewport.height - visibleSheetHeight - Math.max(8, insets.bottom) - 12
          && anchor.x > 16 && anchor.x < viewport.width - 16 && <View pointerEvents="none" accessibilityElementsHidden
            onLayout={event => { const { width, height } = event.nativeEvent.layout; setBubbleSize(previous => previous.width === width && previous.height === height ? previous : { width, height }); }}
            style={{ position: 'absolute', left: bubbleLeft, top: anchor.y - bubbleSize.height, maxWidth: viewport.width - 32 }}>
            <View style={{ backgroundColor: theme.colors.primaryAlternative, borderRadius: 16, paddingLeft: 10, paddingRight: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6, boxShadow: '0px 8px 10px rgba(255,25,86,0.08), 0px 2px 3px rgba(255,25,86,0.08)' }}>
              <BubbleCarIcon /><View><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{metrics.duration}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>{t('routes.optimalRoute')}</Text></View>
            </View>
            <View style={{ width: 10, height: 10, backgroundColor: theme.colors.primaryAlternative, transform: [{ rotate: '45deg' }], marginLeft: Math.max(14, Math.min(anchor.x - bubbleLeft - 5, bubbleSize.width - 20)), marginTop: -5 }} />
          </View>}
        <GlassSurface style={{ position: 'absolute', right: 12, top: insets.top + 8, borderRadius: 22 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t(tracked ? 'routes.tracking.follow' : ready ? 'routes.fit' : 'routes.recenter')} onPress={fit}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><MyLocationIcon /></Pressable>
        </GlassSurface>
        {tracked && trackingDestination ? <RouteTrackingSheet name={tracked.destination.name} destination={trackingDestination}
          coordinate={tracking.coordinate} state={tracked.state} arrived={tracked.arrived} following={following}
          topInset={insets.top} bottomInset={insets.bottom} maxHeight={Math.max(240, viewport.height - insets.top - insets.bottom - 24)}
          deniedPermanently={location.status === 'denied' && !location.canAskAgain}
          onStop={tracking.stop} onFollow={resumeFollowing}
          onRefresh={onRefreshLocation} onSettings={() => { void Linking.openSettings().catch(() => undefined); }} /> : mapPicking ? <>
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
            style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -MAP_PICKER_PIN_WIDTH / 2,
              marginTop: -MAP_PICKER_PIN_HEIGHT }}>
            <MapPickerPin width={MAP_PICKER_PIN_WIDTH} height={MAP_PICKER_PIN_HEIGHT} />
          </View>
          <GlassSurface style={{ position: 'absolute', left: 8, right: 8, bottom: Math.max(insets.bottom, 8), borderRadius: 24, padding: 16, gap: 12 }}>
            <Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 18, fontWeight: '700' }}>{t('routes.editor.mapHint')}</Text>
            <Pressable testID="route-map-confirm" accessibilityRole="button" accessibilityLabel={t('routes.editor.confirmMap')}
              onPress={() => selectEndpoint({ placeId: 0, name: t('routes.editor.mapPoint'), latitude: mapPoint.lat, longitude: mapPoint.lng })}
              style={{ minHeight: 44, justifyContent: 'center', borderRadius: 16, backgroundColor: theme.colors.primary }}><Text style={{ color: '#FFFFFF', textAlign: 'center' }}>{t('routes.editor.confirmMap')}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t('routes.cancel')} onPress={() => setMapPicking(false)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.colors.textStrong, textAlign: 'center' }}>{t('routes.cancel')}</Text></Pressable>
          </GlassSurface>
        </> : editing ? <RouteEndpointEditor role={editing} origin={origin} destination={destination} recentSearchOwner={recentSearchOwner}
          bottomInset={insets.bottom} maxHeight={Math.max(240, viewport.height - insets.top - 70)} onRole={setEditing}
          onClose={() => setEditing(null)} onShare={shareDestination} onSelect={selectEndpoint} onRefreshLocation={onRefreshLocation}
          onMap={() => setMapPicking(true)} /> : <RoutePlannerSheet origin={origin} destination={destination} mode={mode} stateKey={stateKey} ready={ready}
          bottomInset={insets.bottom} maxHeight={Math.max(240, viewport.height - insets.top - 70)}
          onLayout={event => setSheetHeight(event.nativeEvent.layout.height)} hasOrigin={!!originCoordinate}
          canRequest={canRequest} canOpenExternal={!!destinationCoordinate && !openingExternal}
          deniedPermanently={location.status === 'denied' && !location.canAskAgain}
          onMode={value => {
            if (mode !== value) { route.cancel(); setAnchor(null); setMode(value); }
            else if (value === 'car' && canRequest && route.state.kind !== 'loading' && route.state.kind !== 'ready') request();
          }}
          onEditEndpoint={setEditing} onSwapEndpoints={() => changeEndpoints([selections[1], selections[0]])}
          onClose={onClose} onShare={shareDestination}
          canStart={canStart} onStart={startTracking}
          onRequest={request} onCancel={route.cancel} onRefreshLocation={onRefreshLocation}
          onSettings={() => { void Linking.openSettings().catch(() => undefined); }} onExternal={() => { void openExternal(); }} />}
      </MapGlassBackdrop>
    </View>
  </Modal>;
}
