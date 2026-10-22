import { useContentDeletion } from '../../../shared/components/useContentDeletion';
import { canManageCommunityPost } from '../model/postOwnership';
import { useProfile } from '../../user/profile';
import OwnerContentActions from '../../../shared/components/OwnerContentActions';
import Skeleton from '../../../shared/components/Skeleton';
import { Text as AppText } from '../../../shared/components/Typography';
import React, { useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, type TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackButtonIcon from '../../../../assets/v2/icons/community/back-button.svg';
import ChatDotsIcon from '../../../../assets/v2/icons/community/chat-dots.svg';
import ChevronRightIcon from '../../../../assets/v2/icons/community/chevron-right.svg';
import MoreButtonIcon from '../../../../assets/v2/icons/community/more-button.svg';
import ApiErrorState from '../../../shared/components/ApiErrorState';
import { textStyleCss } from '../../../shared/theme/typography';
import CategoryTag from '../components/CategoryTag';
import CommentInputBar from '../components/CommentInputBar';
import CommentsSection from '../components/CommentsSection';
import CommunityPlaceCard from '../components/CommunityPlaceCard';
import HeaderIconButton from '../components/HeaderIconButton';
import LikeButton from '../components/LikeButton';
import PostAuthor from '../components/PostAuthor';
import PostPhotoGallery from '../components/PostPhotoGallery';
import CommunityTranslationActions from '../components/CommunityTranslationActions';
import { useCommunityTranslation } from '../hooks/useCommunityTranslation';
import { useCreateComment, useInfiniteComments, usePost, useDeletePost, type CommunityPostDetail } from '../hooks/useCommunity';
import { replyParentId } from '../model/commentThread';
import { useCommunityPlaceEntry } from '../hooks/useCommunityPlaceEntry';
import { validateCommentContent } from '../model/commentForm';
import {
  communityCommentBannerAction,
  communityCommentErrorKind,
  communityCommentFieldError,
} from '../model/commentSubmitError';
import type { PlaceEntryError } from '../model/placeEntryError';

export type CommunityDetailScreenProps = {
  onBack: () => void;
  onEditPost?: (postId: number) => void;
  onOpenPlace?: (placeId: number) => void;
  onSignIn?: () => void;
  postId: number;
};

function placeEntryErrorMessageKey(kind: PlaceEntryError['kind']): string {
  if (kind === 'authentication') return 'common.apiError.authentication.description';
  if (kind === 'authorization') return 'common.apiError.authorization.description';
  if (kind === 'network') return 'common.apiError.network.description';
  return 'community.detail.placeCard.errors.unavailable';
}

type PlaceEntry = ReturnType<typeof useCommunityPlaceEntry>;

// Figma `PlaceTag` (8241:47062). The thumbnail and "category · region" line
// come straight from the post's `places[]` — no place GET is prefetched to
// fill them in, which would bypass the view-count endpoint this card exists
// for. Like status comes from a separate `GET .../likes` call (see LikeButton).
function Places({
  onOpenPlace,
  onPlaceUnavailable,
  onSignIn,
  placeEntry,
  places,
}: {
  onOpenPlace?: (placeId: number) => void;
  onPlaceUnavailable?: () => void;
  onSignIn?: () => void;
  placeEntry: PlaceEntry;
  places: CommunityPostDetail['places'];
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  if (!places || places.length === 0) return null;

  return (
    <PlaceList>
      {places.map((place, index) => {
        const key = place.placeId ?? `place-${index}`;
        if (place.deleted || place.placeId === undefined) {
          return (
            <PlaceRowStatic
              accessibilityLabel={place.placeName ?? t('community.detail.placeDeleted')}
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              disabled
              key={key}
            >
              <CommunityPlaceCard muted name={place.placeName ?? t('community.detail.placeDeleted')} />
            </PlaceRowStatic>
          );
        }
        const placeId = place.placeId;
        const busy = placeEntry.isBusy(placeId);
        const error = placeEntry.errorFor(placeId);

        const attempt = () => {
          if (busy) return;
          placeEntry.openPlace(placeId, {
            onError: (error) => {
              AccessibilityInfo.announceForAccessibility(t('community.detail.placeCard.announceFailure'));
              if (error.kind === 'unavailable') onPlaceUnavailable?.();
            },
            onSuccess: () => onOpenPlace?.(placeId),
          });
        };

        return (
          <PlaceCardColumn key={key}>
            <PlaceRowPressable
              accessibilityHint={t('community.detail.placeCard.a11yHint')}
              accessibilityLabel={t('community.detail.placeCard.a11yLabel', { name: place.placeName ?? '' })}
              accessibilityRole="button"
              accessibilityState={{ busy, disabled: busy }}
              disabled={busy}
              onPress={onOpenPlace ? attempt : undefined}
              testID={`v2-community-place-${placeId}`}
            >
              <CommunityPlaceCard
                category={place.category}
                imageUrl={place.imageUrl}
                name={place.placeName ?? ''}
                nameAccessory={busy ? (
                  <ActivityIndicator size="small" testID={`v2-community-place-busy-${placeId}`} />
                ) : (
                  <ChevronRightIcon color={theme.colors.textMuted} height={24} width={24} />
                )}
                region={place.region}
                testID={`v2-community-place-card-${placeId}`}
              />
            </PlaceRowPressable>

            {error ? (
              <PlaceErrorRow>
                <PlaceErrorText accessibilityLiveRegion="assertive" accessibilityRole="alert">
                  {t(placeEntryErrorMessageKey(error.kind))}
                </PlaceErrorText>
                {error.kind === 'network' ? (
                  <PlaceRetryButton
                    accessibilityRole="button"
                    onPress={attempt}
                    testID={`v2-community-place-retry-${placeId}`}
                  >
                    <PlaceRetryLabel>{t('common.apiError.actions.retry')}</PlaceRetryLabel>
                  </PlaceRetryButton>
                ) : error.kind === 'authentication' ? (
                  <PlaceRetryButton
                    accessibilityRole="button"
                    onPress={onSignIn}
                    testID={`v2-community-place-sign-in-${placeId}`}
                  >
                    <PlaceRetryLabel>{t('common.apiError.actions.signIn')}</PlaceRetryLabel>
                  </PlaceRetryButton>
                ) : null}
              </PlaceErrorRow>
            ) : null}
          </PlaceCardColumn>
        );
      })}
    </PlaceList>
  );
}

export default function CommunityDetailScreen({ onBack, onEditPost, onOpenPlace, onSignIn, postId }: CommunityDetailScreenProps) {
  const { profile } = useProfile();
  const { t } = useTranslation();
  const theme = useTheme();
  const postQuery = usePost(postId);
  const translation = useCommunityTranslation(`post-detail-${postId}`, [postQuery.data?.title ?? '', postQuery.data?.content ?? '']);
  const deletion = useDeletePost(postId);
  const deleteAction = useContentDeletion(() => deletion.mutateAsync(), onBack, postId);
  const commentsQuery = useInfiniteComments(postId, {}, { enabled: postQuery.isSuccess });
  const createComment = useCreateComment(postId);
  const placeEntry = useCommunityPlaceEntry(postId);

  const scrollRef = useRef<ScrollView>(null);
  const commentsSectionY = useRef(0);
  const submissionGuard = useRef(false);
  const inputRef = useRef<TextInput>(null);
  const [draft, setDraft] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  // Replies are one level deep: replying to a reply targets its parent.
  const [replyTarget, setReplyTarget] = useState<{ authorName: string; parentCommentId: number } | null>(null);

  const submitComment = () => {
    if (submissionGuard.current || createComment.isPending) return;
  const validationErrorKey = validateCommentContent(draft);
    if (validationErrorKey) {
      setShowValidation(true);
      return;
    }

    submissionGuard.current = true;
    const replying = replyTarget !== null;
    createComment.mutate({
      content: draft.trim(),
      ...(replyTarget ? { parentCommentId: replyTarget.parentCommentId } : {}),
    }, {
      onError: () => {
        submissionGuard.current = false;
        AccessibilityInfo.announceForAccessibility(t('community.detail.comments.announceFailure'));
      },
      onSuccess: () => {
        submissionGuard.current = false;
        setDraft('');
        setShowValidation(false);
        setReplyTarget(null);
        AccessibilityInfo.announceForAccessibility(
          t(replying ? 'community.detail.comments.announceReplySuccess' : 'community.detail.comments.announceSuccess'),
        );
        // A new top-level comment lands at the top of the newest-first list;
        // a reply appears under its parent, so the scroll stays where it is.
        if (!replying) {
          requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ animated: true, y: commentsSectionY.current });
          });
        }
      },
    });
  };

  // A network/timeout failure leaves the server state ambiguous — the POST
  // may have gone through before the response was lost. Retrying blindly
  // risks a duplicate, so this refetches the (newest-first) first page and
  // only re-submits if the pending content isn't already there.
  const retryAfterNetworkError = () => {
    if (submissionGuard.current) return;
    submissionGuard.current = true;
    const pendingContent = draft.trim();

    void commentsQuery.refetch().then((result) => {
      const firstPage = result.data?.pages[0];
      const pendingParentId = replyTarget?.parentCommentId;
      const alreadyPosted = (firstPage?.comments ?? []).some((comment) => (
        comment.content === pendingContent && (comment.parentCommentId ?? undefined) === pendingParentId
      ));
      if (alreadyPosted) {
        submissionGuard.current = false;
        setDraft('');
        setShowValidation(false);
        setReplyTarget(null);
        createComment.reset();
        AccessibilityInfo.announceForAccessibility(t('community.detail.comments.announceSuccess'));
        return;
      }
      submissionGuard.current = false;
      submitComment();
    });
  };

  const commentCount = commentsQuery.data?.pages[0]?.totalCount ?? 0;
  const now = new Date();
  const validationErrorKey = validateCommentContent(draft);
  const clientFieldError = showValidation && validationErrorKey
    ? t(`community.detail.commentInput.validation.${validationErrorKey === 'contentRequired' ? 'required' : 'tooLong'}`)
    : undefined;
  const serverFieldError = createComment.isError ? communityCommentFieldError(createComment.error) : undefined;
  const fieldErrorText = serverFieldError ? t('common.apiError.validation.description') : clientFieldError;

  const bannerKind = createComment.isError ? communityCommentErrorKind(createComment.error) : null;
  const bannerAction = createComment.isError ? communityCommentBannerAction(createComment.error) : 'none';
  // The banner covers everything except a 400 whose `content` field error is
  // already shown inline under the input — that case would otherwise say the
  // same thing twice.
  const showBanner = createComment.isError && bannerKind !== 'canceled' && !(bannerKind === 'validation' && Boolean(serverFieldError));

  // Only a 404 with no comment data at all (nothing was ever fetched)
  // triggers the full-screen not-found swap; a 404 on a later page while
  // earlier pages are already showing is left to the inline footer error.
  const commentsNotFound = commentsQuery.isError
    && !commentsQuery.data
    && communityCommentErrorKind(commentsQuery.error) === 'notFound';

  const onBannerRetry = () => {
    if (bannerKind === 'network') {
      retryAfterNetworkError();
      return;
    }
    submitComment();
  };

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-community-detail-screen">
      <Header>
        <HeaderIconButton
          Icon={BackButtonIcon}
          accessibilityLabel={t('community.detail.back')}
          accessibilityRole="button"
          onPress={onBack}
        />
        <HeaderSpacer />
        {canManageCommunityPost(postQuery.data?.author?.authorId, profile?.id)
          ? <OwnerContentActions busy={deleteAction.busy} onDelete={deleteAction.confirm} key={postId} onEdit={onEditPost ? () => onEditPost(postId) : undefined} />
          : <HeaderIconButton Icon={MoreButtonIcon} accessibilityLabel={t('community.detail.settings')} accessibilityRole="button" />}
      </Header>

      {postQuery.isLoading ? (
        <Skeleton variant="post" accessibilityLabel={t('experience.common.loading')} testID="v2-community-detail-loading" style={{ padding: 16 }} />
      ) : postQuery.isError ? (
        <ApiErrorState
          error={postQuery.error}
          fill
          onBack={onBack}
          onRetry={() => void postQuery.refetch()}
          onSignIn={onSignIn}
        />
      ) : commentsNotFound ? (
        // The post loaded, but its comments 404'd — the post was deleted
        // out from under this screen after load. Matches the same
        // full-screen not-found flow as `postQuery` 404ing outright, rather
        // than a small inline block inside the comments section.
        <ApiErrorState
          error={commentsQuery.error}
          fill
          onBack={onBack}
          onRetry={() => void commentsQuery.refetch()}
          onSignIn={onSignIn}
        />
      ) : (
        <KeyboardArea behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Content keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" ref={scrollRef}>
            <Post>
              <PostAuthor
                author={postQuery.data?.author}
                createdAt={postQuery.data?.createdAt}
                now={now}
                region={postQuery.data?.region}
                viewCount={postQuery.data?.viewCount}
              />
              {postQuery.data?.category?.categoryName ? (
                <CategoryTag label={postQuery.data.category.categoryName} testID="v2-community-detail-category" />
              ) : null}
              <Title {...translation.textActions} accessibilityRole="header">{translation.texts[0]}</Title>

              {/* Figma keeps the author's blank lines between paragraphs, so the
                  content renders as one text block with its newlines intact. */}
              <Body {...translation.textActions} testID="v2-community-detail-body">{translation.texts[1]}</Body>
              <CommunityTranslationActions translation={translation} />

              <PostPhotoGallery images={postQuery.data?.images} />

              <Places
                onOpenPlace={onOpenPlace}
                onPlaceUnavailable={() => void postQuery.refetch()}
                onSignIn={onSignIn}
                placeEntry={placeEntry}
                places={postQuery.data?.places}
              />
            </Post>

            <ActionBar>
              <LikeButton onSignIn={onSignIn} postId={postId} />
              <CommentJump
                accessibilityLabel={t('community.detail.comments.jumpA11yLabel', { count: commentCount })}
                accessibilityRole="button"
                onPress={() => scrollRef.current?.scrollTo({ animated: true, y: commentsSectionY.current })}
                testID="v2-community-comment-jump"
              >
                <ChatDotsIcon color={theme.colors.textAlternative} height={20} width={20} />
                <CommentJumpLabel>{t('community.detail.comments.count', { count: commentCount })}</CommentJumpLabel>
              </CommentJump>
            </ActionBar>

            <CommentsSection
              commentsQuery={commentsQuery}
              now={now}
              postAuthorId={postQuery.data?.author?.authorId}
              onLayout={(event) => { commentsSectionY.current = event.nativeEvent.layout.y; }}
              onReply={(comment) => {
                const parentCommentId = replyParentId(comment);
                if (parentCommentId === undefined) return;
                setReplyTarget({ authorName: comment.authorName ?? '', parentCommentId });
                if (createComment.isError) createComment.reset();
                inputRef.current?.focus();
              }}
              onSignIn={onSignIn}
              postId={postId}
            />

            {showBanner ? (
              <BannerWrap>
                <ErrorBanner testID="v2-community-comment-error-banner">
                  <ErrorBannerText accessibilityLiveRegion="assertive" accessibilityRole="alert">
                    {bannerKind === 'notFound'
                      ? t('community.detail.commentInput.errors.postNotFound')
                      : t(`common.apiError.${bannerKind}.description`)}
                  </ErrorBannerText>
                  {bannerKind === 'network' ? (
                    <ErrorBannerText>{t('community.detail.commentInput.errors.networkDuplicateWarning')}</ErrorBannerText>
                  ) : null}
                  {bannerAction === 'retry' ? (
                    <BannerButton accessibilityRole="button" onPress={onBannerRetry} testID="v2-community-comment-error-retry">
                      <BannerButtonLabel>{t('community.detail.commentInput.errors.retry')}</BannerButtonLabel>
                    </BannerButton>
                  ) : bannerAction === 'signIn' ? (
                    <BannerButton accessibilityRole="button" onPress={onSignIn} testID="v2-community-comment-error-sign-in">
                      <BannerButtonLabel>{t('community.detail.commentInput.errors.signIn')}</BannerButtonLabel>
                    </BannerButton>
                  ) : null}
                </ErrorBanner>
              </BannerWrap>
            ) : null}
          </Content>

          <CommentInputBar
            busy={createComment.isPending}
            disabled={createComment.isPending}
            errorText={fieldErrorText}
            inputRef={inputRef}
            onCancelReply={() => setReplyTarget(null)}
            onChangeText={(text) => {
              setDraft(text);
              if (createComment.isError) createComment.reset();
            }}
            onSubmit={submitComment}
            replyToAuthorName={replyTarget?.authorName}
            value={draft}
          />
        </KeyboardArea>
      )}
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const Header = styled.View`height: 44px; flex-direction: row; align-items: center; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const HeaderSpacer = styled.View`flex: 1;`;
const KeyboardArea = styled(KeyboardAvoidingView)`flex: 1;`;
const Content = styled(ScrollView)`flex: 1;`;
const CenteredState = styled.View`flex: 1; align-items: center; justify-content: center;`;

// Figma `Post`: 12px top / 16px bottom padding, 24px sides, 16px between blocks.
const Post = styled.View`gap: 16px; padding: 12px 24px 16px;`;
// Figma `ActionBar` (8241:47080): 12px above and below the 20px reaction row,
// closed by the 8px `Line/Neutral` band that separates the comments.
const ActionBar = styled.View`
  flex-direction: row; align-items: flex-start; gap: 16px;
  padding: 12px 24px;
  border-bottom-width: 8px;
  border-bottom-color: ${({ theme }) => theme.colors.lineNeutral};
`;
const CommentJump = styled.Pressable`flex-direction: row; align-items: center; gap: 4px; height: 20px;`;
const CommentJumpLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; ${({ theme }) => textStyleCss(theme.typography.labelMedium)}`;

const Title = styled(AppText)`color: ${({ theme }) => theme.colors.labelStrong}; ${({ theme }) => textStyleCss(theme.typography.headline1Bold)}`;
const Body = styled(AppText)`color: ${({ theme }) => theme.colors.labelNeutral}; ${({ theme }) => textStyleCss(theme.typography.bodyRegular)}`;

const PlaceList = styled.View`gap: ${({ theme }) => theme.spacing.sm}px;`;
const PlaceCardColumn = styled.View`gap: ${({ theme }) => theme.spacing.xs}px;`;
// The shared `CommunityPlaceCard` draws the card; these only make it tappable.
const PlaceRowStatic = styled.Pressable``;
const PlaceRowPressable = styled.Pressable``;

const PlaceErrorRow = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: 0 ${({ theme }) => theme.spacing.md}px;`;
const PlaceErrorText = styled(AppText)`flex-shrink: 1; color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const PlaceRetryButton = styled.Pressable`align-self: flex-start; padding: 6px 14px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primaryAction};`;
const PlaceRetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;

const BannerWrap = styled.View`padding: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px;`;
const ErrorBanner = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.dangerSoft};`;
const ErrorBannerText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const BannerButton = styled.Pressable`align-self: flex-start; padding: 8px 16px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primaryAction};`;
const BannerButtonLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;
