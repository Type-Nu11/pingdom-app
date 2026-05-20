import { StyleSheet, View } from 'react-native';

type ExamplePhotoProps = {
  large?: boolean;
};

const ExamplePhoto = ({ large = false }: ExamplePhotoProps) => (
  <View style={[styles.examplePhoto, large && styles.examplePhotoLarge]}>
    <View style={styles.photoSky} />
    <View style={styles.stadiumRoof}>
      <View style={styles.roofLine} />
      <View style={[styles.roofLine, styles.roofLineSecond]} />
      <View style={[styles.roofLine, styles.roofLineThird]} />
    </View>
    <View style={styles.photoBuilding}>
      <View style={styles.poster} />
      <View style={[styles.poster, styles.posterRight]} />
    </View>
    <View style={styles.photoCrowd}>
      {Array.from({ length: large ? 18 : 8 }).map((_, index) => (
        <View key={index} style={styles.person} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  examplePhoto: {
    aspectRatio: 1,
    backgroundColor: '#11151f',
    borderColor: '#f1f1f4',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    width: '33.3333%',
  },
  examplePhotoLarge: {
    borderWidth: 0,
    height: '100%',
    width: '72%',
  },
  photoSky: {
    backgroundColor: '#11141b',
    height: '28%',
  },
  stadiumRoof: {
    backgroundColor: '#d9d1c4',
    height: '22%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  roofLine: {
    backgroundColor: '#f8f2e8',
    height: 3,
    left: '8%',
    position: 'absolute',
    top: '26%',
    transform: [{ rotate: '-18deg' }],
    width: '82%',
  },
  roofLineSecond: {
    top: '48%',
    transform: [{ rotate: '16deg' }],
  },
  roofLineThird: {
    top: '70%',
    transform: [{ rotate: '-8deg' }],
  },
  photoBuilding: {
    backgroundColor: '#bcb1a4',
    flexDirection: 'row',
    height: '27%',
    justifyContent: 'center',
    paddingTop: '4%',
  },
  poster: {
    backgroundColor: '#1d212c',
    borderColor: '#eee7dd',
    borderWidth: 1,
    height: '74%',
    marginHorizontal: 4,
    width: '24%',
  },
  posterRight: {
    backgroundColor: '#313643',
  },
  photoCrowd: {
    alignItems: 'flex-end',
    backgroundColor: '#4b4038',
    flexDirection: 'row',
    gap: 3,
    height: '23%',
    justifyContent: 'center',
    paddingBottom: 5,
  },
  person: {
    backgroundColor: '#f0e7df',
    borderRadius: 6,
    height: '34%',
    width: 6,
  },
});

export default ExamplePhoto;
