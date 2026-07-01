import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../../../shared/components/Button';
import type { PlaceUploadPhoto } from '../../model/place.types';
import ExamplePhoto from './ExamplePhoto';

type PhotoSelectStepProps = {
  isPickingPhoto: boolean;
  onPickPhoto: () => void;
  selectedPhoto: PlaceUploadPhoto | null;
};

const PhotoSelectStep = ({ isPickingPhoto, onPickPhoto, selectedPhoto }: PhotoSelectStepProps) => {
  return (
    <ScrollView style={styles.photoScroll} contentContainerStyle={styles.photoContent}>
      <Text style={styles.title}>새로 게시할 장소의{'\n'}사진을 선택해 주세요.</Text>
      <Text style={styles.description}>
        사진함 권한을 허용하면 내 휴대폰에 있는 사진을 불러와 업로드할 수 있어요.
      </Text>

      <View style={styles.previewCard}>
        <ExamplePhoto uri={selectedPhoto?.uri} />
        {!selectedPhoto ? (
          <View pointerEvents="none" style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>아직 선택된 사진이 없어요</Text>
            <Text style={styles.emptyStateBody}>아래 버튼을 눌러 사진함에서 사진을 골라 주세요.</Text>
          </View>
        ) : null}
      </View>

      <Button
        label={selectedPhoto ? '사진 다시 고르기' : '사진함에서 선택'}
        loading={isPickingPhoto}
        style={styles.pickButton}
        onPress={onPickPhoto}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    color: '#3e414b',
    fontSize: 26,
    fontWeight: '500',
    lineHeight: 34,
    paddingHorizontal: 34,
    paddingTop: 18,
  },
  photoScroll: {
    flex: 1,
  },
  photoContent: {
    paddingBottom: 36,
  },
  description: {
    color: '#666b78',
    fontSize: 16,
    lineHeight: 23,
    paddingHorizontal: 34,
    paddingTop: 14,
  },
  previewCard: {
    alignSelf: 'center',
    borderRadius: 28,
    marginTop: 30,
    overflow: 'hidden',
    position: 'relative',
    width: '82%',
  },
  emptyState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(17, 18, 24, 0.28)',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyStateBody: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
  pickButton: {
    alignSelf: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 16,
    marginTop: 22,
    minHeight: 58,
    width: '82%',
  },
});

export default PhotoSelectStep;
