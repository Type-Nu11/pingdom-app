import { useEffect, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LikeIcon from '../../../../assets/icons/actions/Like.svg';
import SavedIcon from '../../../../assets/icons/actions/Saved.svg';
import ShareIcon from '../../../../assets/icons/actions/share.svg';
import ReportIcon from '../../../../assets/icons/actions/tlsrh.svg';
import type { MarkerPreview } from '../../model/place.types';

const previewImageSource = require('../../../../assets/images/spki.webp');
const secondPreviewImageSource = require('../../../../assets/images/spki2.webp');
const previewImages = [previewImageSource, secondPreviewImageSource];

type MarkerPreviewCardProps = {
  cardWidth: number;
  items: MarkerPreview[];
  onClose: () => void;
  onSelectMarker: (markerId: string) => void;
  selectedMarkerId: string;
  viewportWidth: number;
};

type FeedReactionState = Record<string, {
  liked: boolean;
  saved: boolean;
  shared: boolean;
}>;

const defaultReaction = {
  liked: false,
  saved: false,
  shared: false,
};

const MarkerPreviewCard = ({
  cardWidth,
  items,
  onClose,
  onSelectMarker,
  selectedMarkerId,
  viewportWidth,
}: MarkerPreviewCardProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});
  const [reactions, setReactions] = useState<FeedReactionState>({});
  const scrollRef = useRef<ScrollView>(null);
  const hasAlignedInitialCard = useRef(false);
  const pageGap = 16;
  const sidePeekInset = Math.max(0, Math.round((viewportWidth - cardWidth) / 2) - 6);
  const contentRightInset = Math.max(0, sidePeekInset - pageGap + 6);
  const snapInterval = cardWidth + pageGap;

  useEffect(() => {
    const selectedIndex = items.findIndex((item) => item.id === selectedMarkerId);

    if (selectedIndex < 0) {
      return;
    }

    scrollRef.current?.scrollTo({
      x: selectedIndex * snapInterval,
      animated: hasAlignedInitialCard.current,
    });
    hasAlignedInitialCard.current = true;
  }, [items, selectedMarkerId, snapInterval]);

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

  const handleImageScrollEnd = (
    feedId: string,
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);

    setActiveImageIndexes((prev) => ({
      ...prev,
      [feedId]: pageIndex,
    }));
  };

  const handleMarkerSwipeEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    const nextMarker = items[nextIndex];

    if (nextMarker && nextMarker.id !== selectedMarkerId) {
      onSelectMarker(nextMarker.id);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        bounces={false}
        contentContainerStyle={[
          styles.pagerContent,
          { paddingHorizontal: sidePeekInset, paddingRight: contentRightInset },
        ]}
        decelerationRate="fast"
        directionalLockEnabled
        horizontal
        onMomentumScrollEnd={handleMarkerSwipeEnd}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={snapInterval}
        style={styles.pager}
      >
        {items.map((marker) => (
          <View key={marker.id} style={[styles.page, { marginRight: pageGap, width: cardWidth }]}>
            <View style={[styles.card, { width: cardWidth }]}>
              <View style={styles.cardHeader}>
                <View style={styles.headerTextGroup}>
                  <Text style={styles.cardTitle}>{marker.title}</Text>
                  <Text style={styles.cardMeta}>
                    최초 등록자 : <Text style={styles.cardMetaAccent}>{marker.firstRegistrant}</Text>
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="닫기"
                  hitSlop={10}
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>

              <ScrollView
                bounces={false}
                contentContainerStyle={styles.feedList}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                style={styles.feedScroller}
              >
                {marker.feeds.map((item, feedIndex) => {
                  const activeImageIndex = activeImageIndexes[item.id] ?? 0;
                  const reaction = reactions[item.id] ?? defaultReaction;
                  const isMenuOpen = openMenuId === item.id;

                  return (
                    <View
                      key={item.id}
                      style={[styles.feedItem, feedIndex > 0 && styles.feedItemDivider]}
                    >
                      <View style={styles.profileRow}>
                        <View style={styles.profileIcon}>
                          <View style={styles.profileHead} />
                          <View style={styles.profileBody} />
                        </View>
                        <View style={styles.profileTextGroup}>
                          <Text style={styles.username}>{item.username}</Text>
                          <Text style={styles.placeName}>{marker.title}</Text>
                        </View>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="피드 메뉴 열기"
                          hitSlop={10}
                          style={styles.moreButton}
                          onPress={() => setOpenMenuId(isMenuOpen ? null : item.id)}
                        >
                          <Text style={styles.moreText}>•••</Text>
                        </Pressable>

                        {isMenuOpen && (
                          <View style={styles.menuCard}>
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
                        <ScrollView
                          bounces={false}
                          directionalLockEnabled
                          horizontal
                          nestedScrollEnabled
                          onMomentumScrollEnd={(event) => handleImageScrollEnd(item.id, event)}
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                        >
                          {previewImages.map((imageSource, index) => (
                            <Image
                              key={`${item.id}-preview-${index}`}
                              source={imageSource}
                              resizeMode="cover"
                              style={[styles.feedImage, { width: cardWidth }]}
                            />
                          ))}
                        </ScrollView>
                      </View>

                      <View style={styles.indicatorRow}>
                        {previewImages.map((_, index) => (
                          <View
                            key={`${item.id}-indicator-${index}`}
                            style={activeImageIndex === index ? styles.indicatorActive : styles.indicator}
                          />
                        ))}
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
                          <Text style={[styles.likeCount, reaction.liked && styles.activeText]}>
                            {item.likeCount}
                          </Text>
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
                      <Text style={styles.timeText}>{item.postedAt} • 번역 보기</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
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
    borderRadius: 28,
    elevation: 32,
    height: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
  },
  cardHeader: {
    alignItems: 'center',
    borderBottomColor: '#ece6ea',
    borderBottomWidth: 1,
    minHeight: 92,
    justifyContent: 'center',
    paddingBottom: 12,
    paddingHorizontal: 64,
    paddingTop: 18,
    position: 'relative',
  },
  cardMeta: {
    color: '#4f4d55',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    textAlign: 'center',
  },
  cardMetaAccent: {
    color: '#ff1956',
    fontWeight: '700',
  },
  cardTitle: {
    color: '#17161b',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
    marginBottom: 4,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    zIndex: 12,
  },
  closeText: {
    color: '#5e5e66',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 34,
  },
  feedImage: {
    height: '100%',
  },
  feedItem: {
    backgroundColor: '#fff',
    overflow: 'visible',
    paddingBottom: 22,
  },
  feedItemDivider: {
    borderTopColor: '#efedf0',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  feedList: {
    paddingBottom: 32,
  },
  feedScroller: {
    flex: 1,
  },
  headerTextGroup: {
    gap: 2,
  },
  imageFrame: {
    alignItems: 'center',
    aspectRatio: 0.98,
    backgroundColor: '#05070d',
    justifyContent: 'center',
    overflow: 'hidden',
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
    height: 30,
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
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.8,
    lineHeight: 18,
    marginTop: -4,
  },
  page: {
    height: '100%',
    paddingBottom: 12,
  },
  pager: {
    flex: 1,
  },
  pagerContent: {
    alignItems: 'stretch',
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
    paddingTop: 8,
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
