import { useRef, useState } from 'react';
import { Animated, Image, PanResponder, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import LikeIcon from '../../../assets/icons/actions/Like.svg';
import SavedIcon from '../../../assets/icons/actions/Saved.svg';
import ImageIcon from '../../../assets/icons/edit/image.svg';
import PencilIcon from '../../../assets/icons/edit/peril.svg';

const profileImageSource = require('../../../assets/images/spki.webp');

type ProfileScreenProps = {
  onBack: () => void;
};

type ProfileMode = 'profile' | 'archive' | 'archive-detail' | 'profile-edit';

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

    if (mode === 'profile-edit') {
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

        {mode === 'profile-edit' ? (
          <ProfileEditScreen />
        ) : mode === 'archive-detail' ? (
          <ArchiveDetail onOpenLikes={() => setLikesOpen(true)} />
        ) : (
          <>
            <View style={[styles.header, mode === 'archive' && styles.archiveHeader]}>
              <Image source={profileImageSource} resizeMode="cover" style={styles.avatar} />
              <Text style={styles.username}>woo._sm</Text>

              {mode === 'profile' && (
                <View style={styles.profileActions}>
                  <Pressable style={styles.profileActionButton} onPress={() => setMode('profile-edit')}>
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

const ProfileEditScreen = () => (
  <View style={styles.editScreen}>
    <View style={styles.editAvatarWrap}>
      <Image source={profileImageSource} resizeMode="cover" style={styles.editAvatar} />
      <View style={styles.editCameraBadge}>
        <ImageIcon width={18} height={18} />
      </View>
    </View>

    <View style={styles.editForm}>
      <Text style={styles.editLabel}>이름</Text>
      <View style={styles.editInputWrap}>
        <TextInput
          placeholder="이름 입력하세요."
          placeholderTextColor="#767680"
          style={styles.editInput}
        />
        <PencilIcon width={22} height={22} />
      </View>
    </View>
  </View>
);

const ArchiveDetail = ({ onOpenLikes }: { onOpenLikes: () => void }) => {
  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.detailScroll}>
      <ArchiveFeedItem isFirst onOpenLikes={onOpenLikes} />
      <ArchiveFeedItem onOpenLikes={onOpenLikes} />
    </ScrollView>
  );
};

const ArchiveFeedItem = ({
  isFirst = false,
  onOpenLikes,
}: {
  isFirst?: boolean;
  onOpenLikes: () => void;
}) => (
  <View>
    <View style={[styles.detailHeader, !isFirst && styles.nextPostHeader]}>
      <ProfileMini />
      <Text style={styles.detailDate}>2025. 10. 21</Text>
    </View>

    <View style={styles.detailImageFrame}>
      <Image
        source={profileImageSource}
        resizeMode="cover"
        style={styles.detailImage}
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
  </View>
);

const LikesSheet = ({ onClose }: { onClose: () => void }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.8) {
          Animated.timing(translateY, {
            duration: 180,
            toValue: 390,
            useNativeDriver: true,
          }).start(onClose);
          return;
        }

        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.likesOverlay}>
      <Pressable style={styles.likesBackdrop} onPress={onClose} />
      <Animated.View
        style={[styles.likesSheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
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
      </Animated.View>
    </View>
  );
};

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
    paddingHorizontal: 24,
    paddingTop: 114,
  },
  detailBackButton: {
    left: 24,
    top: 54,
  },
  detailImage: {
    backgroundColor: '#05070d',
    height: '100%',
    width: '100%',
  },
  detailImageFrame: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#05070d',
    justifyContent: 'center',
    overflow: 'hidden',
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
  editAvatar: {
    borderRadius: 54,
    height: 108,
    width: 108,
  },
  editAvatarWrap: {
    alignSelf: 'center',
    marginTop: 132,
    position: 'relative',
  },
  editCameraBadge: {
    alignItems: 'center',
    backgroundColor: '#d9d9de',
    borderColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 3,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 28,
  },
  editForm: {
    gap: 14,
    marginTop: 72,
    paddingHorizontal: 24,
  },
  editInput: {
    color: '#3b3b40',
    flex: 1,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 29,
    padding: 0,
  },
  editInputWrap: {
    alignItems: 'center',
    borderColor: '#767680',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 14,
  },
  editLabel: {
    color: '#3b3b40',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  editScreen: {
    flex: 1,
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
    paddingTop: 28,
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
