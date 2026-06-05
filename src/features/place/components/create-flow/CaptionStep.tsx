import { StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../../../shared/components/Button';
import { PROFILE_USERNAME } from '../../../profile/constants/profileMock';
import type { PlaceUploadPhoto } from '../../model/place.types';
import ExamplePhoto from './ExamplePhoto';

type CaptionStepProps = {
  isUploading?: boolean;
  onUpload: () => void;
  placeName: string;
  selectedPhoto: PlaceUploadPhoto | null;
};

const CaptionStep = ({ isUploading = false, onUpload, placeName, selectedPhoto }: CaptionStepProps) => (
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
      <ExamplePhoto large uri={selectedPhoto?.uri} />
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
        disabled={!selectedPhoto}
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
    paddingTop: 26,
  },
  heroPhoto: {
    aspectRatio: 1,
    backgroundColor: '#05070d',
    overflow: 'hidden',
    width: '100%',
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
