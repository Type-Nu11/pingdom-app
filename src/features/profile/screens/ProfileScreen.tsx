import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import LikeIcon from '../../../assets/icons/Like.svg';
import SavedIcon from '../../../assets/icons/Saved.svg';

const profileImageSource = require('../../../assets/Home/spki.webp');

type ProfileScreenProps = {
  onBack: () => void;
};

type ProfileMode = 'profile' | 'archive' | 'archive-detail';

const galleryItems = Array.from({ length: 18 }, (_, index) => `profile-post-${index}`);
const likeUsers = Array.from({ length: 8 }, (_, index) => `like-user-${index}`);

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

    if (mode === 'archive') {
      setMode('profile');
      return;
    }

    onBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <View style={[styles.screen, { maxWidth: maxContentWidth }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          style={[styles.backButton, mode === 'archive-detail' && styles.detailBackButton]}
          onPress={handleBack}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        {mode === 'archive-detail' ? (
          <ArchiveDetail contentWidth={maxContentWidth} onOpenLikes={() => setLikesOpen(true)} />
        ) : (
          <>
            <View style={[styles.header, mode === 'archive' && styles.archiveHeader]}>
              <Image source={profileImageSource} resizeMode="cover" style={styles.avatar} />
              <Text style={styles.username}>woo._sm</Text>

              {mode === 'profile' && (
                <View style={styles.profileActions}>
                  <Pressable style={styles.profileActionButton}>
                    <Text style={styles.profileActionText}>프로필 편집</Text>
                  </Pressable>
                  <Pressable style={styles.profileActionButton} onPress={() => setMode('archive')}>
                    <Text style={styles.profileActionText}>보관함 보기</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {mode === 'profile' && (
              <View style={styles.tabBar}>
                <View style={styles.tabItem}>
                  <LikeIcon color="#ff1956" fill="#ff1956" width={40} height={36} />
                  <View style={styles.activeTabLine} />
                </View>
                <View style={styles.tabItem}>
                  <SavedIcon color="#c7c8cc" fill="none" width={34} height={40} />
                </View>
              </View>
            )}

            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              <View style={styles.gallery}>
                {galleryItems.map((item) => (
                  <Pressable
                    key={item}
                    disabled={mode !== 'archive'}
                    onPress={() => setMode('archive-detail')}
                  >
                    <Image
                      source={profileImageSource}
                      resizeMode={mode === 'archive' ? 'contain' : 'cover'}
                      style={{
                        backgroundColor: '#fff',
                        height: gridItemSize,
                        width: gridItemSize,
                      }}
                    />
                    {mode === 'archive' && (
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>21</Text>
                        <Text style={styles.dateBadgeTextSmall}>10월</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {likesOpen && <LikesSheet onClose={() => setLikesOpen(false)} />}
      </View>
    </SafeAreaView>
  );
};

const ProfileMini = () => (
  <View style={styles.detailProfile}>
    <View style={styles.smallProfileIcon}>
      <View style={styles.smallProfileHead} />
      <View style={styles.smallProfileBody} />
    </View>
    <View>
      <Text style={styles.detailUsername}>woo._sm</Text>
      <Text style={styles.detailPlace}>고양종합운동장</Text>
    </View>
  </View>
);

const ArchiveDetail = ({ contentWidth, onOpenLikes }: { contentWidth: number; onOpenLikes: () => void }) => {
  const imageSize = Math.min(contentWidth, 341);

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.detailScroll}>
      <View style={styles.detailHeader}>
        <ProfileMini />
        <Text style={styles.detailDate}>2025. 10. 21</Text>
      </View>

      <View style={styles.detailImageFrame}>
        <Image
          source={profileImageSource}
          resizeMode="contain"
          style={[styles.detailImage, { height: imageSize, width: imageSize }]}
        />
      </View>

      <View style={styles.detailContent}>
        <Pressable style={styles.detailLikeRow} onPress={onOpenLikes}>
          <LikeIcon color="#5e5e66" fill="none" width={20} height={18} />
          <Text style={styles.detailLikeText}>1.2K</Text>
        </Pressable>

        <Text style={styles.detailCaption}>
          <Text style={styles.detailCaptionAuthor}>woo._sm </Text>
          돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~돌아갈래~
        </Text>
      </View>

      <View style={styles.nextPostHeader}>
        <ProfileMini />
        <Text style={styles.detailDate}>2025. 10. 21</Text>
      </View>
      <View style={styles.detailImageFrame}>
        <Image
          source={profileImageSource}
          resizeMode="contain"
          style={[styles.detailImage, { height: imageSize, width: imageSize }]}
        />
      </View>
    </ScrollView>
  );
};

const LikesSheet = ({ onClose }: { onClose: () => void }) => (
  <View style={styles.likesOverlay}>
    <Pressable style={styles.likesBackdrop} onPress={onClose} />
    <View style={styles.likesSheet}>
      <View style={styles.likesHeader}>
        <View style={styles.likesHandle} />
        <Text style={styles.likesTitle}>좋아요</Text>
      </View>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.likesList}>
        {likeUsers.map((item) => (
          <View key={item} style={styles.likeUserRow}>
            <Image source={profileImageSource} resizeMode="cover" style={styles.likeUserAvatar} />
            <Text style={styles.likeUserName}>woo._sm</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  </View>
);

const styles = StyleSheet.create({
  activeTabLine: {
    backgroundColor: '#ff1956',
    borderRadius: 1,
    bottom: 0,
    height: 2,
    position: 'absolute',
    width: 100,
  },
  archiveHeader: {
    paddingBottom: 28,
    paddingTop: 96,
  },
  avatar: {
    borderRadius: 48,
    height: 96,
    width: 96,
  },
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
  dateBadge: {
    left: 18,
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
  detailCaption: {
    color: '#3b3b40',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  detailCaptionAuthor: {
    fontWeight: '700',
  },
  detailContent: {
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  detailDate: {
    color: '#3b3b40',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingHorizontal: 36,
    paddingTop: 134,
  },
  detailBackButton: {
    top: 82,
  },
  detailImage: {
    backgroundColor: '#05070d',
  },
  detailImageFrame: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    width: '100%',
  },
  detailLikeRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  detailLikeText: {
    color: '#5e5e66',
    fontSize: 12,
    fontWeight: '500',
  },
  detailPlace: {
    color: '#0c0c0d',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  detailProfile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  detailScroll: {
    flex: 1,
  },
  detailUsername: {
    color: '#3b3b40',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#d8d8dc',
    borderBottomWidth: 1,
    paddingBottom: 32,
    paddingTop: 118,
  },
  likesBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  likesOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  likesHandle: {
    backgroundColor: '#b8b8b8',
    borderRadius: 7,
    height: 4,
    width: 64,
  },
  likesHeader: {
    alignItems: 'center',
    gap: 16,
    height: 58,
    paddingTop: 8,
  },
  likesList: {
    flex: 1,
    width: '100%',
  },
  likesSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    height: 390,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  likesTitle: {
    color: '#000',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  likeUserAvatar: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  likeUserName: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 23,
  },
  likeUserRow: {
    alignItems: 'center',
    borderBottomColor: '#e5e5ea',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    height: 70,
    paddingHorizontal: 16,
  },
  nextPostHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  profileActionButton: {
    alignItems: 'center',
    backgroundColor: '#f6f6f7',
    borderColor: '#e5e5e7',
    borderRadius: 16,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  profileActionText: {
    color: '#3b3b40',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 36,
    marginTop: 24,
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
  smallProfileBody: {
    backgroundColor: '#5e5e66',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 10,
    marginTop: 1,
    width: 18,
  },
  smallProfileHead: {
    backgroundColor: '#5e5e66',
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  smallProfileIcon: {
    alignItems: 'center',
    borderColor: '#5e5e66',
    borderRadius: 15,
    borderWidth: 3,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 30,
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderBottomColor: '#d8d8dc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 72,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  username: {
    color: '#3b3b40',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 20,
  },
});

export default ProfileScreen;
