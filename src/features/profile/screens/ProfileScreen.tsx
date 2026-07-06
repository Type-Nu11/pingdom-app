import { useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArchiveDetailView from '../components/ArchiveDetailView';
import LikesBottomSheet from '../components/LikesBottomSheet';
import ProfileGallery from '../components/ProfileGallery';
import ProfileHeader from '../components/ProfileHeader';
import { useLikedPosts } from '../../record/hooks/useLikedPosts';
import { useMyPosts } from '../../record/hooks/useMyPosts';
import { useBookmarkedPosts } from '../../record/hooks/usePostBookmark';
import { useProfile } from '../hooks/useProfile';

type ProfileScreenProps = {
  initialTab?: ProfileTab;
  onBack: () => void;
  onOpenBookmarkedPost: (placeId: number) => void;
  onOpenSettings: () => void;
};

type ProfileMode = 'profile' | 'archive' | 'archive-detail';
type ProfileTab = 'liked' | 'saved';

const ProfileScreen = ({
  initialTab = 'liked',
  onBack,
  onOpenBookmarkedPost,
  onOpenSettings,
}: ProfileScreenProps) => {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<ProfileMode>('profile');
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const [likesOpen, setLikesOpen] = useState(false);
  const [selectedArchivePostId, setSelectedArchivePostId] = useState<number | null>(null);
  const isLikedPostsTab = mode === 'profile' && activeTab === 'liked';
  const isSavedPostsTab = mode === 'profile' && activeTab === 'saved';
  const isArchiveVisible = mode === 'archive' || mode === 'archive-detail';
  const {
    isLoading: isProfileLoading,
    profile,
  } = useProfile();
  const {
    isError: isBookmarkedPostsError,
    isLoading: isBookmarkedPostsLoading,
    posts: bookmarkedPosts,
    refetch: refetchBookmarkedPosts,
  } = useBookmarkedPosts({ enabled: isSavedPostsTab });
  const {
    isError: isLikedPostsError,
    isLoading: isLikedPostsLoading,
    posts: likedPosts,
    refetch: refetchLikedPosts,
  } = useLikedPosts({ enabled: isLikedPostsTab });
  const {
    isError: isArchivePostsError,
    isLoading: isArchivePostsLoading,
    posts: archivePosts,
    refetch: refetchArchivePosts,
  } = useMyPosts(profile?.id ?? null, { enabled: isArchiveVisible });
  const maxContentWidth = Math.min(width, 560);
  const gridItemSize = Math.floor(maxContentWidth / 3);

  const handleBack = () => {
    if (likesOpen) {
      setLikesOpen(false);
      return;
    }

    if (mode === 'archive-detail') {
      setMode('archive');
      return;
    }

    if (mode === 'archive') {
      setMode('profile');
      return;
    }

    onBack();
  };

  const isArchiveDetail = mode === 'archive-detail';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <View style={[styles.screen, { maxWidth: maxContentWidth }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          style={[styles.backButton, isArchiveDetail && styles.detailBackButton]}
          onPress={handleBack}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        {isArchiveDetail ? (
          <ArchiveDetailView
            initialPostId={selectedArchivePostId}
            posts={archivePosts}
            onOpenLikes={() => setLikesOpen(true)}
          />
        ) : (
          <>
            <ProfileHeader
              isArchive={mode === 'archive'}
              isLoading={isProfileLoading}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onOpenArchive={() => setMode('archive')}
              onOpenSettings={onOpenSettings}
              profile={profile}
              showTabs={mode === 'profile'}
            />
            <ProfileGallery
              archivePosts={mode === 'archive' ? archivePosts : undefined}
              bookmarkedPosts={isSavedPostsTab ? bookmarkedPosts : undefined}
              isArchive={mode === 'archive'}
              isArchivePostsError={mode === 'archive' && isArchivePostsError}
              isArchivePostsLoading={mode === 'archive' && (isProfileLoading || isArchivePostsLoading)}
              isBookmarkedPostsError={isSavedPostsTab && isBookmarkedPostsError}
              isBookmarkedPostsLoading={isSavedPostsTab && isBookmarkedPostsLoading}
              isLikedPostsError={isLikedPostsTab && isLikedPostsError}
              isLikedPostsLoading={isLikedPostsTab && isLikedPostsLoading}
              itemSize={gridItemSize}
              likedPosts={isLikedPostsTab ? likedPosts : undefined}
              onArchiveItemPress={(post) => {
                setSelectedArchivePostId(post?.id ?? null);
                setMode('archive-detail');
              }}
              onBookmarkedPostPress={(post) => onOpenBookmarkedPost(post.placeId)}
              onLikedPostPress={(post) => onOpenBookmarkedPost(post.placeId)}
              onRetryArchivePosts={() => void refetchArchivePosts()}
              onRetryBookmarkedPosts={() => void refetchBookmarkedPosts()}
              onRetryLikedPosts={() => void refetchLikedPosts()}
            />
          </>
        )}

        {likesOpen && <LikesBottomSheet onClose={() => setLikesOpen(false)} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    left: 24,
    position: 'absolute',
    top: 54,
    zIndex: 8,
  },
  backText: {
    color: '#0c0c0d',
    fontSize: 50,
    fontWeight: '300',
    lineHeight: 50,
  },
  detailBackButton: {
    left: 24,
    top: 54,
  },
  safeArea: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    flex: 1,
  },
  screen: {
    backgroundColor: '#fafafa',
    flex: 1,
    width: '100%',
  },
});

export default ProfileScreen;
