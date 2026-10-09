import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import type { CarRoute } from './routeApi';

export default function CarDirectionsOverlay({ status, route, errorKey, onClose, onRetry, onExternal, top }: {
  status: string; route?: CarRoute; errorKey?: string; onClose: () => void;
  onRetry: () => void; onExternal: () => void; top: number;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  if (status === 'idle') return null;
  const textStyle = { color: theme.colors.text, fontSize: 14 };
  const distance = route ? route.distanceMeters < 1000
    ? `${route.distanceMeters.toLocaleString(i18n.language)} m`
    : `${(route.distanceMeters / 1000).toLocaleString(i18n.language, { maximumFractionDigits: 1 })} km` : '';
  return <View style={{ position: 'absolute', top, left: 16, right: 16, padding: 14, borderRadius: 16, backgroundColor: theme.colors.surface }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={[textStyle, { fontWeight: '700' }]}>{t('carDirections.title')}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.navigation.close')} onPress={onClose} style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={textStyle}>×</Text>
      </Pressable>
    </View>
    <View accessibilityLiveRegion="polite">
      {status === 'loading' && <ActivityIndicator color={theme.colors.primary} />}
      <Text style={textStyle}>{status === 'loading' ? t('carDirections.loading') : route
        ? t('carDirections.summary', { distance, minutes: Math.max(1, Math.ceil(route.durationSeconds / 60)).toLocaleString(i18n.language) })
        : t(`carDirections.${errorKey ?? 'failed'}`)}</Text>
      {route && <Text style={[textStyle, { marginTop: 4 }]}>{t('carDirections.provider')}</Text>}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 12 }}>
      {status !== 'loading' && <Pressable accessibilityRole="button" onPress={onRetry} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.colors.primary }}>{t('carDirections.retry')}</Text></Pressable>}
      <Pressable accessibilityRole="button" onPress={onExternal} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: theme.colors.primary }}>{t('carDirections.external')}</Text></Pressable>
    </View>
  </View>;
}
