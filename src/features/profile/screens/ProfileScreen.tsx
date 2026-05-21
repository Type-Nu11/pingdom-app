import { useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import ArchiveDetailView from '../components/ArchiveDetailView';
import LikesBottomSheet from '../components/LikesBottomSheet';
import ProfileEditView from '../components/ProfileEditView';
import ProfileGallery from '../components/ProfileGallery';
import ProfileHeader from '../components/ProfileHeader';

type ProfileScreenProps = {
  onBack: () => void;
};

type ProfileMode = 'profile' | 'archive' | 'archive-detail' | 'profile-edit';

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<ProfileMode>('profile');
  const [likesOpen, setLikesOpen] = useState(false);
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

    if (mode === 'archive' || mode === 'profile-edit') {
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

        {mode === 'profile-edit' ? (
          <ProfileEditView />
        ) : isArchiveDetail ? (
          <ArchiveDetailView onOpenLikes={() => setLikesOpen(true)} />
        ) : (
          <>
            <ProfileHeader
              isArchive={mode === 'archive'}
              onOpenArchive={() => setMode('archive')}
              onOpenEdit={() => setMode('profile-edit')}
              showTabs={mode === 'profile'}
            />
            <ProfileGallery
              isArchive={mode === 'archive'}
              itemSize={gridItemSize}
              onArchiveItemPress={() => setMode('archive-detail')}
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
