import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Modal, Pressable, StatusBar, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import NaverMapAdapter from '../../native/components/NaverMapAdapter';
import { DEFAULT_MAP_CENTER } from '../../camera/model/mapCamera';
import type { Coordinate, LocationState } from '../../camera/model/map.types';
import type { NaverMapNativeMarker, NaverMapCameraFit } from '../../../../../shared/native/NaverMapNativeView';
import { useCarRoute } from '../hooks/useCarRoute';
import { useWalkingRoute } from '../hooks/useWalkingRoute';
import { useTransitRoute } from '../hooks/useTransitRoute';
import type { TransitRoute } from '../api/transitRoutesApi';
import { transitMapSegments } from '../model/transitPresentation';
import { endpointCoordinate, fitRoutePreviewCamera } from '../model/routePreparation';
import { routeMetrics } from '../model/routePresentation';
import { trackingStartIssue } from '../model/routeTracking';
import { Text } from '../../../../../shared/components/Typography';
import { sharePlace } from '../../actions/services/placeActions';
import MapGlassBackdrop from '../../presentation/components/MapGlassBackdrop';
import GlassSurface from '../../presentation/components/GlassSurface';
import RoutePlannerSheet from './RoutePlannerSheet';
import MyLocationIcon from '../assets/my_location.svg';
import { RouteTimeBubble } from './RouteTimeBubble';
import type { RouteDestination, RouteMode } from '../model/routeUi';
import { openNaverRoute } from '../services/openNaverRoute';
import RouteEndpointEditor from './RouteEndpointEditor';
import RouteTrackingSheet from './RouteTrackingSheet';
import { useRouteTracking } from '../hooks/useRouteTracking';
import type { EndpointRole } from './RouteEndpointRows';
import type { RecentSearchOwner } from '../../../search/services/recentSearchStorage';
import RouteNotice from './RouteNotice';
import { getCurrentLocation } from '../../location/services/locationService';
import MapPickerPin from '../assets/map_picker_pin.svg';

// Figma 8892:11154: the plain pin silhouette, displayed at 24 px wide.
const MAP_PICKER_PIN_WIDTH = 24;
const MAP_PICKER_PIN_HEIGHT = 45.7139 * (24 / 40);

type Props = { initialEndpointRole?: EndpointRole; destination: RouteDestination | null; location: LocationState; onClose: () => void; onRefreshLocation: () => void; recentSearchOwner?: RecentSearchOwner };
export default function CarRoutePreview({ initialEndpointRole = 'destination', destination: initialDestination, location, onClose, onRefreshLocation, recentSearchOwner }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [sheetHeight, setSheetHeight] = useState(407);
  const [bubbleSize, setBubbleSize] = useState({ width: 120, height: 64 });
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const tracking = useRouteTracking(location);
  const [notice, setNotice] = useState<{ message: string; detail?: string; busy?: boolean; recovery?: 'retry' | 'permission' | 'settings' } | null>(null);
  const startGeneration = useRef(0);
  const starting = useRef(false);
  function closeNotice() { startGeneration.current += 1; starting.current = false; setNotice(null); }
  const [following, setFollowing] = useState(true);
  const [mode, setMode] = useState<RouteMode>('car');
  const currentPoint: RouteDestination | null = location.status === 'granted' ? { placeId: 0, name: t('routes.currentLocation'), isCurrentLocation: true, latitude: location.coordinate.lat, longitude: location.coordinate.lng } : null;
  function snapshotCurrentLocation(): RouteDestination | null {
    return endpointCoordinate(currentPoint) ? { ...currentPoint!, isCurrentLocation: false, name: t('routes.selectedLocation') } : null;
  }
  // Null means an empty field. Only an explicit current-location marker follows GPS.
  const currentSelection: RouteDestination = { placeId: 0, name: t('routes.currentLocation'), isCurrentLocation: true };
  // Departing from a place keeps it as the origin and leaves the destination for the user to pick.
  const departsFromPlace = !!initialDestination && initialEndpointRole === 'origin';
  const [selections, setSelections] = useState<[RouteDestination | null, RouteDestination | null]>(() => !initialDestination
    ? [null, null] : departsFromPlace ? [initialDestination, null] : [currentSelection, initialDestination]);
  const [endpointRevision, setEndpointRevision] = useState(0);
  // Figma 8892:11110: the departure entry opens straight into the destination editor.
  const [editing, setEditing] = useState<EndpointRole | null>(departsFromPlace ? 'destination' : null);
  const [mapPicking, setMapPicking] = useState(false);
  const [camera, setCamera] = useState<{ center: { lat: number; lng: number }; zoom: number; revision: number; fit?: NaverMapCameraFit }>({ center: endpointCoordinate(initialDestination) ?? endpointCoordinate(currentPoint) ?? DEFAULT_MAP_CENTER, zoom: 14, revision: 0 });
  const [mapPoint, setMapPoint] = useState(camera.center);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const manualCamera = useRef(false);
  const fittedPath = useRef<unknown>(null);
  const trackingCenter = useRef<Coordinate | null>(null);
  const fittedEndpoints = useRef(false);
  const mounted = useRef(true);
  const externalBusy = useRef(false);
  const [openingExternal, setOpeningExternal] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; startGeneration.current += 1; }; }, []);
  const origin = selections[0]?.isCurrentLocation ? currentPoint : selections[0];
  const destination = selections[1]?.isCurrentLocation ? snapshotCurrentLocation() : selections[1];
  useEffect(() => {
    if (selections[1]?.isCurrentLocation && destination) setSelections(previous => previous[1]?.isCurrentLocation ? [previous[0], destination] : previous);
  }, [selections, destination]);
  const destinationCoordinate = endpointCoordinate(destination);
  const originCoordinate = endpointCoordinate(origin);
  // GPS changes invalidate only a live origin; fixed endpoints retain their route.
  const selectionKey = `${endpointRevision}:${mode}:${originCoordinate?.lat}:${originCoordinate?.lng}:${destinationCoordinate?.lat}:${destinationCoordinate?.lng}`;
  const cooldown = useRef({ retryAt: 0 });
  const route = useCarRoute(selectionKey, cooldown.current);
  const transit = useTransitRoute(selectionKey, cooldown.current);
  const walking = useWalkingRoute(selectionKey, cooldown.current);
  const walkResult = mode === 'walk' && originCoordinate && walking.state.kind === 'ready' ? walking.state.route : null;
  const walkEstimateAt = useMemo(() => walkResult ? Date.now() : undefined, [walkResult]);
  const [transitSelection, setTransitSelection] = useState<{ source: TransitRoute; index: number } | null>(null);
  const transitResult = mode === 'transit' && originCoordinate && transit.state.kind === 'ready' ? transit.state.route : null;
  const transitEstimateAt = useMemo(() => transitResult ? Date.now() : undefined, [transitResult]);
  const transitIndex = transitResult && transitSelection?.source === transitResult ? transitSelection.index : 0;
  const itinerary = transitResult?.itineraries[transitIndex];
  const transitSegments = useMemo(() => itinerary ? transitMapSegments(itinerary) : undefined, [itinerary]);
  const ready = mode === 'car' && !!originCoordinate && route.state.kind === 'ready' ? route.state.route : null;
  const preview = useMemo(() => ready ?? walkResult ?? (itinerary ? { distanceMeters: itinerary.distanceMeters,
    durationSeconds: itinerary.durationSeconds, path: transitSegments!.flatMap(segment => segment.path) } : null), [ready, walkResult, itinerary, transitSegments]);
  const activeState = mode === 'transit' ? transit.state : mode === 'walk' ? walking.state : route.state;
  function cancelRequests() { route.cancel(); transit.cancel(); walking.cancel(); }
  const markers: NaverMapNativeMarker[] = [];
  if (destinationCoordinate) markers.push({ id: 'route-destination', category: destination?.category ?? 'etc', ...destinationCoordinate, caption: t('routes.destination') });
  if (originCoordinate && !origin?.isCurrentLocation) markers.push({ id: 'route-origin', category: origin?.category ?? 'etc', ...originCoordinate, caption: t('routes.origin') });
  itinerary?.legs.forEach((leg, index) => {
    for (const [role, stop] of [['start', leg.start], ['end', leg.end]] as const) {
      if (stop?.coordinate) markers.push({ id: `transit-${index}-${role}`, category: 'etc', ...stop.coordinate, caption: stop.name });
    }
  });

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
    if (tracking.tracking || !preview?.path.length || !viewport.width || !viewport.height || fittedPath.current === preview.path) return;
    fittedPath.current = preview.path;
    if (!manualCamera.current) setCamera(previous => ({ ...fitRoutePreviewCamera(preview.path, viewport.width, viewport.height, sheetHeight + Math.max(8, insets.bottom), insets.top), revision: previous.revision + 1 }));
  }, [preview, viewport, sheetHeight, insets, tracking.tracking]);
  useEffect(() => {
    if (selections.some(point => point?.isCurrentLocation) && (location.status !== 'granted' || !endpointCoordinate(currentPoint))) cancelRequests();
    // Permission loss must dispose the previous path; GPS updates do not trigger new requests.
  }, [location.status, !!endpointCoordinate(currentPoint), selections]);

  const stateKey = !selections[0] || !selections[1] ? 'empty' : !destinationCoordinate ? 'missing-destination'
    : mode === 'bike' ? 'unsupported'
      : !originCoordinate ? location.status !== 'granted' ? `location-${location.status}` : 'location-failed' : activeState.kind;
  const canRequest = (mode !== 'bike') && !!destinationCoordinate && !!originCoordinate;
  async function openExternal() {
    if (externalBusy.current) return;
    externalBusy.current = true; setOpeningExternal(true);
    try {
      if (!destination) return;
      const outcome = await openNaverRoute(destination, originCoordinate ? origin : null, mode);
      if (!mounted.current || outcome === 'opened') return;
      setNotice({ message: t(outcome === 'not-installed' ? 'routes.notInstalled'
        : outcome === 'invalid' ? 'routes.states.missing-destination' : 'routes.openFailed') });
    } finally {
      externalBusy.current = false;
      if (mounted.current) setOpeningExternal(false);
    }
  }
  function request() {
    manualCamera.current = false; fittedPath.current = null; setAnchor(null);
    if (mode === 'transit') void transit.request(origin, destination);
    else if (mode === 'walk') void walking.request(origin, destination);
    else if (mode === 'car') void route.request(origin, destination);
  }
  useEffect(() => {
    if (canRequest && !tracking.tracking) request();
    // Query on entry, mode/endpoint selection, or when missing coordinates become
    // available. GPS updates alone discard stale results without repeated requests.
    // A result, error or cancellation must not restart this effect.
  }, [mode, endpointRevision, canRequest, !!tracking.tracking]);
  async function startTracking(forceRefresh = false) {
    if (starting.current || !preview?.path.length || mode === 'bike' || !origin || !originCoordinate || !destination || !destinationCoordinate) return;
    const presentation = { mode, routeSegments: mode === 'transit' ? transitSegments : undefined, markers };
    const generation = ++startGeneration.current;
    let currentLocation = location;
    let refreshed = false;
    let issue = trackingStartIssue(currentLocation, originCoordinate, Date.now());
    function startFromOrigin() {
      closeNotice();
      setFollowing(true); setAnchor(null);
      setCamera(previous => ({ center: originCoordinate!, zoom: 16, revision: previous.revision + 1 }));
      tracking.start(origin!, destination!, preview!, undefined, originCoordinate!, presentation);
    }
    // A selected origin is a valid assumed starting point, even without live GPS.
    if (!origin.isCurrentLocation && issue) {
      startFromOrigin();
      return;
    }
    if (location.status === 'granted' && (forceRefresh || (issue && issue !== 'away'))) {
      starting.current = true;
      setNotice({ busy: true, message: t('routes.tracking.startChecking') });
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        refreshed = true;
        currentLocation = await Promise.race([
          getCurrentLocation(false, true),
          new Promise<LocationState>(resolve => {
            timer = setTimeout(() => resolve({ status: 'failed', coordinate: null, canAskAgain: true }), 12_000);
          }),
        ]);
      } catch { currentLocation = { status: 'failed', coordinate: null, canAskAgain: true }; } finally { if (timer) clearTimeout(timer); }
      if (!mounted.current || generation !== startGeneration.current) return;
      starting.current = false;
      issue = trackingStartIssue(currentLocation, originCoordinate, Date.now());
    }
    if (issue === 'away') { startFromOrigin(); return; }
    if (issue) {
      const point = currentLocation.status === 'granted' ? currentLocation.coordinate : null;
      const ageSeconds = point ? Math.max(0, Math.round((Date.now() - Date.parse(point.observedAt ?? '')) / 1000)) : NaN;
      const accuracy = point?.accuracyMeters;
      const detail = issue === 'stale' && Number.isFinite(ageSeconds)
        ? t('routes.tracking.locationAge', { seconds: ageSeconds })
        : issue === 'accuracy' && typeof accuracy === 'number' && Number.isFinite(accuracy) && accuracy >= 0
          ? t('routes.tracking.locationAccuracy', { meters: Math.ceil(accuracy) }) : undefined;
      setNotice({ message: t(`routes.tracking.startProblems.${issue}`),
        detail, recovery: currentLocation.status === 'denied' ? currentLocation.canAskAgain ? 'permission' : 'settings' : 'retry' });
      return;
    }
    setNotice(null);
    setFollowing(true); setAnchor(null);
    const coordinate = currentLocation.status === 'granted' ? currentLocation.coordinate : undefined;
    setCamera(previous => ({ center: coordinate!, zoom: 16, revision: previous.revision + 1 }));
    tracking.start(origin, destination, preview, refreshed ? coordinate : undefined, undefined, presentation);
  }
  function resumeFollowing() {
    setFollowing(true);
    if (tracking.coordinate) setCamera(previous => ({ center: tracking.coordinate!, zoom: 16, revision: previous.revision + 1 }));
  }
  function changeEndpoints(next: [RouteDestination | null, RouteDestination | null]) {
    closeNotice();
    cancelRequests(); setAnchor(null); fittedPath.current = null;
    fittedEndpoints.current = false; manualCamera.current = false;
    setSelections([next[0], next[1]?.isCurrentLocation ? snapshotCurrentLocation() ?? next[1] : next[1]]); setEndpointRevision(value => value + 1);
  }
  function selectEndpoint(point: RouteDestination | null) {
    const next: typeof selections = [...selections];
    next[editing === 'origin' ? 0 : 1] = point ?? currentSelection;
    changeEndpoints(next); setEditing(null); setMapPicking(false);
  }
  function shareDestination() {
    if (destination && destinationCoordinate) void sharePlace({ ...destination, latitude: destinationCoordinate.lat, longitude: destinationCoordinate.lng });
  }
  function fit() {
    if (tracking.tracking) { resumeFollowing(); return; }
    manualCamera.current = false;
    setCamera(previous => ({
      ...(preview?.path.length ? fitRoutePreviewCamera(preview.path, viewport.width, viewport.height, sheetHeight + Math.max(8, insets.bottom), insets.top)
        : { center: originCoordinate ?? destinationCoordinate ?? DEFAULT_MAP_CENTER, zoom: 16 }),
      revision: previous.revision + 1,
    }));
  }
  const tracked = tracking.tracking;
  if (!tracked) trackingCenter.current = null;
  else if (following && tracking.coordinate) trackingCenter.current = tracking.coordinate;
  const trackingDestination = endpointCoordinate(tracked?.destination ?? null);
  const displayedPath = tracked ? tracked.state.kind === 'ready' && tracked.presentation?.mode !== 'transit' ? tracked.state.route.path : undefined : (ready ?? walkResult)?.path;
  const displayedMarkers = tracked?.presentation?.markers ?? (tracked && trackingDestination
    ? [{ id: 'route-destination', category: tracked.destination.category ?? 'etc', ...trackingDestination, caption: t('routes.destination') }] : markers);
  const metrics = preview ? routeMetrics(preview, i18n.resolvedLanguage ?? 'en', t) : null;
  const walkMetrics = walkResult ? routeMetrics(walkResult, i18n.resolvedLanguage ?? 'en', t) : null;
  const visibleSheetHeight = editing ? Math.min(558, Math.max(240, viewport.height - insets.top - 70)) : sheetHeight;
  const bubbleLeft = anchor ? Math.max(16, Math.min(anchor.x - 19, viewport.width - bubbleSize.width - 16)) : 16;
  return <Modal visible animationType="slide" onRequestClose={() => { if (notice) closeNotice(); else if (mapPicking) setMapPicking(false); else if (editing) setEditing(null); else onClose(); }} statusBarTranslucent navigationBarTranslucent>
    <StatusBar barStyle={theme.colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
    <View style={{ flex: 1, backgroundColor: theme.colors.background }} onLayout={event => setViewport(event.nativeEvent.layout)}>
      <View style={{ flex: 1 }} pointerEvents={notice ? 'none' : 'auto'} accessibilityElementsHidden={!!notice}
        importantForAccessibility={notice ? 'no-hide-descendants' : 'auto'}>
      <MapGlassBackdrop active>
        <NaverMapAdapter cameraFit={camera.fit} logoTopMargin={insets.top + 16} cameraRevision={camera.revision} center={tracked && following ? trackingCenter.current ?? camera.center : camera.center} zoomLevel={camera.zoom}
          userCoordinate={tracked ? tracking.coordinate ?? undefined : endpointCoordinate(currentPoint) ?? undefined}
          followUser={!!tracked && !tracked.previewOrigin && tracked.state.kind === 'ready' && !tracked.arrived && following && !!tracking.coordinate}
          markers={displayedMarkers} routeCoordinates={displayedPath} routeSegments={tracked ? tracked.presentation?.routeSegments : transitSegments}
          onCameraIdle={setMapPoint}
          onRouteAnchor={setAnchor} onCameraGesture={() => { manualCamera.current = true; setFollowing(false); setAnchor(null); }} />
        {!tracked && !mapPicking && !!preview?.path.length && metrics && anchor && anchor.y > insets.top + bubbleSize.height + 8 && anchor.y < viewport.height - visibleSheetHeight - Math.max(8, insets.bottom) - 12
          && anchor.x > 16 && anchor.x < viewport.width - 16 && <View pointerEvents="none" accessibilityElementsHidden
            onLayout={event => { const { width, height } = event.nativeEvent.layout; setBubbleSize(previous => previous.width === width && previous.height === height ? previous : { width, height }); }}
            style={{ position: 'absolute', left: bubbleLeft, top: anchor.y - bubbleSize.height, maxWidth: viewport.width - 32 }}>
            <RouteTimeBubble mode={mode === 'walk' ? 'walk' : mode === 'transit' ? 'transit' : 'car'} duration={metrics.duration}
              label={mode === 'walk' ? t('routes.recommended') : mode === 'transit' ? t(transitIndex === 0 ? 'routes.recommended' : 'routes.design.alternative') : t('routes.optimalRoute')}
              tailOffset={Math.max(14, Math.min(anchor.x - bubbleLeft - 5, bubbleSize.width - 20))} />
          </View>}
        {!tracked && <GlassSurface style={{ position: 'absolute', right: 12, top: insets.top + 8, borderRadius: 22 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t(tracked ? 'routes.tracking.follow' : preview?.path.length ? 'routes.fit' : 'routes.recenter')} onPress={fit}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><MyLocationIcon /></Pressable>
        </GlassSurface>}
        {tracked && trackingDestination ? <RouteTrackingSheet mode={tracked.presentation?.mode} name={tracked.destination.name} destination={trackingDestination}
          coordinate={tracking.coordinate} state={tracked.state} arrived={tracked.arrived} following={following} preview={!!tracked.previewOrigin}
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
              style={{ minHeight: 44, justifyContent: 'center', borderRadius: 16, backgroundColor: theme.colors.primary }}><Text style={{ color: theme.colors.staticWhite, textAlign: 'center' }}>{t('routes.editor.confirmMap')}</Text></Pressable>
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
            if (mode !== value) { closeNotice(); cancelRequests(); setAnchor(null); setMode(value); }
            else if ((value !== 'bike') && canRequest && activeState.kind !== 'loading' && activeState.kind !== 'ready') request();
          }}
          onEditEndpoint={setEditing} onSwapEndpoints={() => changeEndpoints([destination, origin ?? selections[0]])}
          onClose={onClose} onShare={shareDestination}
          onStart={() => { void startTracking(); }}
          walk={walkResult && walkMetrics ? { summary: { ...walkMetrics,
            arrival: t('routes.arrival', { time: new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'en', { hour: 'numeric', minute: '2-digit' }).format(new Date(walkEstimateAt! + walkResult.durationSeconds * 1000)) }) },
            onStart: () => { void startTracking(); } } : undefined}
          transit={itinerary && transitResult ? { itinerary, alternatives: transitResult.itineraries, index: transitIndex, count: transitResult.itineraries.length, estimateAt: transitEstimateAt,
            onSelect: index => { manualCamera.current = false; setAnchor(null); setTransitSelection({ source: transitResult, index }); },
            onStart: () => { void startTracking(); } } : undefined}
          onRequest={request} onCancel={cancelRequests} onRefreshLocation={onRefreshLocation}
          onSettings={() => { void Linking.openSettings().catch(() => undefined); }} onExternal={() => { void openExternal(); }} />}
      </MapGlassBackdrop>
      </View>
      {notice && <RouteNotice title={t('routes.tracking.start')} {...notice} onClose={closeNotice}
        retryLabel={t(notice.recovery === 'settings' ? 'routes.settings' : notice.recovery === 'permission' ? 'routes.location' : 'routes.tracking.retryStart')}
        onRetry={notice.recovery ? () => {
          if (notice.recovery === 'permission' || notice.recovery === 'settings') {
            closeNotice();
            if (notice.recovery === 'settings') void Linking.openSettings().catch(() => undefined);
            else onRefreshLocation();
          } else { void startTracking(true); }
        } : undefined} />}
    </View>
  </Modal>;
}
