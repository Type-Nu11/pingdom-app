import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { reviewReasonLabelKey, type ReviewReasonKey } from '../api/reviewReasons';
import { ReviewReasonIcon } from './ReviewReasonIcon';
import { Text as AppText } from './Typography';

export type ReviewFeatureTagsVariant = 'full' | 'summary';

export type ReviewFeatureTagsProps = {
  /** Normalized reasons (known codes only, de-duplicated, server order). */
  reasons: readonly ReviewReasonKey[];
  appearance?: 'default' | 'placeDetail';
  testID?: string;
  /** `summary`: first chip plus a `+N` chip. `full`: every chip, wrapping onto further lines. */
  variant: ReviewFeatureTagsVariant;
};

const ICON_HEIGHT = 14;

export function ReviewFeatureTags({ reasons, testID = 'review-feature-tags', variant, appearance = 'default' }: ReviewFeatureTagsProps) {
  const { t } = useTranslation();
  if (reasons.length === 0) return null;

  const visible = variant === 'summary' ? reasons.slice(0, 1) : reasons;
  const hiddenCount = reasons.length - visible.length;

  return (
    <Row testID={testID}>
      {visible.map((reason) => {
        const label = t(reviewReasonLabelKey(reason));
        return (
          <Chip $placeDetail={appearance === 'placeDetail'} accessibilityLabel={label} accessible key={reason} testID={`${testID}-${reason}`}>
            <ReviewReasonIcon height={ICON_HEIGHT} reason={reason} testID={`${testID}-${reason}-icon`} />
            <Label $placeDetail={appearance === 'placeDetail'} ellipsizeMode="tail" numberOfLines={1}>{label}</Label>
          </Chip>
        );
      })}
      {hiddenCount > 0 ? (
        <Chip $placeDetail={appearance === 'placeDetail'}
          accessibilityLabel={t('visitVerification.reasonMoreCount', { count: hiddenCount })}
          accessible
          testID={`${testID}-more`}
        >
          <Label $placeDetail={appearance === 'placeDetail'}>{`+${hiddenCount}`}</Label>
        </Chip>
      ) : null}
    </Row>
  );
}

// Compact display chip measured from the review-summary design (no Figma display variant exists).
const CHIP_GAP = 6;

const Row = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: ${CHIP_GAP}px;
`;

const Chip = styled.View<{ $placeDetail: boolean }>`
  max-width: 100%;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme, $placeDetail }) => $placeDetail ? 8 : theme.radius.full}px;
  background-color: ${({ theme, $placeDetail }) => $placeDetail ? theme.colors.backgroundNeutral : theme.colors.backgroundAssistive};
`;

const Label = styled(AppText)<{ $placeDetail: boolean }>`
  flex-shrink: 1;
  color: ${({ theme, $placeDetail }) => $placeDetail ? theme.colors.text : theme.colors.textAlternative};
  font-size: ${({ theme }) => theme.typography.captionMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.captionMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.captionMedium.lineHeight}px;
`;
