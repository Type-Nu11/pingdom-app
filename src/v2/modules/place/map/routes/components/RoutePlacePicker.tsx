import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import usePlaces from '../../../search/hooks/usePlaces';
import type { RouteEndpoint } from '../model/routePreparation';

type Props = { onSelect: (place: RouteEndpoint) => void; onCancel: () => void; onCurrentLocation?: () => void };
export default function RoutePlacePicker({ onSelect, onCancel, onCurrentLocation }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  useEffect(() => { const timer = setTimeout(() => setKeyword(text.trim()), 300); return () => clearTimeout(timer); }, [text]);
  const query = usePlaces({ keyword, limit: 20 }, keyword.length > 0);
  const waiting = text.trim() !== keyword;
  const button = { padding: 16, borderRadius: 12, backgroundColor: theme.colors.backgroundAssistive };
  return <View style={{ flex: 1, padding: 20, gap: 12 }}>
    <Pressable accessibilityRole="button" onPress={onCancel} style={button}><Text style={{ color: theme.colors.text }}>{t('map.route.back')}</Text></Pressable>
    <TextInput autoFocus accessibilityLabel={t('map.route.searchPlace')} placeholder={t('map.route.searchPlace')} placeholderTextColor={theme.colors.textMuted} value={text} onChangeText={setText} style={{ ...button, color: theme.colors.textStrong }} />
    {onCurrentLocation ? <Pressable accessibilityRole="button" onPress={onCurrentLocation} style={button}><Text style={{ color: theme.colors.primary }}>{t('map.route.currentPosition')}</Text></Pressable> : null}
    <Text style={{ color: theme.colors.textMuted }}>{t('map.route.searchHint')}</Text>
    {keyword && !waiting && query.isError ? <Pressable accessibilityRole="button" onPress={() => void query.refetch()} style={button}><Text style={{ color: theme.colors.text }}>{t('map.route.searchRetry')}</Text></Pressable> : null}
    {waiting || (keyword && query.isFetching) ? <ActivityIndicator accessibilityLabel={t('map.route.loading')} /> : null}
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
      {!waiting && !query.isFetching && !query.isError && keyword ? query.places.map(place => <Pressable key={place.id} accessibilityRole="button" onPress={() => onSelect({ ...place, placeId: place.id })} style={button}>
        <Text style={{ color: theme.colors.textStrong, fontWeight: '600' }}>{place.name}</Text><Text style={{ color: theme.colors.textMuted }}>{place.address}</Text>
      </Pressable>) : null}
      {keyword && !waiting && !query.isFetching && !query.isError && !query.places.length ? <Text style={{ color: theme.colors.textMuted }}>{t('map.route.searchEmpty')}</Text> : null}
    </ScrollView>
  </View>;
}
