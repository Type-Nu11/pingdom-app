import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

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
        <NotInterestedIcon height={24} width={24} />
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
        <ReportIcon height={24} width={24} />
        <RowLabelDanger>{t('community.report')}</RowLabelDanger>
      </Row>
    </AnchoredMenu>
  );
}

const Row = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 52px;
  padding: 0 16px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const RowLabel = styled(AppText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: 500;
`;

const RowLabelDanger = styled(AppText)`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 16px;
  font-weight: 500;
`;
