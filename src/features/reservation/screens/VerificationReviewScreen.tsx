import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REASONS = [
  '친절해요',
  '찾기 쉬워요',
  '맛있어요',
  '다국어 설명이 잘 되어 있어요',
  '주차하기 편해요',
  '사진 찍기 좋아요',
  '매장이 깨끗해요',
] as const;
const REASON_ICONS: Record<typeof REASONS[number], string> = {
  '친절해요': '😇',
  '찾기 쉬워요': '📌',
  '맛있어요': '😋',
  '다국어 설명이 잘 되어 있어요': '🌐',
  '주차하기 편해요': 'P',
  '사진 찍기 좋아요': '📷',
  '매장이 깨끗해요': '✨',
};

type Props = {
  category: string;
  imageUrl?: string;
  onBack: () => void;
  placeName: string;
};

export default function VerificationReviewScreen({ category, imageUrl, onBack, placeName }: Props) {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedReasons, setSelectedReasons] = useState<string[]>(['친절해요', '맛있어요']);
  const [review, setReview] = useState('');

  const pickPhotos = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('사진 권한이 필요합니다', '설정에서 사진 접근을 허용해 주세요.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        mediaTypes: ['images'],
        quality: 0.85,
        selectionLimit: 3,
      });
      if (!result.canceled) setPhotos(result.assets.slice(0, 3).map((asset) => asset.uri));
    } catch {
      Alert.alert('사진을 불러오지 못했습니다', '잠시 후 다시 시도해 주세요.');
    }
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((current) => {
      if (current.includes(reason)) return current.filter((item) => item !== reason);
      if (current.length >= 5) return current;
      return [...current, reason];
    });
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable accessibilityLabel="뒤로 가기" accessibilityRole="button" onPress={onBack} style={styles.backButton}><Text style={styles.back}>‹</Text></Pressable>
        <Text accessibilityRole="header" style={styles.headerTitle}>검증하기</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 18) + 96 }]} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityRole="button" style={styles.placeCard}>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.placeImage} /> : <View style={styles.placeImage} />}
          <View style={styles.placeCopy}>
            <Text style={styles.category}>{category}</Text>
            <Text style={styles.placeName}>{placeName}  ›</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>사진 첨부</Text>
        <View style={styles.photoRow}>
          {photos.map((uri) => (
            <Pressable accessibilityLabel="첨부 사진 삭제" accessibilityRole="button" key={uri} onPress={() => setPhotos((items) => items.filter((item) => item !== uri))}>
              <Image source={{ uri }} style={styles.photo} />
            </Pressable>
          ))}
          {photos.length < 3 ? (
            <Pressable accessibilityLabel="사진 첨부" accessibilityRole="button" onPress={() => void pickPhotos()} style={styles.photoPicker}>
              <Text style={styles.photoIcon}>▧</Text>
              <Text style={styles.photoCount}>{photos.length}/3</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>추천 이유</Text>
        <Text style={styles.sectionDescription}>최대 5개까지 선택할 수 있어요</Text>
        <View style={styles.reasonWrap}>
          {REASONS.map((reason) => {
            const selected = selectedReasons.includes(reason);
            return (
              <Pressable accessibilityLabel={reason} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} key={reason} onPress={() => toggleReason(reason)} style={[styles.reason, selected && styles.reasonSelected]}>
                <Text style={styles.reasonIcon}>{REASON_ICONS[reason]}</Text>
                <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>{reason}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.selectedCount}><Text style={styles.selectedCountAccent}>{selectedReasons.length}</Text>/5개 선택됨</Text>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>후기 작성</Text>
        <TextInput
          accessibilityLabel="후기 작성"
          multiline
          onChangeText={setReview}
          placeholder="다른 사람들에게 user님의 후기를 알려주세요"
          placeholderTextColor="#777982"
          style={styles.input}
          textAlignVertical="top"
          value={review}
        />
      </ScrollView>
      <View style={[styles.submitWrap, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable accessibilityRole="button" onPress={() => Alert.alert('작성 완료', '리뷰 제출 API가 연결되면 등록할 수 있어요.')} style={styles.submitButton}>
          <Text style={styles.submitLabel}>리뷰하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { color: '#5D6068', fontSize: 36, lineHeight: 38 }, backButton: { alignItems: 'center', height: 46, justifyContent: 'center', width: 46 },
  category: { color: '#777982', fontSize: 13 }, content: { paddingHorizontal: 18 },
  divider: { backgroundColor: '#F4F4F5', height: 12, marginHorizontal: -18, marginVertical: 22 },
  header: { alignItems: 'center', flexDirection: 'row', paddingBottom: 12, paddingHorizontal: 18 }, headerSpacer: { width: 46 },
  headerTitle: { color: '#111217', flex: 1, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  input: { backgroundColor: '#F7F7F8', borderRadius: 14, color: '#24262B', fontSize: 15, height: 230, marginTop: 14, padding: 16 },
  photo: { borderRadius: 12, height: 92, width: 92 }, photoCount: { color: '#5F626A', fontSize: 14, fontWeight: '700' }, photoIcon: { color: '#5F626A', fontSize: 34 },
  photoPicker: { alignItems: 'center', backgroundColor: '#EEEFF1', borderRadius: 14, height: 112, justifyContent: 'center', width: 112 }, photoRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  placeCard: { alignItems: 'center', backgroundColor: '#F7F7F8', borderRadius: 14, flexDirection: 'row', marginBottom: 22, padding: 12 }, placeCopy: { gap: 5, marginLeft: 14 }, placeImage: { backgroundColor: '#E2E3E5', borderRadius: 8, height: 58, width: 58 }, placeName: { color: '#111217', fontSize: 18, fontWeight: '900' },
  reason: { alignItems: 'center', backgroundColor: '#F7F7F8', borderColor: 'transparent', borderRadius: 22, borderWidth: 1, flexDirection: 'row', gap: 7, paddingHorizontal: 15, paddingVertical: 10 },
  reasonIcon: { fontSize: 16 }, reasonSelected: { borderColor: '#FF1956' }, reasonText: { color: '#62656D', fontSize: 14 }, reasonTextSelected: { color: '#FF1956' }, reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 15 },
  screen: { backgroundColor: '#FFFFFF', flex: 1 }, sectionDescription: { color: '#6B6E76', fontSize: 14, marginTop: 4 }, sectionTitle: { color: '#15161A', fontSize: 20, fontWeight: '900' },
  selectedCount: { color: '#656870', fontSize: 14, marginTop: 14 }, selectedCountAccent: { color: '#FF1956', fontWeight: '800' },
  submitButton: { alignItems: 'center', backgroundColor: '#FF1956', borderRadius: 15, justifyContent: 'center', minHeight: 62 }, submitLabel: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' }, submitWrap: { backgroundColor: '#FFFFFF', bottom: 0, left: 0, paddingHorizontal: 18, paddingTop: 10, position: 'absolute', right: 0 },
});
