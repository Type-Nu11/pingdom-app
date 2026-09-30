import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import { textStyleCss } from '../../../shared/theme/typography';

import NotInterestedIcon from '../../../../assets/v2/icons/community/not-interested.svg';
import ReportIcon from '../../../../assets/v2/icons/community/report.svg';
import AnchoredMenu, { type AnchoredMenuPosition } from './AnchoredMenu';

type PostOverflowMenuProps = {
  onClose: () => void;
  onNotInterested: () => void;
  onReport: () => void;
  position: AnchoredMenuPosition;
  visible: boolean;
};

export default function PostOverflowMenu({
  onClose,
  onNotInterested,
  onReport,
  position,
  visible,
}: PostOverflowMenuProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <AnchoredMenu dismissLabel={t('community.moreOptions')} onClose={onClose} position={position} visible={visible}>
      <Row
        accessibilityRole="button"
        onPress={() => {
          onNotInterested();
          onClose();
        }}
        testID="v2-community-overflow-not-interested"
      >
        <IconBox>
          <NotInterestedIcon color={theme.colors.labelNeutral} height={18} width={18} />
        </IconBox>
        <RowLabel>{t('community.notInterested')}</RowLabel>
      </Row>
      <Divider />
      <Row
        accessibilityRole="button"
        onPress={() => {
          onReport();
          onClose();
        }}
        testID="v2-community-overflow-report"
      >
        <ReportIcon color={theme.colors.danger} height={24} width={24} />
        <RowLabelDanger>{t('community.report')}</RowLabelDanger>
      </Row>
    </AnchoredMenu>
  );
}

const Row = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  height: 52px;
  padding: 0 8px;
`;

// Rows sit 6px apart with the 1px divider centred in the gap.
// Figma's `Not interested` instance is a 24px slot around an 18px glyph, which
// is exactly the exported artboard — scaling the artboard to 24 overdraws it.
const IconBox = styled.View`
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
`;

const Divider = styled.View`
  height: 1px;
  margin: 2.5px 0;
  background-color: ${({ theme }) => theme.colors.secondaryAlternative};
`;

const RowLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.labelNeutral};
  ${({ theme }) => textStyleCss(theme.typography.bodyMedium)}
`;

const RowLabelDanger = styled(AppText)`
  color: ${({ theme }) => theme.colors.danger};
  ${({ theme }) => textStyleCss(theme.typography.bodyMedium)}
`;
