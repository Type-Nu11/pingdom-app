import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import styled from 'styled-components/native';

import { textStyleCss } from '../../../shared/theme/typography';

export type CategoryTagProps = {
  label: string;
  testID?: string;
};

// Figma `community-categories`: 24px Fill/Neutral chip with a Caption/Medium
// Label/Neutral label, shared by the feed card and the post detail.
export default function CategoryTag({ label, testID }: CategoryTagProps) {
  return (
    <Tag testID={testID}>
      <TagLabel numberOfLines={1}>{label}</TagLabel>
    </Tag>
  );
}

const Tag = styled.View`
  align-self: flex-start;
  height: 24px;
  justify-content: center;
  padding: 0 8px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.fillNeutral};
`;

const TagLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNeutral};
  ${({ theme }) => textStyleCss(theme.typography.captionMedium)}
`;
