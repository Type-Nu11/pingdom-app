import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import { RoutePageIndicator, RouteSummaryCard, type RoutePages } from './RouteSummaryCard';
import WarningIcon from '../assets/walk_warning.svg';

/** Display text only, not an invented walking API contract. The caller supplies verified facts. */
export type WalkRouteSummary = {
  duration: string; arrival?: string; distance: string; steps?: string; slope?: string;
  tags?: { label: string; warning?: boolean }[];
};

export function WalkRouteResult({ summary, onStart, onDetails, pages }: { summary?: WalkRouteSummary; onStart?: () => void; onDetails?: () => void; pages?: RoutePages }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return <Results><RouteSummaryCard testID="walk-summary" duration={summary?.duration ?? '—'}
    subtitle={summary ? [summary.arrival, summary.distance].filter(Boolean).join(' · ') : t('routes.walking.idle')}
    meta={summary ? [summary.steps, summary.slope].filter(Boolean).join(' · ') : undefined}
    actionLabel={t('routes.tracking.start')} actionHint={t('routes.tracking.hint')}
    onStart={onStart} disabled={!summary || !onStart}>
    {!!summary?.tags?.length && <Tags>{summary.tags.map((tag, index) => <Tag key={index}
      style={{ backgroundColor: tag.warning ? theme.colors.warningSoft : theme.colors.fillNeutral }}>
      {tag.warning && <WarningIcon />}<Text style={{ color: theme.colors.textStrong, fontSize: 12, lineHeight: 15.6, fontWeight: '500' }}>{tag.label}</Text>
    </Tag>)}</Tags>}
  </RouteSummaryCard>{summary && onDetails && <DetailsButton accessibilityRole="button" accessibilityLabel={t('routes.transit.details')} onPress={onDetails}>
    <Text style={{ color: theme.colors.primary, fontSize: 14 }}>{t('routes.transit.details')}</Text>
  </DetailsButton>}{summary && pages && <RoutePageIndicator {...pages} />}</Results>;
}

const Tags = styled.View`flex-direction: row; flex-wrap: wrap; gap: 6px;`;
const DetailsButton = styled.Pressable`min-height: 44px; align-items: center; justify-content: center;`;
const Results = styled.View`gap: 12px;`;
const Tag = styled.View`flex-direction: row; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 8px;`;
