import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Share, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import { env } from '../../../../../shared/config';
import MapCanvas from '../../native/components/MapCanvas';
import { useCurrentLocation } from '../../location/hooks/useCurrentLocation';
import CloseIcon from '../assets/close.svg';
import DestinationIcon from '../assets/destination.svg';
import LayersIcon from '../assets/layers.svg';
import MyLocationIcon from '../assets/my_location.svg';
import OriginIcon from '../assets/origin.svg';
import ShareIcon from '../assets/share.svg';
import RoutePlannerSheet from '../components/RoutePlannerSheet';
import {
  hasRouteDestinationCoordinates,
  routeDesignPreview,
  selectRouteUiState,
  type RouteDestination,
  type RouteMode,
  type RouteUiState,
} from '../model/routeUi';

type Props = {
  navigation: { goBack: () => void };
  route: { params: { destination: RouteDestination } };
};

type Panel = 'route' | 'edit' | 'detail';

function IconButton({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={{ alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 22, height: 44, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, width: 44 }}>
      {children}
    </Pressable>
  );
}

function RouteEditPlaces({
  destination, onBack, onDestinationChange, onOriginChange, origin,
}: {
  destination: RouteDestination;
  onBack: () => void;
  onDestinationChange: (destination: RouteDestination) => void;
  onOriginChange: (name: string) => void;
  origin: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = useState(destination.name);
  const { width } = useWindowDimensions();
  const mockPlaces = env.apiMode === 'mock' ? [
    { name: 'Daesung Banjeom', address: '대성반점 · 대구 달성군 구지면 창리로 12', latitude: 35.677, longitude: 128.465 },
    { name: 'Dongdaegu Station (KTX)', address: '동대구역 · 대구 동구 동대구로 550', latitude: 35.879, longitude: 128.629 },
    { name: 'Suseongmot Lake', address: '수성못 · 대구 수성구 두산동', latitude: 35.826, longitude: 128.613 },
  ] : [];
  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
        <IconButton label={t('map.route.back')} onPress={onBack}><Text style={{ color: theme.colors.textStrong, fontSize: 25 }}>‹</Text></IconButton>
        <Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 20, fontWeight: '700' }}>{t('map.route.editPlaces')}</Text>
        <IconButton label={t('map.route.back')} onPress={onBack}><CloseIcon /></IconButton>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 16 }}>
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ alignItems: 'center', backgroundColor: theme.colors.backgroundAssistive, borderRadius: 16, flexDirection: 'row', gap: 8, minHeight: 56, paddingHorizontal: 12 }}>
            <OriginIcon />
            <View style={{ flex: 1 }}><Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{t('map.route.from')}</Text>
              <TextInput accessibilityLabel={t('map.route.from')} onChangeText={onOriginChange} placeholder={t('map.route.myLocation')} style={{ color: theme.colors.textStrong, fontSize: 16, padding: 0 }} value={origin} /></View>
          </View>
          <View style={{ alignItems: 'center', borderColor: theme.colors.primary, borderRadius: 16, borderWidth: 1, flexDirection: 'row', gap: 8, minHeight: 56, paddingHorizontal: 12 }}>
            <View style={{ alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 16, height: 32, justifyContent: 'center', width: 32 }}><DestinationIcon /></View>
            <View style={{ flex: 1 }}><Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{t('map.route.to')}</Text>
              <TextInput accessibilityLabel={t('map.route.to')} onChangeText={setSearch} placeholder={t('map.route.searchPlace')} style={{ color: theme.colors.textStrong, fontSize: 16, padding: 0 }} value={search} /></View>
          </View>
        </View>
        <IconButton label={t('map.route.swap')} onPress={() => {
          onOriginChange(search);
          setSearch(origin);
          onDestinationChange({ ...destination, name: origin, latitude: null, longitude: null });
        }}><Text style={{ color: theme.colors.textAlternative, fontSize: 20 }}>↕</Text></IconButton>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingVertical: 12 }}>
        <Pressable accessibilityRole="button" onPress={() => onOriginChange(t('map.route.myLocation'))} style={{ backgroundColor: theme.colors.backgroundAssistive, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}><Text style={{ color: theme.colors.textAlternative }}>{t('map.route.currentPosition')}</Text></Pressable>
        <View style={{ backgroundColor: theme.colors.backgroundAssistive, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}><Text style={{ color: theme.colors.textMuted }}>{t('map.route.searchPlace')}</Text></View>
      </View>
      {env.apiMode !== 'mock' ? <Text style={{ color: theme.colors.textMuted, fontSize: 12, paddingHorizontal: 24, paddingBottom: 12 }}>{t('map.route.searchUnavailableHint')}</Text> : null}
      <View style={{ backgroundColor: theme.colors.backgroundNeutral, height: 8 }} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '700' }}>{t('map.route.saved')}</Text>
          {mockPlaces.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, marginTop: 16 }} contentContainerStyle={{ gap: 10, paddingHorizontal: 24 }}>
              {mockPlaces.map((place) => (
                <Pressable key={place.name} accessibilityRole="button" onPress={() => {
                  onDestinationChange({ ...destination, ...place });
                  onBack();
                }} style={{ backgroundColor: theme.colors.backgroundAssistive, borderRadius: 14, gap: 5, padding: 12, width: Math.min(150, width * 0.4) }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 18 }}>★</Text>
                  <Text numberOfLines={1} style={{ color: theme.colors.textStrong, fontSize: 14, fontWeight: '600' }}>{place.name}</Text>
                  <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12 }}>{place.address}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : <Text style={{ color: theme.colors.textMuted, marginTop: 18 }}>{t('map.route.noSaved')}</Text>}
        </View>
        <View style={{ backgroundColor: theme.colors.backgroundNeutral, height: 8, marginTop: 18 }} />
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '700' }}>{t('map.route.recent')}</Text>
          {mockPlaces.length ? mockPlaces.map((place) => (
            <Pressable key={place.name} accessibilityRole="button" onPress={() => {
              onDestinationChange({ ...destination, ...place });
              onBack();
            }} style={{ borderBottomColor: theme.colors.border, borderBottomWidth: 1, minHeight: 70, justifyContent: 'center' }}>
              <Text numberOfLines={1} style={{ color: theme.colors.textStrong, fontSize: 14, fontWeight: '500' }}>{place.name}</Text>
              <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12 }}>{place.address}</Text>
            </Pressable>
          )) : <Text style={{ color: theme.colors.textMuted, marginTop: 18 }}>{t('map.route.noRecent')}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RouteDetail({ destination, onBack, state }: { destination: RouteDestination; onBack: () => void; state: Extract<RouteUiState, { kind: 'ready' }> }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <SafeAreaView style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
        <IconButton label={t('map.route.back')} onPress={onBack}><Text style={{ color: theme.colors.textStrong, fontSize: 25 }}>‹</Text></IconButton>
        <View style={{ alignItems: 'center' }}><Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 20, fontWeight: '700' }}>{t('map.route.detail')}</Text><Text style={{ color: theme.colors.primary, fontSize: 12 }}>{t('map.route.preview')}</Text></View>
        <IconButton label={t('map.route.close')} onPress={onBack}><CloseIcon /></IconButton>
      </View>
      <View style={{ borderBottomColor: theme.colors.border, borderBottomWidth: 1, gap: 10, padding: 24 }}>
        <Text style={{ color: theme.colors.textStrong, fontSize: 28, fontWeight: '700' }}>{state.preview.duration}</Text>
        <Text style={{ color: theme.colors.textAlternative, fontSize: 14 }}>{t('map.route.arrival', { time: state.preview.arrival, distance: state.preview.distance })}</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{state.preview.meta}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {[...(state.preview.steps ?? []), { title: destination.englishName || destination.name, subtitle: destination.address || destination.name }].map((step, index) => (
          <View key={`${step.title}-${index}`} style={{ borderLeftColor: index === 0 || index === (state.preview.steps ?? []).length ? theme.colors.primary : theme.colors.info, borderLeftWidth: 3, flexDirection: 'row', gap: 18, minHeight: 78, paddingBottom: 12, paddingLeft: 16 }}>
            <View style={{ backgroundColor: index === 0 || index === (state.preview.steps ?? []).length ? theme.colors.primary : theme.colors.info, borderRadius: 8, height: 12, marginLeft: -23, marginTop: 4, width: 12 }} />
            <View style={{ flex: 1 }}><Text style={{ color: theme.colors.textStrong, fontSize: 15, fontWeight: '600' }}>{step.title}</Text><Text style={{ color: theme.colors.textAlternative, fontSize: 13 }}>{step.subtitle}</Text>{step.meta ? <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{step.meta}</Text> : null}</View>
          </View>
        ))}
      </ScrollView>
      <View style={{ padding: 24 }}><Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center' }}>{t('map.route.previewHint')}</Text></View>
    </SafeAreaView>
  );
}

export default function RoutePlannerScreen({ navigation, route }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const location = useCurrentLocation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [destination, setDestination] = useState(route.params.destination);
  const [origin, setOrigin] = useState(t('map.route.myLocation'));
  const [mode, setMode] = useState<RouteMode>('transit');
  const [panel, setPanel] = useState<Panel>('route');
  const preview = env.apiMode === 'mock' && env.mock.scenario === 'success' && mode !== 'bike'
    ? routeDesignPreview(i18n.language)[mode] : null;
  const state = useMemo(() => {
    const baseState = selectRouteUiState({ destination, location, preview });
    if (baseState.kind === 'unavailable' && env.apiMode === 'mock' && env.mock.scenario === 'empty' && mode === 'transit') {
      return { kind: 'no-transit' } as const;
    }
    return baseState;
  }, [destination, location, mode, preview]);
  if (panel === 'edit') return <RouteEditPlaces destination={destination} onBack={() => setPanel('route')} onDestinationChange={setDestination} onOriginChange={setOrigin} origin={origin} />;
  if (panel === 'detail' && state.kind === 'ready') return <RouteDetail destination={destination} onBack={() => setPanel('route')} state={state} />;

  const valid = hasRouteDestinationCoordinates(destination);
  const latitude = valid ? destination.latitude! : 37.5665;
  const longitude = valid ? destination.longitude! : 126.978;
  return (
    <View style={{ backgroundColor: theme.colors.backgroundAssistive, flex: 1 }}>
      <MapCanvas
        centerLat={latitude}
        centerLng={longitude}
        followUser={false}
        markers={valid ? [{ id: `route-destination-${destination.placeId}`, category: 'etc', lat: latitude, lng: longitude }] : []}
        onMarkerPress={() => undefined}
        userLat={location.status === 'granted' ? location.coordinate.lat : undefined}
        userLng={location.status === 'granted' ? location.coordinate.lng : undefined}
        zoomLevel={14}
      />
      <View style={{ alignItems: 'flex-end', gap: 8, position: 'absolute', right: 12, top: insets.top + 12 }}>
        <IconButton label={t('map.route.layer')} onPress={() => Alert.alert(t('map.route.routeNotStarted'))}><LayersIcon /></IconButton>
        <IconButton label={t('map.route.locate')} onPress={() => void location.refresh(true)}><MyLocationIcon /></IconButton>
      </View>
      <View style={{ alignItems: 'center', alignSelf: 'center', backgroundColor: theme.colors.surface, borderRadius: 12, flexDirection: 'row', gap: 4, maxWidth: '70%', paddingHorizontal: 8, paddingVertical: 5, position: 'absolute', top: insets.top + 26 }}>
        <View style={{ alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 10, height: 20, justifyContent: 'center', width: 20 }}><DestinationIcon /></View>
        <Text numberOfLines={1} style={{ color: theme.colors.textStrong, fontSize: 12, fontWeight: '700' }}>{destination.englishName ? `${destination.englishName} · ${destination.name}` : destination.name}</Text>
      </View>
      <View style={{ bottom: Math.max(insets.bottom, 8), left: 0, maxHeight: Math.max(410, height * 0.67), position: 'absolute', right: 0 }}>
        <RoutePlannerSheet
          destination={destination}
          mode={mode}
          onClose={navigation.goBack}
          onEditPlaces={() => setPanel('edit')}
          onModeChange={setMode}
          onOpenSettings={() => void Linking.openSettings().catch(() => Alert.alert(t('map.route.deniedBody')))}
          onPreviewAction={() => {
            if (mode === 'transit' && state.kind === 'ready') setPanel('detail');
            else Alert.alert(t('map.route.routeNotStarted'));
          }}
          onShare={() => void Share.share({ message: [destination.name, destination.address].filter(Boolean).join('\n') }).catch(() => undefined)}
          state={state}
        />
      </View>
    </View>
  );
}
