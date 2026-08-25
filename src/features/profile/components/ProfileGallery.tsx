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
  itemSize: number;
  onArchiveItemPress: (post?: Post) => void;
  onBookmarkedPostPress?: (post: Post) => void;
  onRetryArchivePosts?: () => void;
  onRetryBookmarkedPosts?: () => void;
};

function getDateBadge(createdAt: string) {
  if (!createdAt) {
    return { day: '', month: '' };
  }

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
  itemSize,
  onArchiveItemPress,
  onBookmarkedPostPress,
  onRetryArchivePosts,
  onRetryBookmarkedPosts,
}: ProfileGalleryProps) => {
  const isBookmarkedPostsView = bookmarkedPosts !== undefined;
  const isArchivePostsView = isArchive && archivePosts !== undefined;

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
                  style={[styles.tile, styles.archiveTile, { height: itemSize, width: itemSize }]}
                  onPress={() => onArchiveItemPress(post)}
                >
                  <Image
                    source={{ uri: post.imageUrl }}
                    resizeMode="cover"
                    style={styles.fullImage}
                  />
                  <View style={styles.archiveDateBadge}>
                    <Text style={styles.archiveDateDay}>{dateBadge.day}</Text>
                    <Text style={styles.archiveDateMonth}>{dateBadge.month}</Text>
                  </View>
                </Pressable>
              );
            })}
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
                style={[styles.tile, { height: itemSize, width: itemSize }]}
                onPress={() => onBookmarkedPostPress?.(post)}
              >
                <Image
                  source={{ uri: post.imageUrl }}
                  resizeMode="cover"
                  style={styles.fullImage}
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
  archiveDateBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
    borderRadius: 4,
    left: 14,
    minWidth: 32,
    paddingHorizontal: 4,
    paddingVertical: 4,
    position: 'absolute',
    top: 10,
  },
  archiveDateDay: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  archiveDateMonth: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
  },
  archiveTile: {
    borderColor: '#fafafa',
    borderWidth: 1,
  },
  fullImage: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  tile: {
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
});

export default ProfileGallery;
