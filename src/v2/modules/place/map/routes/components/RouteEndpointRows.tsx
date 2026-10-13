import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, PanResponder, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import type { RouteDestination } from '../model/routeUi';
import OriginIcon from '../assets/origin.svg';
import OriginDeniedIcon from '../assets/origin_denied.svg';
import DestinationIcon from '../assets/destination.svg';

export type EndpointRole = 'origin' | 'destination';
type Props = {
  origin: RouteDestination | null; destination: RouteDestination | null; originDenied?: boolean;
  onEdit: (role: EndpointRole) => void; onSwap: () => void;
  onDragging?: (dragging: boolean) => void;
};

export function endpointDragCrossesRow(role: EndpointRole, dy: number, height: number) {
  return Number.isFinite(dy) && (role === 'origin' ? dy > height / 2 : dy < -height / 2);
}

function EndpointRow({ role, point, onEdit, onSwap, onDragging, onPreview, displaced, originDenied }: {
  role: EndpointRole; point: RouteDestination | null; originDenied?: boolean;
  displaced: boolean; onPreview: (role: EndpointRole, crossed: boolean, active: boolean) => void;
  onEdit: Props['onEdit']; onSwap: Props['onSwap']; onDragging?: Props['onDragging'];
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const active = useRef(false);
  const suppressPress = useRef(false);
  const height = useRef(56);
  const startY = useRef(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);
  const lift = useRef(new Animated.Value(1)).current;
  const peerOffset = useRef(new Animated.Value(0)).current;
  const crossed = useRef(false);
  useEffect(() => {
    const animation = Animated.spring(peerOffset, { toValue: displaced ? (role === 'origin' ? height.current : -height.current) : 0, useNativeDriver: true, damping: 22, stiffness: 240 });
    animation.start();
    return () => animation.stop();
  }, [displaced, role, peerOffset]);
  const callbacks = useRef({ onSwap, onDragging, onPreview });
  callbacks.current = { onSwap, onDragging, onPreview };
  function stop() {
    active.current = false; crossed.current = false; setDragging(false);
    lift.stopAnimation(); lift.setValue(1); callbacks.current.onPreview(role, false, false);
    translateY.setValue(0); callbacks.current.onDragging?.(false);
  }
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: () => active.current,
    onMoveShouldSetPanResponderCapture: () => active.current,
    onPanResponderMove: (event) => {
      if (!active.current) return;
      const dy = event.nativeEvent.pageY - startY.current;
      if (!Number.isFinite(dy)) return;
      translateY.setValue(Math.max(-height.current * 1.2, Math.min(height.current * 1.2, dy)));
      const next = endpointDragCrossesRow(role, dy, height.current);
      if (crossed.current !== next) { crossed.current = next; callbacks.current.onPreview(role, next, true); }
    },
    onPanResponderRelease: (event) => {
      const swap = active.current && endpointDragCrossesRow(role, event.nativeEvent.pageY - startY.current, height.current);
      stop();
      if (swap) {
        callbacks.current.onSwap();
        AccessibilityInfo.announceForAccessibility(t('routes.editor.swapped'));
      }
    },
    onPanResponderTerminationRequest: () => !active.current,
    onPanResponderTerminate: stop,
  }), [role, t, translateY]);
  const label = point?.isCurrentLocation ? t('routes.currentLocation') : point?.name ?? t('routes.setOrigin');
  const subtitle = point?.address || t(point ? `routes.${role}` : originDenied ? 'routes.permissionOriginHint' : 'routes.locationNeeded');
  return <View {...pan.panHandlers} onTouchEnd={() => { if (active.current) setTimeout(stop, 0); }}
    onLayout={e => { height.current = e.nativeEvent.layout.height; }}
    style={{ zIndex: dragging ? 2 : 0 }}>
    <Animated.View testID={`route-${role}-floating`} style={{ transform: [{ translateY: dragging ? translateY : peerOffset }, { scale: lift }],
      borderRadius: 16, backgroundColor: dragging ? theme.colors.surface : 'transparent',
      elevation: dragging ? 16 : 0, shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowRadius: 12, shadowOpacity: dragging ? 0.35 : 0,
      borderWidth: dragging ? 1 : 0, borderColor: theme.colors.primary }}>

    <Pressable testID={`route-${role}-row`} accessibilityRole="button"
      accessibilityLabel={t('routes.editor.editEndpoint', { role: t(`routes.${role}`), name: label })}
      accessibilityHint={t('routes.editor.dragHint')}
      accessibilityActions={[{ name: 'activate', label: t('routes.editor.edit') }, { name: 'swap', label: t('routes.editor.swap') }]}
      onAccessibilityAction={e => e.nativeEvent.actionName === 'swap' ? onSwap() : onEdit(role)}
      delayLongPress={350} onPressIn={event => { if (!active.current) { suppressPress.current = false; startY.current = event.nativeEvent.pageY; } }}
      onLongPress={() => { active.current = true; suppressPress.current = true; setDragging(true); callbacks.current.onPreview(role, false, true); onDragging?.(true); Animated.spring(lift, { toValue: 1.04, useNativeDriver: true, damping: 18, stiffness: 260 }).start(); }}
      onPress={() => { if (!suppressPress.current) onEdit(role); }}
      style={{ minHeight: 56, paddingVertical: 8, paddingHorizontal: 12, gap: 12, flexDirection: 'row', alignItems: 'center',
        backgroundColor: dragging ? theme.colors.surface : 'transparent', borderRadius: dragging ? 16 : 0 }}>
      {role === 'origin' ? <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: originDenied ? theme.colors.warningSoft : theme.colors.primaryTint, alignItems: 'center', justifyContent: 'center' }}>
        {point ? <OriginIcon /> : <OriginDeniedIcon />}
      </View> : <DestinationIcon />}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text numberOfLines={1} style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '500' }}>{label}</Text>
        <Text numberOfLines={1} style={{ color: theme.colors.labelAssistive, fontSize: 12, lineHeight: 15.6 }}>{subtitle}</Text>
      </View>
    </Pressable>
    </Animated.View>
  </View>;
}

export default function RouteEndpointRows(props: Props) {
  const theme = useTheme();
  const [preview, setPreview] = useState<{ role: EndpointRole; crossed: boolean } | null>(null);
  const onPreview = (role: EndpointRole, crossed: boolean, active: boolean) => setPreview(active ? { role, crossed } : null);
  return <View style={{ borderRadius: 20, backgroundColor: theme.colorScheme === 'dark' ? 'rgba(52,52,58,0.70)' : 'rgba(255,255,255,0.56)' }}>
    {preview && <View testID={`route-${preview.role}-placeholder`} pointerEvents="none" style={{ position: 'absolute', left: 4, right: 4,
      ...(preview.role === 'origin' !== preview.crossed ? { top: 4 } : { bottom: 4 }), height: '46%', borderRadius: 16,
      backgroundColor: theme.colors.primarySoft, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border }} />}
    <EndpointRow {...props} role="origin" point={props.origin} onPreview={onPreview} displaced={preview?.role === 'destination' && preview.crossed} />
    <View style={{ marginLeft: 56, height: 1, opacity: preview ? 0 : 1, backgroundColor: theme.colors.border }} />
    <EndpointRow {...props} role="destination" point={props.destination} onPreview={onPreview} displaced={preview?.role === 'origin' && preview.crossed} />
  </View>;
}
