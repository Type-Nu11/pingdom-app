import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from '../../../../shared/components/Button';
import type { PlaceUploadPhoto } from '../../model/place.types';
import ExamplePhoto from './ExamplePhoto';

type PhotoSelectStepProps = {
  isPickingPhoto: boolean;
  onPickPhoto: () => void;
  selectedPhoto: PlaceUploadPhoto | null;
};

const PhotoSelectStep = ({ isPickingPhoto, onPickPhoto, selectedPhoto }: PhotoSelectStepProps) => {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.photoScroll} contentContainerStyle={styles.photoContent}>
      <Text style={styles.title}>{t('placeCreate.photo.title')}</Text>
      <Text style={styles.description}>
        {t('placeCreate.photo.description')}
      </Text>

      <View style={styles.previewCard}>
        {selectedPhoto ? (
          <ExamplePhoto uri={selectedPhoto.uri} />
        ) : (
          <View style={styles.placeholderPhoto}>
            <View pointerEvents="none" style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>{t('placeCreate.photo.emptyTitle')}</Text>
              <Text style={styles.emptyStateBody}>{t('placeCreate.photo.emptyBody')}</Text>
            </View>
          </View>
        )}
      </View>

      <Button
        label={selectedPhoto ? t('placeCreate.photo.chooseAgain') : t('placeCreate.photo.pickFromLibrary')}
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
  placeholderPhoto: {
    aspectRatio: 1,
    backgroundColor: '#eef0f4',
    borderColor: '#dedfe6',
    borderWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  emptyState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  emptyStateTitle: {
    color: '#3e414b',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyStateBody: {
    color: '#666b78',
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
