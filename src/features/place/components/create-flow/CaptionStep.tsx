import { StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../../../../shared/components/Button';
import { SELECTED_PLACE } from './constants';
import ExamplePhoto from './ExamplePhoto';

type CaptionStepProps = {
  onUpload: () => void;
};

const CaptionStep = ({ onUpload }: CaptionStepProps) => (
  <View style={styles.captionBody}>
    <View style={styles.authorRow}>
      <View style={styles.profileCircle}>
        <View style={styles.profileHead} />
        <View style={styles.profileBody} />
      </View>
      <View>
        <Text style={styles.username}>woo._sm</Text>
        <Text style={styles.placeName}>{SELECTED_PLACE.name}</Text>
      </View>
    </View>
    <View style={styles.heroPhoto}>
      <ExamplePhoto large />
    </View>
    <TextInput
      multiline
      style={styles.captionInput}
      placeholder="캡션을 입력하세요..."
      placeholderTextColor="#111"
    />
    <Button
      label="업로드"
      labelStyle={styles.uploadText}
      style={styles.uploadButton}
      onPress={onUpload}
    />
  </View>
);

const styles = StyleSheet.create({
  captionBody: {
    flex: 1,
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
    minHeight: 120,
    paddingHorizontal: 34,
    paddingTop: 22,
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
