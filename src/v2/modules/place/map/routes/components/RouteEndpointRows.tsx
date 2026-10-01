import React, { useMemo, useRef, useState } from 'react';
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
  origin: RouteDestination | null; destination: RouteDestination | null;
  onEdit: (role: EndpointRole) => void; onSwap: () => void;
  onDragging?: (dragging: boolean) => void;
};

export function endpointDragCrossesRow(role: EndpointRole, dy: number, height: number) {
  return Number.isFinite(dy) && (role === 'origin' ? dy > height / 2 : dy < -height / 2);
}

function EndpointRow({ role, point, onEdit, onSwap, onDragging }: {
  role: EndpointRole; point: RouteDestination | null;
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
  const callbacks = useRef({ onSwap, onDragging });
  callbacks.current = { onSwap, onDragging };
  function stop() {
    active.current = false; setDragging(false);
    translateY.setValue(0); callbacks.current.onDragging?.(false);
  }
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: () => active.current,
    onMoveShouldSetPanResponderCapture: () => active.current,
    onPanResponderMove: (event) => translateY.setValue(Math.max(-height.current * 1.2, Math.min(height.current * 1.2, event.nativeEvent.pageY - startY.current))),
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
  const subtitle = point?.address || t(point ? `routes.${role}` : 'routes.locationNeeded');
  return <Animated.View {...pan.panHandlers} onTouchEnd={() => { if (active.current) setTimeout(stop, 0); }}
    onLayout={e => { height.current = e.nativeEvent.layout.height; }}
    style={{ zIndex: dragging ? 2 : 0, transform: [{ translateY }], elevation: dragging ? 4 : 0 }}>
    <Pressable testID={`route-${role}-row`} accessibilityRole="button"
      accessibilityLabel={t('routes.editor.editEndpoint', { role: t(`routes.${role}`), name: label })}
      accessibilityHint={t('routes.editor.dragHint')}
      accessibilityActions={[{ name: 'activate', label: t('routes.editor.edit') }, { name: 'swap', label: t('routes.editor.swap') }]}
      onAccessibilityAction={e => e.nativeEvent.actionName === 'swap' ? onSwap() : onEdit(role)}
      delayLongPress={350} onPressIn={event => { if (!active.current) { suppressPress.current = false; startY.current = event.nativeEvent.pageY; } }}
      onLongPress={() => { active.current = true; suppressPress.current = true; setDragging(true); onDragging?.(true); }}
      onPress={() => { if (!suppressPress.current) onEdit(role); }}
      style={{ minHeight: 56, paddingVertical: 8, paddingHorizontal: 12, gap: 12, flexDirection: 'row', alignItems: 'center',
        backgroundColor: dragging ? theme.colors.surface : 'transparent', borderRadius: dragging ? 16 : 0 }}>
      {role === 'origin' ? <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        {point ? <OriginIcon /> : <OriginDeniedIcon />}
      </View> : <DestinationIcon />}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ color: theme.colors.textStrong, fontSize: 16, fontWeight: '500' }}>{label}</Text>
        <Text numberOfLines={1} style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{subtitle}</Text>
      </View>
    </Pressable>
  </Animated.View>;
}

export default function RouteEndpointRows(props: Props) {
  const theme = useTheme();
  return <View style={{ borderRadius: 20, backgroundColor: theme.colorScheme === 'dark' ? 'rgba(52,52,58,0.70)' : 'rgba(255,255,255,0.56)' }}>
    <EndpointRow {...props} role="origin" point={props.origin} />
    <View style={{ marginLeft: 56, height: 0.5, backgroundColor: theme.colors.border }} />
    <EndpointRow {...props} role="destination" point={props.destination} />
  </View>;
}
