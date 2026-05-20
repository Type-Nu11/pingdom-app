import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LikeIcon from '../../../assets/icons/Like.svg';
import SavedIcon from '../../../assets/icons/Saved.svg';
import ShareIcon from '../../../assets/icons/share.svg';
import ReportIcon from '../../../assets/icons/tlsrh.svg';

const previewImageSource = require('../../../assets/Home/spki.webp');

type MarkerPreviewCardProps = {
  onClose: () => void;
  width: number;
};

type FeedReactionState = Record<string, {
  liked: boolean;
  saved: boolean;
  shared: boolean;
}>;

const feedItems = [
  {
    id: 'feed-1',
    caption: 'You ain’t ever gonna burn my heart out So Sally can wait she knows it’s too late as we’re walkin’ on by',
    likeCount: '1.2K',
    placeName: '고양종합운동장',
    username: 'woo._sm',
  },
  {
    id: 'feed-2',
    caption: '오늘의 핫플 기록. 사진은 예시 이미지로 먼저 채워둘게요.',
    likeCount: '948',
    placeName: '고양종합운동장',
    username: 'woo._sm',
  },
  {
    id: 'feed-3',
    caption: '다른 핑도 아래로 스크롤해서 이어서 볼 수 있게 연결했습니다.',
    likeCount: '837',
    placeName: '고양종합운동장',
    username: 'woo._sm',
  },
];

const defaultReaction = {
  liked: false,
  saved: false,
  shared: false,
};

const MarkerPreviewCard = ({ onClose, width }: MarkerPreviewCardProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<FeedReactionState>({});

  const toggleReaction = (feedId: string, key: keyof FeedReactionState[string]) => {
    setReactions((prev) => ({
      ...prev,
      [feedId]: {
        ...defaultReaction,
        ...prev[feedId],
        [key]: !prev[feedId]?.[key],
      },
    }));
  };

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        hitSlop={10}
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeText}>×</Text>
      </Pressable>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.feedList}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {feedItems.map((item) => {
          const reaction = reactions[item.id] ?? defaultReaction;
          const isMenuOpen = openMenuId === item.id;

          return (
            <View key={item.id} style={styles.feedItem}>
              <View style={styles.profileRow}>
                <View style={styles.profileIcon}>
                  <View style={styles.profileHead} />
                  <View style={styles.profileBody} />
                </View>
                <View style={styles.profileTextGroup}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.placeName}>{item.placeName}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="피드 메뉴 열기"
                  hitSlop={10}
                  style={styles.moreButton}
                  onPress={() => setOpenMenuId(isMenuOpen ? null : item.id)}
                >
                  <Text style={styles.moreText}>...</Text>
                </Pressable>

                {isMenuOpen && (
                  <View style={styles.menuCard}>
                    <Pressable style={styles.menuItem} onPress={() => setOpenMenuId(null)}>
                      <Text style={styles.menuIcon}>⊕</Text>
                      <Text style={styles.menuText}>관심 있음</Text>
                    </Pressable>
                    <Pressable style={styles.menuItem} onPress={() => setOpenMenuId(null)}>
                      <Text style={styles.menuIcon}>⊖</Text>
                      <Text style={styles.menuText}>관심 없음</Text>
                    </Pressable>
                    <Pressable style={styles.menuItem} onPress={() => setOpenMenuId(null)}>
                      <ReportIcon width={16} height={16} />
                      <Text style={styles.reportText}>핑 신고</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={styles.imageFrame}>
                <Image source={previewImageSource} resizeMode="contain" style={styles.feedImage} />
              </View>

              <View style={styles.indicatorRow}>
                <View style={styles.indicatorActive} />
                <View style={styles.indicator} />
              </View>

              <View style={styles.actionRow}>
                <View style={styles.leftActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="좋아요"
                    hitSlop={10}
                    style={styles.actionButton}
                    onPress={() => toggleReaction(item.id, 'liked')}
                  >
                    <LikeIcon
                      color={reaction.liked ? '#ff1956' : '#5e5e66'}
                      fill={reaction.liked ? '#ff1956' : 'none'}
                      width={20}
                      height={18}
                    />
                  </Pressable>
                  <Text style={[styles.likeCount, reaction.liked && styles.activeText]}>{item.likeCount}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="공유"
                    hitSlop={10}
                    style={styles.actionButton}
                    onPress={() => toggleReaction(item.id, 'shared')}
                  >
                    <ShareIcon
                      color={reaction.shared ? '#ff1956' : '#5e5e66'}
                      fill="none"
                      width={23}
                      height={20}
                    />
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="저장"
                  hitSlop={10}
                  style={styles.actionButton}
                  onPress={() => toggleReaction(item.id, 'saved')}
                >
                  <SavedIcon
                    color={reaction.saved ? '#ff1956' : '#5e5e66'}
                    fill={reaction.saved ? '#ff1956' : 'none'}
                    width={18}
                    height={21}
                  />
                </Pressable>
              </View>

              <Text style={styles.caption}>
                <Text style={styles.captionAuthor}>{item.username} </Text>
                {item.caption}
              </Text>
              <Text style={styles.timeText}>1시간 전 • 번역 보기</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    minHeight: 24,
    minWidth: 24,
    justifyContent: 'center',
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  activeText: {
    color: '#ff1956',
  },
  caption: {
    color: '#3b3b40',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingTop: 9,
  },
  captionAuthor: {
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 120,
    maxHeight: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 38 },
    shadowOpacity: 0.16,
    shadowRadius: 38,
  },
  closeButton: {
    position: 'absolute',
    right: 17,
    top: 13,
    zIndex: 12,
  },
  closeText: {
    color: '#5e5e66',
    fontSize: 39,
    fontWeight: '300',
    lineHeight: 39,
  },
  feedImage: {
    height: '100%',
    width: '100%',
  },
  feedItem: {
    backgroundColor: '#fff',
    overflow: 'visible',
    paddingBottom: 24,
  },
  feedList: {
    paddingTop: 42,
  },
  imageFrame: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#05070d',
    justifyContent: 'center',
    width: '100%',
  },
  indicator: {
    backgroundColor: '#bfc1c1',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  indicatorActive: {
    backgroundColor: '#ff1956',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  indicatorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    height: 26,
    justifyContent: 'center',
  },
  leftActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  likeCount: {
    color: '#5e5e66',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginRight: 7,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 16,
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 18,
    position: 'absolute',
    right: 16,
    top: 48,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  menuIcon: {
    color: '#0c0c0d',
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 24,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  menuText: {
    color: '#0c0c0d',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  moreButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  moreText: {
    color: '#3b3b40',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 20,
    marginBottom: 13,
  },
  placeName: {
    color: '#0c0c0d',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  profileBody: {
    backgroundColor: '#5e5e66',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    height: 12,
    marginTop: 1,
    width: 21,
  },
  profileHead: {
    backgroundColor: '#5e5e66',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  profileIcon: {
    alignItems: 'center',
    borderColor: '#5e5e66',
    borderRadius: 16,
    borderWidth: 3,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    height: 60,
    paddingHorizontal: 16,
  },
  profileTextGroup: {
    flex: 1,
  },
  reportText: {
    color: '#ee2b2b',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  timeText: {
    color: '#767680',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  username: {
    color: '#3b3b40',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default MarkerPreviewCard;
