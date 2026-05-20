import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ExamplePhoto from './ExamplePhoto';

const PhotoSelectStep = () => (
  <ScrollView style={styles.photoScroll} contentContainerStyle={styles.photoContent}>
    <Text style={styles.title}>새로 게시할 장소의{'\n'}사진을 선택해 주세요.</Text>
    <View style={styles.photoGrid}>
      {Array.from({ length: 15 }).map((_, index) => (
        <ExamplePhoto key={index} />
      ))}
    </View>
  </ScrollView>
);

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
    paddingBottom: 28,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 28,
  },
});

export default PhotoSelectStep;
