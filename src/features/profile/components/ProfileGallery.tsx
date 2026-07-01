import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Post } from '../../record/model/record.types';
import { galleryItems } from '../constants/profileMock';

type ProfileGalleryProps = {
  bookmarkedPosts?: Post[];
  imageSource: ImageSourcePropType;
  isArchive: boolean;
  isBookmarkedPostsError?: boolean;
  isBookmarkedPostsLoading?: boolean;
  itemSize: number;
  onArchiveItemPress: () => void;
  onBookmarkedPostPress?: (post: Post) => void;
  onRetryBookmarkedPosts?: () => void;
};

const ProfileGallery = ({
  bookmarkedPosts,
  imageSource,
  isArchive,
  isBookmarkedPostsError = false,
  isBookmarkedPostsLoading = false,
  itemSize,
  onArchiveItemPress,
  onBookmarkedPostPress,
  onRetryBookmarkedPosts,
}: ProfileGalleryProps) => {
  const isBookmarkedPostsView = bookmarkedPosts !== undefined;

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
      {isBookmarkedPostsView ? (
        isBookmarkedPostsLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#ff1956" />
            <Text style={styles.stateText}>저장한 게시글을 불러오고 있어요</Text>
          </View>
        ) : isBookmarkedPostsError ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>저장한 게시글을 불러오지 못했어요</Text>
            {onRetryBookmarkedPosts ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="저장한 게시글 다시 불러오기"
                style={styles.retryButton}
                onPress={onRetryBookmarkedPosts}
              >
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            ) : null}
          </View>
        ) : bookmarkedPosts.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>저장한 게시글이 없어요</Text>
          </View>
        ) : (
          <View style={styles.gallery}>
            {bookmarkedPosts.map((post) => (
              <Pressable
                key={post.id}
                accessibilityRole="button"
                accessibilityLabel={`${post.title} 게시글 보기`}
                disabled={!onBookmarkedPostPress}
                onPress={() => onBookmarkedPostPress?.(post)}
              >
                <Image
                  source={{ uri: post.imageUrl }}
                  resizeMode="cover"
                  style={[styles.image, { height: itemSize, width: itemSize }]}
                />
              </Pressable>
            ))}
          </View>
        )
      ) : (
        <View style={styles.gallery}>
          {galleryItems.map((item) => (
            <Pressable
              key={item}
              disabled={!isArchive}
              onPress={onArchiveItemPress}
            >
              <Image
                source={imageSource}
                resizeMode={isArchive ? 'contain' : 'cover'}
                style={[styles.image, { height: itemSize, width: itemSize }]}
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
      )}
    </ScrollView>
  );
};

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
  image: {
    backgroundColor: '#fff',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  stateContainer: {
    alignItems: 'center',
    minHeight: 240,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ProfileGallery;
