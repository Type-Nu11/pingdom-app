import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../../../shared/components/Button';
import type { PlaceUploadPhoto } from '../../model/place.types';
import ExamplePhoto from './ExamplePhoto';

export type PostCategory = 'food' | 'music' | 'fashion' | 'game';

const POST_CATEGORY_OPTIONS: Array<{
  id: PostCategory;
  label: string;
}> = [
  { id: 'food', label: 'Food' },
  { id: 'music', label: 'Music' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'game', label: 'Game' },
];

type CaptionStepProps = {
  caption: string;
  isUploading?: boolean;
  onChangeCaption: (caption: string) => void;
  onChangeCategory: (category: PostCategory) => void;
  onUpload: () => void;
  placeName: string;
  selectedCategory: PostCategory;
  selectedPhoto: PlaceUploadPhoto | null;
};

const CaptionStep = ({
  caption,
  isUploading = false,
  onChangeCaption,
  onChangeCategory,
  onUpload,
  placeName,
  selectedCategory,
  selectedPhoto,
}: CaptionStepProps) => (
  <View style={styles.captionBody}>
    <View style={styles.authorRow}>
      <View style={styles.profileCircle}>
        <View style={styles.profileHead} />
        <View style={styles.profileBody} />
      </View>
      <View>
        <Text style={styles.username}>woo._sm</Text>
        <Text style={styles.placeName}>{placeName}</Text>
      </View>
    </View>
    <View style={styles.heroPhoto}>
      <ExamplePhoto large uri={selectedPhoto?.uri} />
    </View>
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>카테고리</Text>
      <View style={styles.categoryList}>
        {POST_CATEGORY_OPTIONS.map((category) => {
          const isSelected = selectedCategory === category.id;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={category.id}
              style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              onPress={() => onChangeCategory(category.id)}
            >
              <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
    <TextInput
      multiline
      style={styles.captionInput}
      placeholder="캡션을 입력하세요..."
      placeholderTextColor="#111"
      value={caption}
      onChangeText={onChangeCaption}
    />
    <Button
      disabled={!selectedPhoto}
      label="업로드"
      labelStyle={styles.uploadText}
      loading={isUploading}
      style={styles.uploadButton}
      onPress={onUpload}
    />
  </View>
);

const styles = StyleSheet.create({
  captionBody: {
    flex: 1,
  },
  categoryChip: {
    alignItems: 'center',
    borderColor: '#dedfe4',
    borderRadius: 999,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  categoryChipSelected: {
    backgroundColor: '#ff1956',
    borderColor: '#ff1956',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 12,
  },
  categorySection: {
    paddingHorizontal: 34,
    paddingTop: 18,
  },
  categoryText: {
    color: '#626674',
    fontSize: 13,
    fontWeight: '800',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  categoryTitle: {
    color: '#30333c',
    fontSize: 15,
    fontWeight: '900',
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 26,
    paddingHorizontal: 34,
    paddingTop: 42,
  },
  profileCircle: {
    alignItems: 'center',
    borderColor: '#686b76',
    borderRadius: 22,
    borderWidth: 4,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  profileHead: {
    backgroundColor: '#686b76',
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  profileBody: {
    backgroundColor: '#686b76',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: 16,
    marginTop: 2,
    width: 28,
  },
  username: {
    color: '#30333c',
    fontSize: 16,
    fontWeight: '600',
  },
  placeName: {
    color: '#111',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  heroPhoto: {
    alignItems: 'center',
    backgroundColor: '#05070d',
    height: '46%',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  captionInput: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
    minHeight: 96,
    paddingHorizontal: 34,
    paddingTop: 18,
    textAlignVertical: 'top',
  },
  uploadButton: {
    alignSelf: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 16,
    bottom: 58,
    height: 66,
    minHeight: 66,
    position: 'absolute',
    width: '82%',
  },
  uploadText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
});

export default CaptionStep;
