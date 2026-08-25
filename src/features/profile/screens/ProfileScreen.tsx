import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Pressable, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerAndroidBackOverride } from '../../../shared/navigation/androidBackOverride';
import ArchiveDetailView from '../components/ArchiveDetailView';
import ProfileGallery from '../components/ProfileGallery';
import ProfileHeader from '../components/ProfileHeader';
import { useMyPosts } from '../../record/hooks/useMyPosts';
import { useBookmarkedPosts } from '../../record/hooks/usePostBookmark';
import { useProfile } from '../hooks/useProfile';
import { getProfileBackAction, type ProfileMode } from '../utils/profileBack';

type ProfileScreenProps = {
  onBack: () => void;
  onOpenBookmarkedPost: (placeId: number) => void;
  onOpenApiCheck: () => void;
  onOpenSettings: () => void;
};

const ProfileScreen = ({
  onBack,
  onOpenBookmarkedPost,
  onOpenApiCheck,
  onOpenSettings,
}: ProfileScreenProps) => {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<ProfileMode>('profile');
  const [selectedArchivePostId, setSelectedArchivePostId] = useState<number | null>(null);
  const isSavedPostsVisible = mode === 'profile';
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
  } = useBookmarkedPosts({ enabled: isSavedPostsVisible });
  const {
    isError: isArchivePostsError,
    isLoading: isArchivePostsLoading,
    posts: archivePosts,
    refetch: refetchArchivePosts,
  } = useMyPosts(profile?.id ?? null, { enabled: isArchiveVisible });
  const maxContentWidth = Math.min(width, 560);
  const gridItemSize = Math.floor(maxContentWidth / 3);
  const handleBack = useCallback(() => {
    const action = getProfileBackAction(mode);

    if (action === 'show-archive') setMode('archive');
    else if (action === 'show-profile') setMode('profile');
    else onBack();
  }, [mode, onBack]);

  useFocusEffect(useCallback(() => {
    return registerAndroidBackOverride(() => {
      if (getProfileBackAction(mode) === 'navigate-back') {
        return false;
      }

      handleBack();
      return true;
    });
  }, [handleBack, mode]));

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
          />
        ) : (
          <>
            <ProfileHeader
              isArchive={mode === 'archive'}
              isLoading={isProfileLoading}
              onOpenApiCheck={onOpenApiCheck}
              onOpenArchive={() => setMode('archive')}
              onOpenSettings={onOpenSettings}
              profile={profile}
              showTabs={mode === 'profile'}
            />
            <ProfileGallery
              archivePosts={mode === 'archive' ? archivePosts : undefined}
              bookmarkedPosts={isSavedPostsVisible ? bookmarkedPosts : undefined}
              isArchive={mode === 'archive'}
              isArchivePostsError={mode === 'archive' && isArchivePostsError}
              isArchivePostsLoading={mode === 'archive' && (isProfileLoading || isArchivePostsLoading)}
              isBookmarkedPostsError={isSavedPostsVisible && isBookmarkedPostsError}
              isBookmarkedPostsLoading={isSavedPostsVisible && isBookmarkedPostsLoading}
              itemSize={gridItemSize}
              onArchiveItemPress={(post) => {
                setSelectedArchivePostId(post?.id ?? null);
                setMode('archive-detail');
              }}
              onBookmarkedPostPress={(post) => onOpenBookmarkedPost(post.placeId)}
              onRetryArchivePosts={() => void refetchArchivePosts()}
              onRetryBookmarkedPosts={() => void refetchBookmarkedPosts()}
            />
          </>
        )}
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
