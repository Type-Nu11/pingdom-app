import { Image, StyleSheet, View } from 'react-native';

const examplePhotoSource = require('../../../../assets/v2/images/spki.webp');

type ExamplePhotoProps = {
  large?: boolean;
  uri?: string | null;
};

const ExamplePhoto = ({ large = false, uri }: ExamplePhotoProps) => (
  <View style={[styles.examplePhoto, large && styles.examplePhotoLarge]}>
    <Image
      source={uri ? { uri } : examplePhotoSource}
      resizeMode={large ? 'contain' : 'cover'}
      style={styles.image}
    />
  </View>
);

const styles = StyleSheet.create({
  examplePhoto: {
    aspectRatio: 1,
    backgroundColor: '#05070d',
    borderColor: '#f1f1f4',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '100%',
  },
  examplePhotoLarge: {
    borderWidth: 0,
    height: '100%',
    width: '72%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});

export default ExamplePhoto;
