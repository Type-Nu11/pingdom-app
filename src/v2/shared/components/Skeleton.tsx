import React, { type PropsWithChildren } from 'react';
import { Animated, View, type DimensionValue, type ViewProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';

import { useSharedPulse } from '../hooks/useSharedPulse';

export type SkeletonVariant = 'list' | 'place' | 'detail' | 'reservation' | 'reservation-detail' | 'profile' | 'profile-form' | 'settings' | 'menu' | 'post' | 'post-list' | 'comments' | 'chips' | 'slots' | 'text' | 'stat';

/** One accessible loading region; its shapes are decorative, never focusable. */
export function SkeletonGroup({ children, accessibilityLabel, style, ...props }: PropsWithChildren<ViewProps>) {
  const opacity = useSharedPulse();
  const { t } = useTranslation();
  return (
    <View {...props} accessible accessibilityLabel={accessibilityLabel ?? t('experience.common.loading')}
      accessibilityRole="progressbar" accessibilityState={{ busy: true }} style={style} pointerEvents="none">
      <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ opacity }}>
        {children}
      </Animated.View>
    </View>
  );
}

export function SkeletonBlock({ width = '100%', height = 14, radius = 6, style, ...props }: ViewProps & {
  width?: DimensionValue; height?: number; radius?: number;
}) {
  const theme = useTheme();
  return <View {...props} style={[{ width, height, borderRadius: radius, backgroundColor: theme.colors.border }, style]} />;
}

function Lines({ large = false }: { large?: boolean }) {
  return <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 10 }}>
    <SkeletonBlock width="68%" height={large ? 22 : 16} />
    <SkeletonBlock width="92%" height={12} />
    <SkeletonBlock width="44%" height={12} />
  </View>;
}

export function SkeletonContent({ variant = 'list', count }: { variant?: SkeletonVariant; count?: number }) {
  const theme = useTheme();
  const card = { padding: 16, gap: 16, borderRadius: theme.radius.lg, backgroundColor: theme.colors.surfaceMuted };
  if (variant === 'stat') return <SkeletonBlock width={32} height={22} />;
  if (variant === 'comments') return <View style={{ gap: 16 }}>
    {Array.from({ length: count ?? 3 }, (_, i) => <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
      <SkeletonBlock width={32} height={32} radius={16} />
      <View style={{ flex: 1, gap: 6 }}><SkeletonBlock width="35%" height={12} /><SkeletonBlock width="85%" height={12} /></View>
    </View>)}
  </View>;
  if (variant === 'post-list') return <View style={{ gap: 14 }}>
    {Array.from({ length: count ?? 3 }, (_, i) => <View key={i} style={card}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <SkeletonBlock width={32} height={32} radius={16} /><SkeletonBlock width="35%" height={12} />
      </View>
      <SkeletonBlock width="80%" height={18} /><SkeletonBlock width="95%" height={12} />
      <SkeletonBlock width="35%" height={12} />
    </View>)}
  </View>;
  if (variant === 'chips' || variant === 'slots') return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {Array.from({ length: count ?? (variant === 'slots' ? 6 : 3) }, (_, i) => <SkeletonBlock key={i} width={variant === 'slots' ? 88 : 64} height={variant === 'slots' ? 44 : 34} radius={variant === 'slots' ? 12 : 17} />)}
  </View>;
  if (variant === 'text') return <Lines />;
  if (variant === 'profile') return <View style={{ gap: 16 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}><SkeletonBlock width={56} height={56} radius={28} /><Lines /></View>
  </View>;
  if (variant === 'profile-form') return <View style={{ gap: 24 }}>
    <SkeletonBlock width={82} height={82} radius={41} style={{ alignSelf: 'center', marginVertical: 24 }} />
    {Array.from({ length: 4 }, (_, i) => <View key={i} style={{ gap: 12 }}>
      <SkeletonBlock width="30%" /><SkeletonBlock height={44} radius={12} />
    </View>)}
  </View>;
  if (variant === 'reservation-detail') return <View style={card}>
    <SkeletonBlock width="30%" /><SkeletonBlock width="50%" height={28} />
    {Array.from({ length: 6 }, (_, i) => <View key={i} style={{ gap: 8, paddingVertical: 4 }}>
      <SkeletonBlock width="25%" height={12} /><SkeletonBlock width={i === 2 ? '85%' : '55%'} height={18} />
    </View>)}
  </View>;
  if (variant === 'detail' || variant === 'post') return <View style={card}>
    {variant === 'post' ? <View style={{ flexDirection: 'row', gap: 12 }}><SkeletonBlock width={40} height={40} radius={20} /><Lines /></View> : null}
    <Lines large />
    <SkeletonBlock height={variant === 'post' ? 180 : 140} radius={12} />
    <Lines /><View style={{ height: 8 }} /><Lines />
  </View>;
  return <View style={{ gap: 12 }}>
    {Array.from({ length: count ?? (variant === 'place' ? 1 : 3) }, (_, i) => (
      <View key={i} style={[card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        {variant !== 'settings' && variant !== 'reservation' ? <SkeletonBlock width={72} height={72} radius={12} /> : null}
        <Lines />
        {variant === 'settings' ? <SkeletonBlock width={44} height={26} radius={13} /> : null}
        {variant === 'menu' ? <SkeletonBlock width={42} height={16} /> : null}
      </View>
    ))}
  </View>;
}

export default function Skeleton({ variant = 'list', count, ...props }: ViewProps & { variant?: SkeletonVariant; count?: number }) {
  return <SkeletonGroup {...props}><SkeletonContent variant={variant} count={count} /></SkeletonGroup>;
}
