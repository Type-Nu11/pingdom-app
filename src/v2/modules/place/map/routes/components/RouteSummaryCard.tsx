import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import StartIcon from '../assets/start.svg';

/** Shared geometry of Figma 8546:10715 (Transit) and 8546:10757 (Walk). */
export function RouteSummaryCard({ duration, subtitle, meta, recommended, onStart, actionLabel, actionHint, disabled, testID, children }: {
  duration: string; subtitle?: string; meta?: string; recommended?: boolean; onStart?: () => void;
  actionLabel?: string; actionHint?: string; disabled?: boolean; testID?: string; children?: ReactNode;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return <Card testID={testID} style={{ backgroundColor: theme.colorScheme === 'dark' ? 'rgba(52,52,58,0.70)' : 'rgba(255,255,255,0.56)' }}>
    <Top>
      <Info>
        <DurationRow>
          <Text style={{ color: theme.colors.textStrong, fontSize: 28, lineHeight: 36.4, fontWeight: '700' }}>{duration}</Text>
          {recommended && <Tag style={{ backgroundColor: theme.colors.primaryTint }}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, lineHeight: 15.6, fontWeight: '500' }}>{t('routes.design.best')}</Text>
          </Tag>}
        </DurationRow>
        {!!subtitle && <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 18.2, fontWeight: '500' }}>{subtitle}</Text>}
        {!!meta && <Text style={{ color: theme.colors.labelAssistive, fontSize: 12, lineHeight: 15.6 }}>{meta}</Text>}
      </Info>
      <Start testID={testID === 'transit-summary' ? 'transit-start-button' : undefined} accessibilityRole="button"
        accessibilityLabel={actionLabel ?? t('routes.start')} accessibilityHint={actionHint}
        disabled={disabled || !onStart} accessibilityState={{ disabled: disabled || !onStart }} onPress={onStart}
        style={{ backgroundColor: theme.colors.primary, opacity: disabled || !onStart ? 0.45 : 1 }}>
        <StartIcon /><Text style={{ color: '#FFFFFF', fontSize: 16, lineHeight: 20.8, fontWeight: '700' }}>{t('routes.start')}</Text>
      </Start>
    </Top>
    {children}
  </Card>;
}

export type RoutePages = { index: number; count: number; onSelect: (index: number) => void };
export function RoutePageIndicator({ index, count, onSelect }: RoutePages) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (count < 2) return null;
  return <Pages>{Array.from({ length: count }, (_, page) => <PageDot key={page} accessibilityRole="button"
    hitSlop={{ top: 16, bottom: 16, left: 3, right: 3 }} accessibilityLabel={t('routes.transit.route', { index: page + 1, total: count })}
    accessibilityState={{ selected: page === index }} onPress={() => onSelect(page)}
    style={{ width: page === index ? 16 : 6, backgroundColor: page === index ? theme.colors.primary : theme.colors.secondaryNormal }} />)}</Pages>;
}

const Card = styled.View`padding: 16px; border-radius: 24px; gap: 12px;`;
const Top = styled.View`flex-direction: row; align-items: center; gap: 12px;`;
const Info = styled.View`flex: 1; min-width: 0px; gap: 2px;`;
const DurationRow = styled.View`flex-direction: row; align-items: center; flex-wrap: wrap; gap: 8px;`;
const Tag = styled.View`padding: 4px 8px; border-radius: 8px;`;
const Start = styled.Pressable`min-height: 48px; padding: 12px 20px; border-radius: 24px; flex-direction: row; align-items: center; justify-content: center; gap: 6px;`;
const Pages = styled.View`height: 6px; flex-direction: row; align-items: center; justify-content: center; gap: 6px;`;
const PageDot = styled.Pressable`height: 6px; border-radius: 3px;`;
