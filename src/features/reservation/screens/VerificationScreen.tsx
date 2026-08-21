import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85',
] as const;

const VISITS = [
  { address: '12.3km · 경기도 고양시 일산서구 중앙로 1601 …', category: '음악', name: '고양종합운동장', pair: 0 },
  { address: '123m · 대구광역시 달성군 구지면 창리로11길 79-3', category: '음식점', name: '대성반점', pair: 2 },
  { address: '12.3km · 경기도 고양시 일산서구 중앙로 1601 …', category: '음악', name: '고양종합운동장', pair: 0 },
  { address: '123m · 대구광역시 달성군 구지면 창리로11길 79-3', category: '음식점', name: '대성반점', pair: 2 },
] as const;

function VisitCard({ onPress, visit }: { onPress: () => void; visit: typeof VISITS[number] }) {
  return (
    <Pressable accessibilityLabel={`${visit.name}, ${visit.address}`} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardHeading}>
        <Text style={styles.name}>{visit.name} <Text style={styles.category}>{visit.category}</Text></Text>
        <Text style={styles.more}>⋮</Text>
      </View>
      <Text numberOfLines={1} style={styles.address}>{visit.address}</Text>
      <View style={styles.images}>
        <Image source={{ uri: IMAGE_URLS[visit.pair] }} style={styles.image} />
        <Image source={{ uri: IMAGE_URLS[visit.pair + 1] }} style={styles.image} />
      </View>
    </Pressable>
  );
}

export default function VerificationScreen({
  onBack,
  onOpenPlace,
}: {
  onBack: () => void;
  onOpenPlace: (place: { category: string; imageUrl?: string; placeName: string }) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable accessibilityLabel="뒤로 가기" accessibilityRole="button" hitSlop={12} onPress={onBack} style={styles.backButton}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>검증하기</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>최근 방문</Text>
        {VISITS.map((visit, index) => (
          <VisitCard
            key={`${visit.name}-${index}`}
            onPress={() => onOpenPlace({
              category: visit.category,
              imageUrl: IMAGE_URLS[visit.pair],
              placeName: visit.name,
            })}
            visit={visit}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  address: { color: '#5E6068', fontSize: 14, marginBottom: 10, marginTop: 3 },
  back: { color: '#5D6068', fontSize: 36, fontWeight: '300', lineHeight: 38 },
  backButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, elevation: 2, height: 46, justifyContent: 'center', shadowColor: '#101828', shadowOffset: { height: 3, width: 0 }, shadowOpacity: 0.07, shadowRadius: 10, width: 46 },
  card: { borderBottomColor: '#E6E7E9', borderBottomWidth: 1, marginBottom: 16, paddingBottom: 16 },
  cardHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#777982', fontSize: 12, fontWeight: '500' },
  content: { paddingBottom: 30, paddingHorizontal: 20 },
  header: { alignItems: 'center', flexDirection: 'row', paddingBottom: 12, paddingHorizontal: 20 },
  headerSpacer: { width: 46 },
  image: { flex: 1, height: '100%' },
  images: { borderRadius: 14, flexDirection: 'row', gap: 2, height: 145, overflow: 'hidden' },
  more: { color: '#34363C', fontSize: 22, lineHeight: 24 },
  name: { color: '#34363C', fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.72 },
  screen: { backgroundColor: '#FFFFFF', flex: 1 },
  sectionTitle: { color: '#191A1E', fontSize: 20, fontWeight: '900', marginBottom: 22, marginTop: 8 },
  title: { color: '#111217', flex: 1, fontSize: 18, fontWeight: '900', textAlign: 'center' },
});
