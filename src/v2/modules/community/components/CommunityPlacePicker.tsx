import { Text as AppText, TextInput as AppTextInput } from '../../../shared/components/Typography';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackButtonIcon from '../../../../assets/v2/icons/community/back-button.svg';
import { env } from '../../../shared/config';
// Reuses the same Pingdom place search the map's search overlay is built on
// (`usePlaceAutocomplete`), never the Kakao local-search hook — Kakao results
// have no server placeId and cannot be sent as `placeIds`.
import { usePlaceAutocomplete } from '../../place/search';
import type { WritePlaceTag } from '../model/writeForm';

export type CommunityPlacePickerProps = {
  onClose: () => void;
  onSelect: (place: WritePlaceTag) => void;
};

export default function CommunityPlacePicker({ onClose, onSelect }: CommunityPlacePickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim();
  const autocomplete = usePlaceAutocomplete(
    { keyword: trimmedQuery, limit: 20 },
    { enabled: env.featureFlags.placeList && trimmedQuery.length > 0 },
  );
  const results = (autocomplete.data?.places ?? []).filter(
    (place): place is typeof place & { id: number; name: string } =>
      place.id !== undefined && Boolean(place.name),
  );

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-community-place-picker">
      <Header>
        <BackButton
          accessibilityLabel={t('community.write_screen.placePicker.close')}
          accessibilityRole="button"
          onPress={onClose}
        >
          <BackButtonIcon height={42} width={40} />
        </BackButton>
        <SearchField
          autoFocus
          onChangeText={setQuery}
          placeholder={t('community.write_screen.placePicker.placeholder')}
          placeholderTextColor={theme.colors.textAlternative}
          returnKeyType="search"
          testID="v2-community-place-picker-input"
          value={query}
        />
      </Header>

      {!env.featureFlags.placeList ? (
        <StateBox testID="v2-community-place-picker-disabled">
          <StateText>{t('community.write_screen.placePicker.disabled')}</StateText>
        </StateBox>
      ) : trimmedQuery.length === 0 ? (
        <StateBox>
          <StateText>{t('community.write_screen.placePicker.prompt')}</StateText>
        </StateBox>
      ) : autocomplete.isFetching ? (
        <StateBox testID="v2-community-place-picker-loading">
          <ActivityIndicator color={theme.colors.primary} />
        </StateBox>
      ) : autocomplete.isError ? (
        <StateBox testID="v2-community-place-picker-error">
          <StateText>{t('community.write_screen.placePicker.error')}</StateText>
          <RetryButton accessibilityRole="button" onPress={() => void autocomplete.refetch()}>
            <RetryLabel>{t('community.write_screen.placePicker.retry')}</RetryLabel>
          </RetryButton>
        </StateBox>
      ) : results.length === 0 ? (
        <StateBox testID="v2-community-place-picker-empty">
          <StateText>{t('community.write_screen.placePicker.empty')}</StateText>
        </StateBox>
      ) : (
        <FlatList
          data={results}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ResultRow
              accessibilityLabel={item.name}
              accessibilityRole="button"
              onPress={() => onSelect({
                address: item.address ?? '',
                category: item.category ?? '',
                id: item.id,
                name: item.name,
              })}
              testID={`v2-community-place-picker-result-${item.id}`}
            >
              <ResultName numberOfLines={1}>{item.name}</ResultName>
              {item.address ? <ResultAddress numberOfLines={1}>{item.address}</ResultAddress> : null}
            </ResultRow>
          )}
        />
      )}
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const BackButton = styled.Pressable`width: 40px; height: 42px; align-items: center; justify-content: center;`;
const SearchField = styled(AppTextInput)`flex: 1; height: 44px; padding: 0 14px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.backgroundAssistive}; color: ${({ theme }) => theme.colors.text}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;

const StateBox = styled.View`flex: 1; align-items: center; justify-content: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.xl}px;`;
const StateText = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; text-align: center;`;
const RetryButton = styled.Pressable`padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primarySoft};`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;

const ResultRow = styled.Pressable`padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px; border-bottom-width: 1px; border-bottom-color: ${({ theme }) => theme.colors.border};`;
const ResultName = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; font-weight: 700;`;
const ResultAddress = styled(AppText)`margin-top: 4px; color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
