import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { galleryItems, profileImageSource } from '../constants/profileMock';

type ProfileGalleryProps = {
  isArchive: boolean;
  itemSize: number;
  onArchiveItemPress: () => void;
};

const ProfileGallery = ({ isArchive, itemSize, onArchiveItemPress }: ProfileGalleryProps) => (
  <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
    <View style={styles.gallery}>
      {galleryItems.map((item) => (
        <Pressable
          key={item}
          disabled={!isArchive}
          onPress={onArchiveItemPress}
        >
          <Image
            source={profileImageSource}
            resizeMode={isArchive ? 'contain' : 'cover'}
            style={{
              backgroundColor: '#fff',
              height: itemSize,
              width: itemSize,
            }}
          />
          {isArchive && (
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>21</Text>
              <Text style={styles.dateBadgeTextSmall}>10월</Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  dateBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    left: 18,
    paddingHorizontal: 6,
    paddingVertical: 4,
    position: 'absolute',
    top: 10,
  },
  dateBadgeText: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '600',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  dateBadgeTextSmall: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ProfileGallery;
