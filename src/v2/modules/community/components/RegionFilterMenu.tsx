import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import { COMMUNITY_REGIONS } from '../model/fixtures';
import type { CommunityRegion } from '../model/types';
import AnchoredMenu, { type AnchoredMenuPosition } from './AnchoredMenu';

type RegionFilterMenuProps = {
  onClose: () => void;
  onSelect: (region: CommunityRegion) => void;
  position: AnchoredMenuPosition;
  selectedRegion: CommunityRegion;
  visible: boolean;
};

export default function RegionFilterMenu({
  onClose,
  onSelect,
  position,
  selectedRegion,
  visible,
}: RegionFilterMenuProps) {
  const { t } = useTranslation();

  return (
    <AnchoredMenu dismissLabel={t('community.filter')} onClose={onClose} position={position} visible={visible}>
      {COMMUNITY_REGIONS.map((region, index) => {
        const selected = region.id === selectedRegion;
        return (
          <React.Fragment key={region.id}>
            {index > 0 ? <Divider /> : null}
            <Row
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                onSelect(region.id);
                onClose();
              }}
              testID={`v2-community-region-${region.id}`}
            >
              <RowLabel $selected={selected}>{t(`community.regions.${region.labelKey}`)}</RowLabel>
            </Row>
          </React.Fragment>
        );
      })}
    </AnchoredMenu>
  );
}

const Row = styled.Pressable`
  height: 52px;
  justify-content: center;
  padding: 0 16px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
`;

const RowLabel = styled(AppText)<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.text)};
  font-size: 16px;
  font-weight: 500;
`;
