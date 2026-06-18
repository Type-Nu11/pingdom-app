import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../../../shared/components/Button';
import { PROFILE_USERNAME } from '../../../profile/constants/profileMock';
import type { PlaceCategory, PlaceUploadPhoto } from '../../model/place.types';
import ExamplePhoto from './ExamplePhoto';

type CaptionStepProps = {
  category: PlaceCategory;
  isUploading?: boolean;
  onChangeCategory: (category: PlaceCategory) => void;
  onUpload: () => void;
  placeName: string;
  selectedPhotos: PlaceUploadPhoto[];
};

const PLACE_CATEGORIES: Array<{ id: PlaceCategory; label: string }> = [
  { id: 'food', label: 'Food' },
  { id: 'music', label: 'Music' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'game', label: 'Game' },
];

const CaptionStep = ({
  category,
  isUploading = false,
  onChangeCategory,
  onUpload,
  placeName,
  selectedPhotos,
}: CaptionStepProps) => (
  <View style={styles.captionBody}>
    <View style={styles.authorRow}>
      <View style={styles.profileCircle}>
        <View style={styles.profileHead} />
        <View style={styles.profileBody} />
      </View>
      <View style={styles.authorTextGroup}>
        <Text numberOfLines={1} style={styles.username}>
          {PROFILE_USERNAME}
        </Text>
        <Text numberOfLines={1} style={styles.placeName}>
          {placeName}
        </Text>
      </View>
    </View>

    <View style={styles.heroPhoto}>
      <ExamplePhoto large uri={selectedPhotos[0]?.uri} />
      {selectedPhotos.length > 1 ? (
        <View style={styles.photoCountBadge}>
          <Text style={styles.photoCountText}>{selectedPhotos.length}장 선택됨</Text>
        </View>
      ) : null}
    </View>

    <View style={styles.categorySection}>
      <Text style={styles.categoryLabel}>카테고리</Text>
      <View style={styles.categoryRow}>
        {PLACE_CATEGORIES.map((item) => {
          const isSelected = category === item.id;

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.label} 카테고리 선택`}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => onChangeCategory(item.id)}
            >
              <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>

    <View style={styles.captionSection}>
      <TextInput
        multiline
        placeholder="캡션을 입력하세요..."
        placeholderTextColor="#8c8f99"
        style={styles.captionInput}
        textAlignVertical="top"
      />
      <View style={styles.captionDivider} />
    </View>

    <View style={styles.buttonArea}>
      <Button
        disabled={selectedPhotos.length === 0}
        label="업로드"
        labelStyle={styles.uploadText}
        loading={isUploading}
        style={styles.uploadButton}
        onPress={onUpload}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 18,
    paddingHorizontal: 26,
    paddingTop: 6,
  },
  authorTextGroup: {
    flex: 1,
  },
  buttonArea: {
    marginTop: 'auto',
    paddingBottom: 34,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  captionBody: {
    backgroundColor: '#fafafa',
    flex: 1,
  },
  captionDivider: {
    backgroundColor: '#8f929c',
    height: 1,
    width: '100%',
  },
  captionInput: {
    color: '#252833',
    fontSize: 16,
    fontWeight: '500',
    maxHeight: 118,
    minHeight: 78,
    paddingBottom: 12,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  captionSection: {
    paddingHorizontal: 32,
    paddingTop: 18,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: '#f6f6f7',
    borderColor: '#dedfe4',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    height: 38,
    justifyContent: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#ff1956',
    borderColor: '#ff1956',
  },
  categoryLabel: {
    color: '#777a84',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categorySection: {
    paddingHorizontal: 32,
    paddingTop: 18,
  },
  categoryText: {
    color: '#5e5e66',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  heroPhoto: {
    aspectRatio: 1,
    backgroundColor: '#05070d',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  photoCountBadge: {
    backgroundColor: 'rgba(12, 12, 13, 0.72)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  photoCountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  placeName: {
    color: '#22242b',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 2,
  },
  profileBody: {
    backgroundColor: '#686b76',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: 14,
    marginTop: 2,
    width: 24,
  },
  profileCircle: {
    alignItems: 'center',
    borderColor: '#686b76',
    borderRadius: 18,
    borderWidth: 3,
    height: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 36,
  },
  profileHead: {
    backgroundColor: '#686b76',
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  uploadButton: {
    backgroundColor: '#ff1956',
    borderRadius: 20,
    minHeight: 76,
    width: '100%',
  },
  uploadText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  username: {
    color: '#383b45',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default CaptionStep;
