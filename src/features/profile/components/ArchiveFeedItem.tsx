import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LikeIcon from '../../../assets/icons/actions/Like.svg';
import {
  PROFILE_CAPTION,
  PROFILE_DATE,
  PROFILE_LIKE_COUNT,
  PROFILE_USERNAME,
  profileImageSource,
} from '../constants/profileMock';
import ProfileMini from './ProfileMini';

type ArchiveFeedItemProps = {
  isFirst?: boolean;
  onOpenLikes: () => void;
};

const ArchiveFeedItem = ({ isFirst = false, onOpenLikes }: ArchiveFeedItemProps) => (
  <View>
    <View style={[styles.header, !isFirst && styles.nextHeader]}>
      <ProfileMini />
      <Text style={styles.date}>{PROFILE_DATE}</Text>
    </View>

    <View style={styles.imageFrame}>
      <Image
        source={profileImageSource}
        resizeMode="cover"
        style={styles.image}
      />
    </View>

    <View style={styles.content}>
      <Pressable style={styles.likeRow} onPress={onOpenLikes}>
        <LikeIcon color="#5e5e66" fill="none" width={20} height={18} />
        <Text style={styles.likeText}>{PROFILE_LIKE_COUNT}</Text>
      </Pressable>

      <Text style={styles.caption}>
        <Text style={styles.captionAuthor}>{PROFILE_USERNAME} </Text>
        {PROFILE_CAPTION}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  caption: {
    color: '#3b3b40',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  captionAuthor: {
    fontWeight: '700',
  },
  content: {
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  date: {
    color: '#3b3b40',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: 24,
    paddingTop: 114,
  },
  image: {
    backgroundColor: '#05070d',
    height: '100%',
    width: '100%',
  },
  imageFrame: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#05070d',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  likeRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  likeText: {
    color: '#5e5e66',
    fontSize: 12,
    fontWeight: '500',
  },
  nextHeader: {
    paddingTop: 28,
  },
});

export default ArchiveFeedItem;
