import { Text as AppText } from '../../../shared/components/Typography';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import { textStyleCss } from '../../../shared/theme/typography';
import AnchoredMenu, { type AnchoredMenuPosition } from './AnchoredMenu';

export type CountryFilterMenuProps = {
  /** Codes from `GET /community/countries`, in server order. */
  countries: readonly string[];
  isError: boolean;
  isLoading: boolean;
  onClose: () => void;
  onRetry: () => void;
  /** Called with the picked code, or `null` when the active one is tapped again. */
  onSelect: (countryCode: string | null) => void;
  position: AnchoredMenuPosition;
  selectedCountryCode: string | null;
  visible: boolean;
};

// Figma `alert` (8241:46792): the same 200px frosted card as the post overflow
// menu, one 52px row per country with the active one in `Primary/Normal`. The
// design has no "all countries" row, so tapping the active country clears it.
export default function CountryFilterMenu({
  countries,
  isError,
  isLoading,
  onClose,
  onRetry,
  onSelect,
  position,
  selectedCountryCode,
  visible,
}: CountryFilterMenuProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <AnchoredMenu dismissLabel={t('community.filter.dismiss')} onClose={onClose} position={position} visible={visible}>
      {isLoading ? (
        <StateRow accessibilityLabel={t('community.filter.loading')} accessible testID="v2-community-country-loading">
          <ActivityIndicator color={theme.colors.primary} />
        </StateRow>
      ) : isError ? (
        <StateColumn testID="v2-community-country-error">
          <StateText accessibilityRole="alert">{t('community.filter.loadError')}</StateText>
          <RetryButton accessibilityRole="button" onPress={onRetry} testID="v2-community-country-retry">
            <RetryLabel>{t('community.filter.retry')}</RetryLabel>
          </RetryButton>
        </StateColumn>
      ) : countries.map((countryCode, index) => {
        const selected = countryCode === selectedCountryCode;
        return (
          <React.Fragment key={countryCode}>
            <Row
              $first={index === 0}
              accessibilityHint={t(selected ? 'community.filter.hintClear' : 'community.filter.hintSelect')}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                onSelect(selected ? null : countryCode);
                onClose();
              }}
              testID={`v2-community-country-${countryCode}`}
            >
              <RowLabel $selected={selected}>
                {t(`community.countries.${countryCode}`, { defaultValue: countryCode })}
              </RowLabel>
            </Row>
          </React.Fragment>
        );
      })}
    </AnchoredMenu>
  );
}

// Figma `Text Field` rows: 52px tall, 6px apart, each after the first opening
// with a 1px `Secondary/Alternative` separator across its 8px-inset contents.
const Row = styled.Pressable<{ $first: boolean }>`
  height: 52px;
  margin: ${({ $first }) => ($first ? 0 : 6)}px 8px 0;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: ${({ $first, theme }) => ($first ? 'transparent' : theme.colors.secondaryAlternative)};
`;

const RowLabel = styled(AppText)<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.labelNeutral)};
  ${({ theme }) => textStyleCss(theme.typography.bodyMedium)}
`;

const StateRow = styled.View`height: 52px; align-items: center; justify-content: center;`;
const StateColumn = styled.View`align-items: flex-start; gap: 8px; padding: 12px 8px;`;
const StateText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; ${({ theme }) => textStyleCss(theme.typography.labelRegular)}`;
const RetryButton = styled.Pressable`padding: 6px 14px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary};`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; ${({ theme }) => textStyleCss(theme.typography.captionBold)}`;
