import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ExamplePhoto from './ExamplePhoto';

const PhotoSelectStep = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  return (
    <ScrollView style={styles.photoScroll} contentContainerStyle={styles.photoContent}>
      <Text style={styles.title}>새로 게시할 장소의{'\n'}사진을 선택해 주세요.</Text>
      <View style={styles.photoGrid}>
        {Array.from({ length: 15 }).map((_, index) => {
          const isSelected = selectedPhotoIndex === index;

          return (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`사진 ${index + 1} 선택`}
              style={styles.photoButton}
              onPress={() => setSelectedPhotoIndex(index)}
            >
              <ExamplePhoto />
              {isSelected && (
                <View pointerEvents="none" style={styles.selectedOverlay}>
                  <View style={styles.checkBadge}>
                    <View style={styles.checkMark} />
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
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
    paddingBottom: 28,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 28,
  },
  photoButton: {
    aspectRatio: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '33.3333%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 25, 86, 0.22)',
    borderColor: '#ff1956',
    borderWidth: 4,
    padding: 8,
  },
  checkBadge: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderColor: '#fff',
    borderRadius: 15,
    borderWidth: 2,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  checkMark: {
    borderBottomColor: '#fff',
    borderBottomWidth: 3,
    borderRightColor: '#fff',
    borderRightWidth: 3,
    height: 13,
    marginTop: -3,
    transform: [{ rotate: '45deg' }],
    width: 7,
  },
});

export default PhotoSelectStep;
