import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text, TextInput } from '../../../../../shared/components/Typography';
import { useBookmarkedPlaces, usePlaceAutocomplete } from '../../../exploration';
import { toAutocompleteResults, toMarkerCategory } from '../../selection/model/mapDiscovery';
import { useRecentSearchStore } from '../../../search/store/recentSearchStore';
import { getRecentSearchOwnerKey, type RecentSearchOwner } from '../../../search/services/recentSearchStorage';
import GlassSurface from '../../presentation/components/GlassSurface';
import type { RouteDestination } from '../model/routeUi';
import { hasRouteDestinationCoordinates } from '../model/routeUi';
import type { EndpointRole } from './RouteEndpointRows';
import CloseIcon from '../assets/close.svg';
import ShareIcon from '../assets/share.svg';
import OriginIcon from '../assets/origin.svg';
import DestinationIcon from '../assets/edit_destination.svg';
import StarIcon from '../assets/saved_star.svg';
import ClockIcon from '../assets/recent_clock.svg';

type Props = {
  role: EndpointRole; origin: RouteDestination | null; destination: RouteDestination | null;
  bottomInset: number; maxHeight: number; recentSearchOwner?: RecentSearchOwner;
  onRole: (role: EndpointRole) => void; onClose: () => void; onShare: () => void;
  onSelect: (point: RouteDestination | null) => void; onMap: () => void; onRefreshLocation: () => void;
};

/** Figma 8892:11110. Saved places and searches are account-owned live data. */
export default function RouteEndpointEditor(props: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showAll, setShowAll] = useState(false);
  const saved = useBookmarkedPlaces();
  const recent = useRecentSearchStore();
  const ownerKey = props.recentSearchOwner ? getRecentSearchOwnerKey(props.recentSearchOwner) : undefined;
  const history = ownerKey && recent.activeOwnerKey === ownerKey ? recent.items : [];
  useEffect(() => {
    if (props.recentSearchOwner) void useRecentSearchStore.getState().activateOwner(props.recentSearchOwner);
  }, [ownerKey]);
  useEffect(() => { setQuery(''); setKeyword(''); }, [props.role]);
  useEffect(() => {
    const timer = setTimeout(() => setKeyword(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const search = usePlaceAutocomplete({ keyword, limit: 20 }, { enabled: keyword.length > 0 });
  const results = keyword === query.trim() ? toAutocompleteResults(search.data) : [];
  const ink = theme.colors.textStrong, muted = theme.colors.textSecondary;
  const raised = theme.colorScheme === 'dark' ? 'rgba(52,52,58,0.70)' : 'rgba(255,255,255,0.56)';
  const select = (point: RouteDestination | null) => {
    if (point && !hasRouteDestinationCoordinates(point)) return;
    if (point && props.recentSearchOwner) void recent.recordSearch({ query: point.name, category: point.category === 'game' ? 'etc' : point.category ?? 'etc' }, props.recentSearchOwner);
    Keyboard.dismiss(); props.onSelect(point);
  };
  function button(label: string, onPress: () => void) {
    return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 16, backgroundColor: theme.colors.surfaceMuted }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: muted }}>{label}</Text>
    </Pressable>;
  }
  const savedPlaces = saved.places.filter(hasRouteDestinationCoordinates);
  return <View testID="route-endpoint-editor" style={{ position: 'absolute', left: 8, right: 8, bottom: Math.max(8, props.bottomInset), height: Math.min(558, props.maxHeight) }}>
    <GlassSurface tintColor={theme.liquidGlass.sheet.tint} androidTintColor={theme.liquidGlass.sheet.tint}
      style={{ flex: 1, borderTopLeftRadius: 36, borderTopRightRadius: 36, borderBottomLeftRadius: 48, borderBottomRightRadius: 48, overflow: 'hidden', borderWidth: 1, borderColor: theme.liquidGlass.sheet.rim }}>
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" bounces={false}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16, paddingHorizontal: 16, gap: 12 }}>
        <View accessible={false} style={{ width: 56, height: 5, borderRadius: 7, backgroundColor: theme.colors.border, alignSelf: 'center', marginBottom: -9 }} />
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('routes.share')} onPress={props.onShare} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><ShareIcon /></Pressable>
          <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: '700', color: ink }}>{t('routes.title')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t('routes.editor.close')} onPress={() => { Keyboard.dismiss(); props.onClose(); }} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><CloseIcon /></Pressable>
        </View>
        <View style={{ borderRadius: 20, backgroundColor: raised }}>
          {(['origin', 'destination'] as const).map(role => {
            const point = role === 'origin' ? props.origin : props.destination;
            return role === props.role ? <View key={role} style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10, backgroundColor: theme.colors.background, borderColor: theme.colors.primaryPressed, borderWidth: 1.5, borderRadius: 16 }}>
              {role === 'origin' ? <View style={{ width: 28, alignItems: 'center' }}><OriginIcon /></View> : <DestinationIcon />}
              <View style={{ flex: 1, paddingVertical: 5 }}>
                <Text style={{ color: muted, fontSize: 12, fontWeight: '500' }}>{t(`routes.${role}`)}</Text>
                <TextInput testID="route-endpoint-search" accessibilityLabel={t('routes.editor.search')} placeholder={t('routes.editor.search')}
                  placeholderTextColor={muted} selectionColor={theme.colors.primary} value={query} onChangeText={setQuery}
                  autoCorrect={false} returnKeyType="search" onSubmitEditing={() => setKeyword(query.trim())}
                  style={{ color: ink, fontSize: 16, fontWeight: '500', padding: 0, minHeight: 24 }} />
              </View>
            </View> : <Pressable key={role} accessibilityRole="button" accessibilityLabel={t('routes.editor.editEndpoint', { role: t(`routes.${role}`), name: point?.name ?? t('routes.currentLocation') })}
              onPress={() => props.onRole(role)} style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>{role === 'origin' ? <OriginIcon /> : <DestinationIcon />}</View>
              <View style={{ flex: 1, gap: 2 }}><Text numberOfLines={1} style={{ color: ink, fontSize: 16, fontWeight: '500' }}>{point?.name ?? t('routes.currentLocation')}</Text>
                <Text numberOfLines={1} style={{ color: muted, fontSize: 12 }}>{point?.address || t(`routes.${role}`)}</Text></View>
            </Pressable>;
          })}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {button(t('routes.currentLocation'), () => { if (props.origin?.isCurrentLocation || props.destination?.isCurrentLocation) select(null); else { props.onRefreshLocation(); select(null); } })}
          {button(t('routes.editor.map'), () => { Keyboard.dismiss(); props.onMap(); })}
        </View>
        {query.trim() ? <View style={{ gap: 8 }}>
          <Text accessibilityRole="header" style={{ color: ink, fontSize: 18, fontWeight: '700' }}>{t('routes.editor.results')}</Text>
          {query.trim() !== keyword || search.isLoading ? <ActivityIndicator accessibilityLabel={t('routes.editor.loading')} color={theme.colors.primary} />
            : search.isError ? <View>{button(t('routes.editor.retry'), () => { void search.refetch(); })}<Text style={{ color: muted }}>{t('routes.editor.searchFailed')}</Text></View>
              : !results.length ? <Text style={{ color: muted }}>{t('routes.editor.emptySearch')}</Text>
                : results.map(p => <Pressable key={p.id} accessibilityRole="button" onPress={() => select({ placeId: p.id, name: p.name, address: p.address, latitude: p.coordinate.lat, longitude: p.coordinate.lng, category: toMarkerCategory(p.category) })}
                  style={{ minHeight: 60, paddingVertical: 12, borderBottomWidth: 0.5, borderColor: theme.colors.border }}>
                  <Text numberOfLines={1} style={{ color: ink, fontSize: 16, fontWeight: '500' }}>{p.name}</Text><Text numberOfLines={1} style={{ color: muted, fontSize: 12 }}>{p.address}</Text>
                </Pressable>)}
        </View> : <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text accessibilityRole="header" style={{ color: ink, fontSize: 18, fontWeight: '700' }}>{t('routes.editor.saved')}</Text>
            <Pressable accessibilityRole="button" onPress={() => { setShowAll(true); if (saved.hasNextPage && !saved.isFetchingNextPage) void saved.fetchNextPage(); }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: muted, fontSize: 12 }}>{t('routes.editor.all')}</Text></Pressable>
          </View>
          {saved.isLoading ? <ActivityIndicator color={theme.colors.primary} /> : saved.isError ? button(t('routes.editor.retrySaved'), () => { void saved.refetch(); }) : !savedPlaces.length ? <Text style={{ color: muted }}>{t('routes.editor.emptySaved')}</Text> :
            <ScrollView horizontal={!showAll} keyboardShouldPersistTaps="handled" showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: showAll ? 0 : 24 }}>
              {savedPlaces.map(p => <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={p.name}
                onPress={() => select({ placeId: p.id, name: p.name, address: p.address, latitude: p.latitude, longitude: p.longitude, category: toMarkerCategory(p.category) })}
                style={{ width: showAll ? undefined : 150, padding: 12, borderRadius: 12, gap: 6, backgroundColor: theme.colors.surfaceMuted }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><StarIcon /></View>
                <Text numberOfLines={1} style={{ color: ink, fontSize: 16, fontWeight: '500' }}>{p.name}</Text>
                <Text numberOfLines={1} style={{ color: muted, fontSize: 12 }}>{p.address}</Text>
              </Pressable>)}
              {showAll && saved.hasNextPage && button(t('routes.editor.more'), () => { if (!saved.isFetchingNextPage) void saved.fetchNextPage(); })}
            </ScrollView>}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text accessibilityRole="header" style={{ color: ink, fontSize: 18, fontWeight: '700' }}>{t('routes.editor.recent')}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('routes.editor.clear')} disabled={!ownerKey || !history.length}
              onPress={() => { if (props.recentSearchOwner) void recent.clearSearches(props.recentSearchOwner); }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: muted, fontSize: 12 }}>{t('routes.editor.clear')}</Text></Pressable>
          </View>
          {history.length ? history.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={t('routes.editor.recentSearch', { name: item.query })}
            onPress={() => setQuery(item.query)} style={{ minHeight: 64, paddingVertical: 16, gap: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0.5, borderColor: theme.colors.border }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}><ClockIcon /></View>
            <Text numberOfLines={1} style={{ flex: 1, color: ink, fontSize: 16, fontWeight: '500' }}>{item.query}</Text>
          </Pressable>) : <Text style={{ color: muted }}>{t('routes.editor.emptyRecent')}</Text>}
        </>}
      </ScrollView>
    </GlassSurface>
  </View>;
}
