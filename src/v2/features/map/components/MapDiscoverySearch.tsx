import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';

import type { MapPlaceResult } from '../model/mapDiscovery';
import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';

const CATEGORY_FILTERS = [
  { labelKey: 'map.filters.all', value: null },
  { labelKey: 'map.filters.food', value: 'FOOD' },
  { labelKey: 'map.filters.cafe', value: 'CAFE' },
  { labelKey: 'map.filters.fashion', value: 'FASHION' },
  { labelKey: 'map.filters.music', value: 'MUSIC' },
] as const;

type MapDiscoverySearchProps = {
  category: string | null;
  isBusy: boolean;
  onCategoryChange: (category: string | null) => void;
  onFocusChange: (focused: boolean) => void;
  onOpenProfile: () => void;
  onQueryChange: (query: string) => void;
  onSelectPlace: (place: MapPlaceResult) => void;
  query: string;
  results: MapPlaceResult[];
};

export default function MapDiscoverySearch({
  category,
  isBusy,
  onCategoryChange,
  onFocusChange,
  onOpenProfile,
  onQueryChange,
  onSelectPlace,
  query,
  results,
}: MapDiscoverySearchProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Panel>
      <SearchRow>
        <SearchInput
          accessibilityLabel={t('map.search.accessibilityLabel')}
          onBlur={() => onFocusChange(false)}
          onChangeText={onQueryChange}
          onFocus={() => onFocusChange(true)}
          onSubmitEditing={() => onFocusChange(false)}
          placeholder={t('map.search.placeholder')}
          returnKeyType="search"
          testID="v2-map-search-input"
          value={query}
        />
        {isBusy ? <ActivityIndicator color={theme.colors.primary} size="small" /> : null}
        <ProfileButton
          accessibilityLabel={t('map.search.profileAccessibilityLabel')}
          accessibilityRole="button"
          onPress={onOpenProfile}
          testID="v2-map-profile-button"
        >
          <AvatarPlaceholder height={28} width={28} />
        </ProfileButton>
      </SearchRow>

      <FilterScroll horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORY_FILTERS.map((filter) => {
          const selected = category === filter.value;
          return (
            <FilterChip
              key={filter.value ?? 'all'}
              $selected={selected}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onCategoryChange(filter.value)}
              testID={`v2-map-filter-${filter.value ?? 'all'}`}
            >
              <FilterLabel $selected={selected}>{t(filter.labelKey)}</FilterLabel>
            </FilterChip>
          );
        })}
      </FilterScroll>

      {results.length > 0 ? (
        <Results testID="v2-map-search-results">
          {results.slice(0, 6).map((place) => (
            <ResultRow
              key={place.id}
              accessibilityRole="button"
              onPress={() => onSelectPlace(place)}
            >
              <ResultText>
                <ResultName>{place.name}</ResultName>
                <ResultAddress numberOfLines={1}>{place.address}</ResultAddress>
              </ResultText>
              {place.distanceMeters !== null ? (
                <Distance>
                  {t('map.distanceMeters', { count: Math.round(place.distanceMeters) })}
                </Distance>
              ) : null}
            </ResultRow>
          ))}
        </Results>
      ) : null}
    </Panel>
  );
}

const Panel = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;
const SearchRow = styled.View`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: 0 ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;
const SearchInput = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;
const ProfileButton = styled.Pressable`
  align-items: center;
  justify-content: center;
`;
const FilterScroll = styled.ScrollView`flex-grow: 0;`;
const FilterChip = styled.Pressable<{ $selected: boolean }>`
  margin-right: ${({ theme }) => theme.spacing.xs}px;
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.md}px;
  border-width: 1px;
  border-color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ $selected, theme }) => $selected ? theme.colors.primarySoft : theme.colors.surface};
`;
const FilterLabel = styled.Text<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const Results = styled.View`
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.border};
`;
const ResultRow = styled.Pressable`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px;
`;
const ResultText = styled.View`flex: 1;`;
const ResultName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
`;
const ResultAddress = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const Distance = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
