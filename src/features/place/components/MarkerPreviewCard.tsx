import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LikeIcon from '../../../assets/icons/actions/Like.svg';
import SavedIcon from '../../../assets/icons/actions/Saved.svg';
import ShareIcon from '../../../assets/icons/actions/share.svg';
import ReportIcon from '../../../assets/icons/actions/tlsrh.svg';
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage';
import type { Post } from '../../record/model/record.types';

type MarkerPreviewCardProps = {
  bookmarkedPlaceIds: Record<string, boolean>;
  hiddenPostIds: Record<string, boolean>;
  isError?: boolean;
  isLoading?: boolean;
  notificationLikeContext?: {
    notificationsId?: string;
    postId?: string;
  } | null;
  onClose: () => void;
  onReport: (postId: number, reason: string, hideAfterReport: boolean) => Promise<void>;
  onRetry?: () => void;
  onToggleBookmark: (placeId: number, nextBookmarked: boolean) => Promise<void>;
  onToggleLike?: (postId: number, nextLiked: boolean, notificationsId?: number) => Promise<void>;
  placeName?: string;
  posts: Post[];
  reportedPostIds: Record<string, boolean>;
  reportPendingPostIds: Record<string, boolean>;
  width: number;
};

type FeedReactionState = Record<string, {
  shared: boolean;
}>;

const REPORT_REASONS = [
  '영리목적/홍보성',
  '저작권침해',
  '음란성/선정성',
  '욕설/인신공격',
  '개인정보노출',
  '같은내용 반복게시',
  '기타',
] as const;

type ReportReason = typeof REPORT_REASONS[number];

type LocalLikeOverride = {
  baseLiked: boolean;
  baseLikeCount: number;
  liked: boolean;
};

const defaultReaction = {
  shared: false,
};

function formatLikeCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  }

  return String(count);
}

function getServerLiked(post: Post) {
  return Boolean(post.liked ?? post.isLiked ?? post.likedByMe);
}

function getPostNotificationsId(post: Post) {
  return post.notificationsId ?? post.notificationId;
}

function toNumberId(value: number | string | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getDisplayLiked(post: Post, override?: LocalLikeOverride) {
  return override?.liked ?? getServerLiked(post);
}

function getDisplayLikeCount(post: Post, override?: LocalLikeOverride) {
  if (!override) {
    return post.likeCount;
  }

  if (post.likeCount !== override.baseLikeCount) {
    return Math.max(0, post.likeCount);
  }

  const delta = override.liked === override.baseLiked
    ? 0
    : override.liked
      ? 1
      : -1;

  return Math.max(0, post.likeCount + delta);
}

function getDisplayBookmarked(
  post: Post,
  bookmarkedPlaceIds: Record<string, boolean>,
  override?: boolean,
) {
  if (override !== undefined) {
    return override;
  }

  return bookmarkedPlaceIds[String(post.placeId)] ?? Boolean(post.bookmarked);
}

function formatPostTime(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) {
    return '방금 전';
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}

function getReportErrorMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    const responseData = error.response.data as { code?: unknown } | undefined;

    if (responseData?.code === 'INVALID_TOKEN') {
      return '서버에서 신고 요청을 인증하지 못했어요. 잠시 후 다시 시도해 주세요.';
    }
  }

  return getApiErrorMessage(error, '잠시 후 다시 시도해 주세요.');
}

function isAlreadyLikedError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const responseData = error.response?.data as { code?: unknown; message?: unknown } | undefined;
  const code = String(responseData?.code ?? '').toUpperCase();
  const message = String(responseData?.message ?? '');
  const lowerMessage = message.toLowerCase();

  return (
    (code.includes('ALREADY') && code.includes('LIKE')) ||
    message.includes('이미 좋아요') ||
    (lowerMessage.includes('already') && lowerMessage.includes('like'))
  );
}

const MarkerPreviewCard = ({
  bookmarkedPlaceIds,
  hiddenPostIds,
  isError = false,
  isLoading = false,
  notificationLikeContext,
  onClose,
  onReport,
  onRetry,
  onToggleBookmark,
  onToggleLike,
  placeName,
  posts,
  reportedPostIds,
  reportPendingPostIds,
  width,
}: MarkerPreviewCardProps) => {
  const [bookmarkOverrides, setBookmarkOverrides] = useState<Record<string, boolean>>({});
  const [bookmarkPendingByPlaceId, setBookmarkPendingByPlaceId] = useState<Record<string, boolean>>({});
  const isMountedRef = useRef(true);
  const [likePendingById, setLikePendingById] = useState<Record<string, boolean>>({});
  const [likeOverrides, setLikeOverrides] = useState<Record<string, LocalLikeOverride>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hideReportedPost, setHideReportedPost] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<ReportReason | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportTarget, setReportTarget] = useState<Post | null>(null);
  const [reactions, setReactions] = useState<FeedReactionState>({});
  const placeDisplayName = placeName ?? posts[0]?.placeName ?? '이 장소';
  const firstPost = posts.reduce<Post | null>((oldestPost, post) => {
    if (!oldestPost) {
      return post;
    }

    return new Date(post.createdAt).getTime() < new Date(oldestPost.createdAt).getTime()
      ? post
      : oldestPost;
  }, null);
  const firstUploaderName = firstPost?.username;
  const visiblePosts = posts.filter((post) => !hiddenPostIds[String(post.id)]);
  const hiddenPostCount = posts.length - visiblePosts.length;

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const setReaction = (
    feedId: string,
    key: keyof FeedReactionState[string],
    nextValue?: boolean,
  ) => {
    setReactions((prev) => ({
      ...prev,
      [feedId]: {
        ...defaultReaction,
        ...prev[feedId],
        [key]: nextValue ?? !prev[feedId]?.[key],
      },
    }));
  };

  const handleLikePress = async (item: Post) => {
    const feedId = String(item.id);
    const previousOverride = likeOverrides[feedId];
    const currentLiked = getDisplayLiked(item, previousOverride);
    const nextLiked = !currentLiked;

    if (likePendingById[feedId]) {
      return;
    }

    setLikePendingById((prev) => ({ ...prev, [feedId]: true }));
    setLikeOverrides((prev) => ({
      ...prev,
      [feedId]: {
        baseLiked: currentLiked,
        baseLikeCount: item.likeCount,
        liked: nextLiked,
      },
    }));

    try {
      const routePostId = toNumberId(notificationLikeContext?.postId);
      const routeNotificationsId = toNumberId(notificationLikeContext?.notificationsId);
      const notificationsId = routePostId === item.id
        ? routeNotificationsId ?? getPostNotificationsId(item)
        : getPostNotificationsId(item);

      await onToggleLike?.(item.id, nextLiked, notificationsId);
    } catch (error) {
      if (nextLiked && isAlreadyLikedError(error)) {
        setLikeOverrides((prev) => ({
          ...prev,
          [feedId]: {
            baseLiked: true,
            baseLikeCount: item.likeCount,
            liked: true,
          },
        }));
        return;
      }

      setLikeOverrides((prev) => {
        const nextOverrides = { ...prev };

        if (previousOverride) {
          nextOverrides[feedId] = previousOverride;
        } else {
          delete nextOverrides[feedId];
        }

        return nextOverrides;
      });
      Alert.alert(
        '좋아요에 실패했어요',
        getApiErrorMessage(error, '잠시 후 다시 시도해 주세요.'),
      );
    } finally {
      setLikePendingById((prev) => ({ ...prev, [feedId]: false }));
    }
  };

  const handleBookmarkPress = async (item: Post) => {
    const placeKey = String(item.placeId);

    if (bookmarkPendingByPlaceId[placeKey]) {
      return;
    }

    const previousOverride = bookmarkOverrides[placeKey];
    const wasBookmarked = getDisplayBookmarked(item, bookmarkedPlaceIds, previousOverride);
    const nextBookmarked = !wasBookmarked;

    setBookmarkPendingByPlaceId((prev) => ({ ...prev, [placeKey]: true }));
    setBookmarkOverrides((prev) => ({ ...prev, [placeKey]: nextBookmarked }));

    try {
      await onToggleBookmark(item.placeId, nextBookmarked);
    } catch (error) {
      setBookmarkOverrides((prev) => {
        const nextOverrides = { ...prev };

        if (previousOverride === undefined) {
          delete nextOverrides[placeKey];
        } else {
          nextOverrides[placeKey] = previousOverride;
        }

        return nextOverrides;
      });
      Alert.alert(
        '저장에 실패했어요',
        getApiErrorMessage(error, '잠시 후 다시 시도해 주세요.'),
      );
    } finally {
      setBookmarkPendingByPlaceId((prev) => ({ ...prev, [placeKey]: false }));
    }
  };

  const closeReportModal = () => {
    if (reportTarget && reportPendingPostIds[String(reportTarget.id)]) {
      return;
    }

    setHideReportedPost(false);
    setSelectedReportReason(null);
    setReportReason('');
    setReportTarget(null);
  };

  const submitReport = async () => {
    if (!reportTarget) {
      return;
    }

    const detail = reportReason.trim();

    if (!selectedReportReason) {
      Alert.alert('신고 사유를 선택해 주세요');
      return;
    }

    if (selectedReportReason === '기타' && !detail) {
      Alert.alert('기타 신고 사유를 입력해 주세요');
      return;
    }

    const item = reportTarget;
    const feedId = String(item.id);
    const reason = selectedReportReason === '기타' && detail
      ? `${selectedReportReason}: ${detail}`
      : selectedReportReason;

    if (reportPendingPostIds[feedId] || reportedPostIds[feedId]) {
      return;
    }

    try {
      await onReport(item.id, reason, hideReportedPost);

      if (!isMountedRef.current) {
        return;
      }

      setHideReportedPost(false);
      setSelectedReportReason(null);
      setReportReason('');
      setReportTarget(null);
      Alert.alert('신고가 접수됐어요', '검토 후 필요한 조치를 진행할게요.');
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      Alert.alert(
        '신고에 실패했어요',
        getReportErrorMessage(error)
      );
    }
  };

  const handleReportPress = (item: Post) => {
    const feedId = String(item.id);
    setOpenMenuId(null);

    if (reportedPostIds[feedId]) {
      Alert.alert('이미 신고했어요', '이 게시글은 이미 신고 접수됐어요.');
      return;
    }

    setHideReportedPost(false);
    setSelectedReportReason(null);
    setReportReason('');
    setReportTarget(item);
  };

  const isReportPending = reportTarget ? reportPendingPostIds[String(reportTarget.id)] : false;
  const isOtherReasonMissing = selectedReportReason === '기타' && !reportReason.trim();
  const isReportSubmitDisabled = !selectedReportReason || isOtherReasonMissing || isReportPending;
  return (
    <View style={[styles.card, { width }]}>
      <Modal
        animationType="fade"
        transparent
        visible={reportTarget !== null}
        onRequestClose={closeReportModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.reportModalBackdrop}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeReportModal} />
          <View style={styles.reportModal}>
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.reportModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.reportModalHeader}>
                <Text style={styles.reportModalTitle}>신고사유</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="신고 창 닫기"
                  disabled={isReportPending}
                  hitSlop={10}
                  style={styles.reportCloseButton}
                  onPress={closeReportModal}
                >
                  <Text style={styles.reportCloseText}>×</Text>
                </Pressable>
              </View>
              <View style={styles.reportReasonGrid}>
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReportReason === reason;

                  return (
                    <Pressable
                      key={reason}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      disabled={isReportPending}
                      style={styles.reportReasonOption}
                      onPress={() => {
                        setSelectedReportReason(reason);

                        if (reason !== '기타') {
                          setReportReason('');
                        }
                      }}
                    >
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <Text style={[styles.reportReasonLabel, isSelected && styles.reportReasonLabelSelected]}>
                        {reason}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {selectedReportReason === '기타' ? (
                <TextInput
                  accessibilityLabel="기타 신고 사유"
                  editable={!isReportPending}
                  multiline
                  placeholder="기타사유를 입력하세요"
                  placeholderTextColor="#b3b4ba"
                  style={styles.reportReasonInput}
                  textAlignVertical="top"
                  value={reportReason}
                  onChangeText={setReportReason}
                />
              ) : null}
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: hideReportedPost }}
                disabled={isReportPending}
                style={styles.hidePostOption}
                onPress={() => setHideReportedPost((prev) => !prev)}
              >
                <View style={[styles.checkbox, hideReportedPost && styles.checkboxSelected]}>
                  {hideReportedPost ? <Text style={styles.checkboxCheck}>✓</Text> : null}
                </View>
                <Text style={styles.hidePostLabel}>해당 게시글 다시보지 않기</Text>
              </Pressable>
              <Text style={styles.reportNotice}>신고는 반대 의견을 표시하는 기능이 아닙니다</Text>
              <View style={styles.reportModalActions}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isReportSubmitDisabled}
                  style={[
                    styles.reportSubmitButton,
                    isReportSubmitDisabled && styles.reportSubmitButtonDisabled,
                  ]}
                  onPress={() => void submitReport()}
                >
                  <Text style={styles.reportSubmitText}>
                    {isReportPending ? '신고 중...' : '신고하기'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
        <View style={styles.placeHeader}>
          <Text numberOfLines={1} style={styles.placeHeaderTitle}>{placeDisplayName}</Text>
          {firstUploaderName ? (
            <Text numberOfLines={1} style={styles.placeHeaderMeta}>
              최초 등록자 : <Text style={styles.placeHeaderAuthor}>{firstUploaderName}</Text>
            </Text>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator color="#ff1956" />
            <Text style={styles.stateText}>게시글을 불러오고 있어요</Text>
          </View>
        ) : isError ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>게시글을 불러오지 못했어요</Text>
            {onRetry ? (
              <Pressable accessibilityRole="button" style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            ) : null}
          </View>
        ) : visiblePosts.length === 0 ? (
          <View style={styles.stateContainer}>
            {hiddenPostCount > 0 ? (
              <>
                <Text style={styles.stateTitle}>표시할 게시글이 없어요</Text>
                <Text style={styles.stateText}>숨긴 게시글은 이 기기에서 다시 표시되지 않아요</Text>
              </>
            ) : (
              <>
                <Text style={styles.stateTitle}>{placeDisplayName}에 아직 게시글이 없어요</Text>
                <Text style={styles.stateText}>첫 사진을 올려 장소를 채워보세요</Text>
              </>
            )}
          </View>
        ) : visiblePosts.map((item) => {
          const feedId = String(item.id);
          const reaction = reactions[feedId] ?? defaultReaction;
          const bookmarkPlaceKey = String(item.placeId);
          const isBookmarked = getDisplayBookmarked(
            item,
            bookmarkedPlaceIds,
            bookmarkOverrides[bookmarkPlaceKey],
          );
          const likeOverride = likeOverrides[feedId];
          const isLiked = getDisplayLiked(item, likeOverride);
          const displayLikeCount = getDisplayLikeCount(item, likeOverride);
          const isMenuOpen = openMenuId === feedId;
          const isReportPending = reportPendingPostIds[feedId] ?? false;
          const isReported = reportedPostIds[feedId] ?? false;
          const reportLabel = isReportPending ? '신고 중...' : isReported ? '신고 완료' : '핑 신고';

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
                  onPress={() => setOpenMenuId(isMenuOpen ? null : feedId)}
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
                    <Pressable
                      disabled={isReportPending || isReported}
                      style={[
                        styles.menuItem,
                        (isReportPending || isReported) && styles.menuItemDisabled,
                      ]}
                      onPress={() => handleReportPress(item)}
                    >
                      <ReportIcon width={16} height={16} />
                      <Text style={styles.reportText}>{reportLabel}</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={styles.imageFrame}>
                <Image
                  source={{ uri: item.imageUrl }}
                  resizeMode="contain"
                  style={styles.feedImage}
                />
              </View>

              <View style={styles.actionRow}>
                <View style={styles.leftActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="좋아요"
                    disabled={likePendingById[feedId]}
                    hitSlop={10}
                    style={[styles.actionButton, likePendingById[feedId] && styles.disabledActionButton]}
                    onPress={() => void handleLikePress(item)}
                  >
                    <LikeIcon
                      color={isLiked ? '#ff1956' : '#5e5e66'}
                      fill={isLiked ? '#ff1956' : 'none'}
                      width={20}
                      height={18}
                    />
                  </Pressable>
                  <Text style={[styles.likeCount, isLiked && styles.activeText]}>
                    {formatLikeCount(displayLikeCount)}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="공유"
                    hitSlop={10}
                    style={styles.actionButton}
                    onPress={() => setReaction(feedId, 'shared')}
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
                  accessibilityLabel={isBookmarked ? '저장한 게시글 해제' : '게시글 저장'}
                  disabled={bookmarkPendingByPlaceId[bookmarkPlaceKey]}
                  hitSlop={10}
                  style={[
                    styles.actionButton,
                    bookmarkPendingByPlaceId[bookmarkPlaceKey] && styles.disabledActionButton,
                  ]}
                  onPress={() => void handleBookmarkPress(item)}
                >
                  <SavedIcon
                    color={isBookmarked ? '#ff1956' : '#5e5e66'}
                    fill={isBookmarked ? '#ff1956' : 'none'}
                    width={18}
                    height={21}
                  />
                </Pressable>
              </View>

              <Text style={styles.caption}>
                <Text style={styles.captionAuthor}>{item.username} </Text>
                {item.description || item.title}
              </Text>
              <Text style={styles.timeText}>{formatPostTime(item.createdAt)} • 번역 보기</Text>
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
  disabledActionButton: {
    opacity: 0.5,
  },
  feedImage: {
    height: '100%',
    width: '100%',
  },
  feedItem: {
    backgroundColor: '#fff',
    borderBottomColor: '#f1f1f4',
    borderBottomWidth: 1,
    overflow: 'visible',
    paddingBottom: 24,
  },
  feedList: {
    paddingBottom: 10,
  },
  imageFrame: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#05070d',
    justifyContent: 'center',
    width: '100%',
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
  menuItemDisabled: {
    opacity: 0.45,
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
  placeHeader: {
    alignItems: 'center',
    backgroundColor: '#f8f8fa',
    borderBottomColor: '#ececf0',
    borderBottomWidth: 1,
    minHeight: 68,
    justifyContent: 'center',
    paddingHorizontal: 58,
    paddingVertical: 12,
  },
  placeHeaderAuthor: {
    color: '#ff1956',
    fontWeight: '800',
  },
  placeHeaderMeta: {
    color: '#555965',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 2,
  },
  placeHeaderTitle: {
    color: '#15171d',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
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
  checkbox: {
    alignItems: 'center',
    borderColor: '#c6c7cc',
    borderRadius: 7,
    borderWidth: 1,
    height: 29,
    justifyContent: 'center',
    width: 29,
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  checkboxSelected: {
    backgroundColor: '#ff1956',
    borderColor: '#ff1956',
  },
  hidePostLabel: {
    color: '#777883',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  hidePostOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  reportModal: {
    backgroundColor: '#fff',
    borderRadius: 28,
    maxHeight: '92%',
    maxWidth: 360,
    width: '88%',
  },
  reportModalActions: {
    marginTop: 26,
  },
  reportModalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  reportModalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportModalContent: {
    padding: 24,
  },
  reportModalTitle: {
    color: '#24252a',
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 32,
  },
  reportCloseButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  reportCloseText: {
    color: '#55565e',
    fontSize: 38,
    fontWeight: '300',
    lineHeight: 38,
  },
  reportNotice: {
    color: '#b3b4ba',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 16,
  },
  reportReasonGrid: {
    columnGap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 30,
    rowGap: 16,
  },
  reportReasonLabel: {
    color: '#777883',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  reportReasonLabelSelected: {
    color: '#4d4e56',
    fontWeight: '700',
  },
  reportReasonOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    width: '46%',
  },
  reportReasonInput: {
    borderColor: '#c6c7cc',
    borderRadius: 6,
    borderWidth: 1,
    color: '#4d4e56',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 22,
    minHeight: 156,
    padding: 14,
  },
  radioInner: {
    backgroundColor: '#ff1956',
    borderRadius: 9,
    height: 18,
    width: 18,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: '#8b8c95',
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioOuterSelected: {
    borderColor: '#ff1956',
  },
  reportSubmitButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 20,
    height: 62,
    justifyContent: 'center',
  },
  reportSubmitButtonDisabled: {
    backgroundColor: '#d6d7da',
  },
  reportSubmitText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 12,
    height: 42,
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 18,
  },
  retryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    paddingHorizontal: 28,
  },
  stateText: {
    color: '#767680',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  stateTitle: {
    color: '#3b3b40',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    textAlign: 'center',
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
