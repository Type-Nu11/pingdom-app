import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import type { WalkingRoute } from '../api/walkingRoutesApi';
import { routeMetrics } from '../model/routePresentation';

export function WalkingRouteDetails({ route, originName, destinationName, topInset, bottomInset, onBack }: {
  route: WalkingRoute; originName?: string; destinationName?: string;
  topInset: number; bottomInset: number; onBack: () => void;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const language = i18n.resolvedLanguage ?? 'en';
  const metrics = routeMetrics(route, language, t);
  return <View testID="walk-details" accessibilityViewIsModal style={{ position: 'absolute', inset: 0,
    backgroundColor: theme.colors.background, paddingTop: topInset, paddingBottom: bottomInset }}>
    <Pressable accessibilityRole="button" accessibilityLabel={t('routes.transit.back')} onPress={onBack}
      style={{ minHeight: 48, padding: 16 }}><Text style={{ color: theme.colors.primary }}>{t('routes.transit.back')}</Text></Pressable>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text accessibilityRole="header" style={{ color: theme.colors.textStrong, fontSize: 24, fontWeight: '700' }}>{t('routes.modes.walk')} · {t('routes.transit.details')}</Text>
      <Text style={{ color: theme.colors.textStrong }}>{originName} → {destinationName}</Text>
      <Text style={{ color: theme.colors.textStrong }}>{metrics.duration} · {metrics.distance}</Text>
      <Text style={{ color: theme.colors.textSecondary }}>TMAP · {t('routes.tracking.durationAtLookup')}</Text>
      {route.steps.map((step, index) => <View key={index} style={{ padding: 16, gap: 8, borderRadius: 16, backgroundColor: theme.colors.surfaceMuted }}>
        {!!step.instruction && <Text style={{ color: theme.colors.textStrong }}>{index + 1}. {step.instruction}</Text>}
        {(step.distanceMeters != null || step.durationSeconds != null) && <Text style={{ color: theme.colors.textSecondary }}>
          {[step.durationSeconds != null ? routeMetrics({ ...route, durationSeconds: step.durationSeconds }, language, t).duration : undefined,
            step.distanceMeters != null ? routeMetrics({ ...route, distanceMeters: step.distanceMeters }, language, t).distance : undefined].filter(Boolean).join(' · ')}
        </Text>}
      </View>)}
    </ScrollView>
  </View>;
}
