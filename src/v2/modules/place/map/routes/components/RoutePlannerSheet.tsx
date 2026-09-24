import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import type { SvgProps } from 'react-native-svg';

import AddStopIcon from '../assets/add_stop.svg';
import ClockIcon from '../assets/clock.svg';
import CloseIcon from '../assets/close.svg';
import DestinationIcon from '../assets/destination.svg';
import HandleIcon from '../assets/handle.svg';
import CarIcon from '../assets/mode_car.svg';
import CarSelectedIcon from '../assets/mode_car_selected.svg';
import TransitIcon from '../assets/mode_transit.svg';
import TransitUnselectedIcon from '../assets/mode_transit_unselected.svg';
import WalkIcon from '../assets/mode_walk.svg';
import WalkSelectedIcon from '../assets/mode_walk_selected.svg';
import BikeIcon from '../assets/mode_bike.svg';
import OriginIcon from '../assets/origin.svg';
import ShareIcon from '../assets/share.svg';
import StartIcon from '../assets/start.svg';
import WalkSegmentIcon from '../assets/walk_segment.svg';
import BusSegmentIcon from '../assets/bus_segment.svg';
import SubwaySegmentIcon from '../assets/subway_segment.svg';
import type { RouteDestination, RouteMode, RouteSegment, RouteUiState } from '../model/routeUi';

type Props = {
  destination: RouteDestination;
  mode: RouteMode;
  onClose: () => void;
  onEditPlaces: () => void;
  onModeChange: (mode: RouteMode) => void;
  onPreviewAction: () => void;
  onShare: () => void;
  onOpenSettings: () => void;
  state: RouteUiState;
};

const MODE_ICONS: Record<RouteMode, React.ComponentType<SvgProps>> = {
  transit: TransitUnselectedIcon,
  walk: WalkIcon,
  car: CarIcon,
  bike: BikeIcon,
};
const SELECTED_MODE_ICONS: Partial<Record<RouteMode, React.ComponentType<SvgProps>>> = {
  transit: TransitIcon,
  walk: WalkSelectedIcon,
  car: CarSelectedIcon,
};
const MODES: RouteMode[] = ['transit', 'walk', 'car', 'bike'];

function RouteSegments({ segments }: { segments: RouteSegment[] }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const total = segments.reduce((sum, segment) => sum + segment.minutes, 0);
  return (
    <View style={{ backgroundColor: theme.colors.backgroundNeutral, borderRadius: 11, flexDirection: 'row', height: 22, overflow: 'hidden' }}>
      {segments.map((segment, index) => (
        <View
          key={`${segment.kind}-${index}`}
          style={{
            alignItems: 'center',
            backgroundColor: segment.kind === 'subway' ? theme.colors.danger : segment.kind === 'bus' ? theme.colors.info : theme.colors.backgroundNeutral,
            flex: Math.max(segment.minutes / Math.max(total, 1), 0.13),
            flexDirection: 'row',
            gap: 3,
            justifyContent: 'center',
          }}
        >
          {segment.kind === 'walk' ? <WalkSegmentIcon /> : segment.kind === 'bus' ? <BusSegmentIcon /> : <SubwaySegmentIcon />}
          <Text numberOfLines={1} style={{ color: segment.kind === 'walk' ? theme.colors.textMuted : theme.colors.textInverse, fontSize: 11, fontWeight: '700' }}>
            {segment.minutes}{t('map.route.minuteSuffix')}
          </Text>
        </View>
      ))}
    </View>
  );
}

function StatusCard({
  onClose, onEditPlaces, onModeChange, onOpenSettings, state,
}: Pick<Props, 'onClose' | 'onEditPlaces' | 'onModeChange' | 'onOpenSettings' | 'state'>) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (state.kind === 'loading') {
    return (
      <View accessibilityLabel={t('map.route.loading')} style={{ backgroundColor: theme.colors.surface, borderRadius: 24, gap: 12, padding: 16 }} testID="route-loading">
        <View style={{ backgroundColor: theme.colors.backgroundNeutral, borderRadius: 12, height: 28, width: 96 }} />
        <View style={{ backgroundColor: theme.colors.backgroundNeutral, borderRadius: 7, height: 14, width: '54%' }} />
        <View style={{ backgroundColor: theme.colors.backgroundNeutral, borderRadius: 7, height: 12, width: '70%' }} />
        <View style={{ backgroundColor: theme.colors.backgroundNeutral, borderRadius: 10, height: 22, width: '100%' }} />
        <Text style={{ color: theme.colors.primary, fontSize: 12 }}>{t('map.route.loading')}</Text>
      </View>
    );
  }

  const isDenied = state.kind === 'location-denied';
  const isMissing = state.kind === 'missing-destination';
  const isNoTransit = state.kind === 'no-transit';
  const title = isDenied ? t('map.route.deniedTitle')
    : isMissing ? t('map.route.missingTitle')
      : isNoTransit ? t('map.route.noTransitTitle')
        : t('map.route.unavailableTitle');
  const body = isDenied ? t('map.route.deniedBody')
    : isMissing ? t('map.route.missingBody')
      : isNoTransit ? t('map.route.noTransitBody')
        : t('map.route.unavailableBody');
  return (
    <View style={{ alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 24, gap: 8, minHeight: 216, padding: 16 }} testID={`route-${state.kind}`}>
      <View style={{ alignItems: 'center', backgroundColor: isDenied ? theme.colors.warningSoft : theme.colors.primarySoft, borderRadius: 22, height: 44, justifyContent: 'center', marginTop: 4, width: 44 }}>
        <ClockIcon />
      </View>
      <Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '700', marginTop: 4, textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: theme.colors.textAlternative, fontSize: 13, lineHeight: 18, textAlign: 'center' }}>{body}</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 'auto', width: '100%' }}>
        <Pressable accessibilityRole="button" onPress={onEditPlaces} style={{ alignItems: 'center', borderColor: theme.colors.border, borderRadius: 22, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44 }}>
          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>{isDenied ? t('map.route.enterManually') : t('map.route.editPlaces')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={isDenied ? onOpenSettings : isNoTransit ? () => onModeChange('car') : onClose} style={{ alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 22, flex: 1, justifyContent: 'center', minHeight: 44 }}>
          <Text style={{ color: theme.colors.textInverse, fontSize: 13, fontWeight: '700' }}>{isDenied ? t('map.route.openSettings') : isNoTransit ? t('map.route.car') : t('map.route.close')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function RoutePlannerSheet({ destination, mode, onClose, onEditPlaces, onModeChange, onPreviewAction, onShare, onOpenSettings, state }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const active = state.kind === 'ready' ? state.preview : null;
  return (
    <View style={{ backgroundColor: theme.colors.backgroundAssistive, borderColor: theme.colors.surface, borderRadius: 36, borderWidth: 1, marginHorizontal: 8, paddingBottom: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20 }} testID="route-planner-sheet">
      <View style={{ alignSelf: 'center', backgroundColor: '#BFC1C1', borderRadius: 3, height: 5, marginTop: 8, width: 56 }} />
      <ScrollView contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 48 }}>
          <Pressable accessibilityLabel={t('map.route.share')} accessibilityRole="button" onPress={onShare} style={{ alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 }}><ShareIcon /></Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 20, fontWeight: '700' }}>{t('map.route.title')}</Text>
            <Text style={{ color: theme.colors.primary, fontSize: 12 }}>{t('map.route.options')}</Text>
          </View>
          <Pressable accessibilityLabel={t('map.route.close')} accessibilityRole="button" onPress={onClose} style={{ alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 }}><CloseIcon /></Pressable>
        </View>
        <View accessibilityRole="tablist" style={{ backgroundColor: theme.colors.selectedTabSurface, borderRadius: 24, flexDirection: 'row', height: 48, padding: 4 }}>
          {MODES.map((item) => {
            const selected = mode === item;
            const Icon = selected ? SELECTED_MODE_ICONS[item] ?? MODE_ICONS[item] : MODE_ICONS[item];
            return (
              <Pressable
                key={item}
                accessibilityLabel={t(`map.route.${item}`)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                onPress={() => onModeChange(item)}
                style={{ alignItems: 'center', backgroundColor: selected ? theme.colors.surface : 'transparent', borderRadius: 20, flex: 1, flexDirection: 'row', gap: 3, justifyContent: 'center' }}
                testID={`route-mode-${item}`}
              >
                <Icon />
                <Text numberOfLines={1} style={{ color: selected ? theme.colors.primary : theme.colors.textMuted, fontSize: 12, fontWeight: selected ? '700' : '500' }}>{t(`map.route.${item}`)}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: 20, overflow: 'hidden' }}>
          <Pressable accessibilityLabel={t('map.route.editPlaces')} accessibilityRole="button" onPress={onEditPlaces} style={{ alignItems: 'center', flexDirection: 'row', gap: 12, height: 56, paddingHorizontal: 12 }}>
            <View style={{ alignItems: 'center', backgroundColor: theme.colors.primarySoft, borderRadius: 16, height: 32, justifyContent: 'center', width: 32 }}><OriginIcon /></View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '500' }}>{state.kind === 'location-denied' ? t('map.route.setStart') : t('map.route.myLocation')}</Text>
              <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12 }}>{state.kind === 'location-denied' ? t('map.route.setStartHint') : t('map.route.currentPosition')}</Text>
            </View>
            <HandleIcon />
          </Pressable>
          <View style={{ backgroundColor: theme.colors.border, height: 1, marginLeft: 56 }} />
          <Pressable accessibilityLabel={`${t('map.route.destination')}: ${destination.name}`} accessibilityRole="button" onPress={onEditPlaces} style={{ alignItems: 'center', flexDirection: 'row', gap: 12, height: 56, paddingHorizontal: 12 }}>
            <View style={{ alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 16, height: 32, justifyContent: 'center', width: 32 }}><DestinationIcon /></View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '500' }}>{destination.englishName || destination.name}</Text>
              <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12 }}>{destination.englishName ? `${destination.name} · ${destination.address ?? ''}` : destination.address ?? ''}</Text>
            </View>
            <HandleIcon />
          </Pressable>
          <View style={{ backgroundColor: theme.colors.border, height: 1, marginLeft: 56 }} />
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: true }} disabled style={{ alignItems: 'center', flexDirection: 'row', gap: 12, height: 56, opacity: 0.65, paddingHorizontal: 12 }}>
            <View style={{ alignItems: 'center', backgroundColor: theme.colors.primarySoft, borderRadius: 16, height: 32, justifyContent: 'center', width: 32 }}><AddStopIcon /></View>
            <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{t('map.route.addStop')}</Text>
          </Pressable>
        </View>
        {active ? (
          <View style={{ backgroundColor: theme.colors.surface, borderRadius: 24, gap: 10, padding: 16 }} testID="route-preview-ready">
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={{ color: theme.colors.textStrong, fontSize: 28, fontWeight: '700' }}>{active.duration}</Text>
                <Text style={{ color: theme.colors.textAlternative, fontSize: 14 }}>{t('map.route.arrival', { time: active.arrival, distance: active.distance })}</Text>
                <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 12 }}>{active.meta}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={onPreviewAction} style={{ alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 24, flexDirection: 'row', gap: 5, height: 48, justifyContent: 'center', paddingHorizontal: 20 }}>
                <StartIcon />
                <Text style={{ color: theme.colors.textInverse, fontSize: 16, fontWeight: '700' }}>{mode === 'car' ? t('map.route.call') : t('map.route.start')}</Text>
              </Pressable>
            </View>
            {active.segments ? <RouteSegments segments={active.segments} /> : null}
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}><ClockIcon /><Text style={{ color: theme.colors.primary, fontSize: 12 }}>{t('map.route.previewHint')}</Text></View>
          </View>
        ) : <StatusCard onClose={onClose} onEditPlaces={onEditPlaces} onModeChange={onModeChange} onOpenSettings={onOpenSettings} state={state} />}
        <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 6, marginBottom: 2, marginTop: 2 }}>
          {[0, 1, 2].map((index) => <View key={index} style={{ backgroundColor: index === 0 ? theme.colors.primary : '#BFC1C1', borderRadius: 3, height: 6, width: index === 0 ? 16 : 6 }} />)}
        </View>
      </ScrollView>
    </View>
  );
}
