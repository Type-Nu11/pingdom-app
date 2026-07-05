import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Post } from '../../record/model/record.types';

type ProfileGalleryProps = {
  archivePosts?: Post[];
  bookmarkedPosts?: Post[];
  isArchive: boolean;
  isArchivePostsError?: boolean;
  isArchivePostsLoading?: boolean;
  isBookmarkedPostsError?: boolean;
  isBookmarkedPostsLoading?: boolean;
  isLikedPostsError?: boolean;
  isLikedPostsLoading?: boolean;
  itemSize: number;
  likedPosts?: Post[];
  onArchiveItemPress: (post?: Post) => void;
  onBookmarkedPostPress?: (post: Post) => void;
  onLikedPostPress?: (post: Post) => void;
  onRetryArchivePosts?: () => void;
  onRetryBookmarkedPosts?: () => void;
  onRetryLikedPosts?: () => void;
};

function getDateBadge(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return { day: '', month: '' };
  }

  return {
    day: String(date.getDate()),
    month: `${date.getMonth() + 1}월`,
  };
}

const ProfileGallery = ({
  archivePosts,
  bookmarkedPosts,
  isArchive,
  isArchivePostsError = false,
  isArchivePostsLoading = false,
  isBookmarkedPostsError = false,
  isBookmarkedPostsLoading = false,
  isLikedPostsError = false,
  isLikedPostsLoading = false,
  itemSize,
  likedPosts,
  onArchiveItemPress,
  onBookmarkedPostPress,
  onLikedPostPress,
  onRetryArchivePosts,
  onRetryBookmarkedPosts,
  onRetryLikedPosts,
}: ProfileGalleryProps) => {
  const isBookmarkedPostsView = bookmarkedPosts !== undefined;
  const isArchivePostsView = isArchive && archivePosts !== undefined;
  const isLikedPostsView = likedPosts !== undefined;

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
      {isArchivePostsView ? (
        isArchivePostsLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#ff1956" />
            <Text style={styles.stateText}>보관함 게시글을 불러오고 있어요</Text>
          </View>
        ) : isArchivePostsError ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>보관함 게시글을 불러오지 못했어요</Text>
            {onRetryArchivePosts ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="보관함 게시글 다시 불러오기"
                style={styles.retryButton}
                onPress={onRetryArchivePosts}
              >
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            ) : null}
          </View>
        ) : archivePosts.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>보관함에 게시글이 없어요</Text>
          </View>
        ) : (
          <View style={styles.gallery}>
            {archivePosts.map((post) => {
              const dateBadge = getDateBadge(post.createdAt);

              return (
                <Pressable
                  key={post.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${post.title} 게시글 보기`}
                  onPress={() => onArchiveItemPress(post)}
                >
                  <Image
                    source={{ uri: post.imageUrl }}
                    resizeMode="cover"
                    style={[styles.image, { height: itemSize, width: itemSize }]}
                  />
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{dateBadge.day}</Text>
                    <Text style={styles.dateBadgeTextSmall}>{dateBadge.month}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )
      ) : isLikedPostsView ? (
        isLikedPostsLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#ff1956" />
            <Text style={styles.stateText}>좋아요한 게시글을 불러오고 있어요</Text>
          </View>
        ) : isLikedPostsError ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>좋아요한 게시글을 불러오지 못했어요</Text>
            {onRetryLikedPosts ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="좋아요한 게시글 다시 불러오기"
                style={styles.retryButton}
                onPress={onRetryLikedPosts}
              >
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            ) : null}
          </View>
        ) : likedPosts.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>좋아요한 게시글이 없어요</Text>
          </View>
        ) : (
          <View style={styles.gallery}>
            {likedPosts.map((post) => (
              <Pressable
                key={post.id}
                accessibilityRole="button"
                accessibilityLabel={`${post.title} 게시글 보기`}
                disabled={!onLikedPostPress}
                onPress={() => onLikedPostPress?.(post)}
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
      ) : isBookmarkedPostsView ? (
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
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>표시할 게시글이 없어요</Text>
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
