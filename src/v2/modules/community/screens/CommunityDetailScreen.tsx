import { Text as AppText } from '../../../shared/components/Typography';
import React, { useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import BackButtonIcon from '../../../../assets/v2/icons/community/back-button.svg';
import ChevronRightIcon from '../../../../assets/v2/icons/community/chevron-right.svg';
import MoreButtonIcon from '../../../../assets/v2/icons/community/more-button.svg';
import ApiErrorState from '../../../shared/components/ApiErrorState';
import CommentInputBar from '../components/CommentInputBar';
import CommentsSection from '../components/CommentsSection';
import LikeButton from '../components/LikeButton';
import { useCreateComment, useInfiniteComments, usePost, type CommunityPostDetail } from '../hooks/useCommunity';
import { validateCommentContent } from '../model/commentForm';
import {
  communityCommentBannerAction,
  communityCommentErrorKind,
  communityCommentFieldError,
} from '../model/commentSubmitError';

export type CommunityDetailScreenProps = {
  onBack: () => void;
  onOpenPlace?: (placeId: number) => void;
  onSignIn?: () => void;
  postId: number;
};

// getPost only returns { postId, title, content, places } (see communityApi.ts) —
// author, tags, and photos aren't part of the real contract yet. Like status
// comes from a separate `GET .../likes` call (see LikeButton), not this response.
function Places({ onOpenPlace, places }: { onOpenPlace?: (placeId: number) => void; places: CommunityPostDetail['places'] }) {
  const { t } = useTranslation();
  if (!places || places.length === 0) return null;

  return (
    <PlaceList>
      {places.map((place, index) => {
        const key = place.placeId ?? `place-${index}`;
        if (place.deleted || place.placeId === undefined) {
          return (
            <PlaceRowStatic key={key}>
              <PlaceName $muted numberOfLines={1}>{place.placeName ?? t('community.detail.placeDeleted')}</PlaceName>
            </PlaceRowStatic>
          );
        }
        const placeId = place.placeId;
        return (
          <PlaceRowPressable
            accessibilityLabel={`${t('community.detail.placeTagPrefix')} ${place.placeName ?? ''}`}
            accessibilityRole="button"
            key={key}
            onPress={onOpenPlace ? () => onOpenPlace(placeId) : undefined}
          >
            <PlaceName numberOfLines={1}>{place.placeName}</PlaceName>
            <ChevronRightIcon height={20} width={20} />
          </PlaceRowPressable>
        );
      })}
    </PlaceList>
  );
}

export default function CommunityDetailScreen({ onBack, onOpenPlace, onSignIn, postId }: CommunityDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const postQuery = usePost(postId);
  const commentsQuery = useInfiniteComments(postId, {}, { enabled: postQuery.isSuccess });
  const createComment = useCreateComment(postId);

  const scrollRef = useRef<ScrollView>(null);
  const commentsSectionY = useRef(0);
  const submissionGuard = useRef(false);
  const [draft, setDraft] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const submitComment = () => {
    if (submissionGuard.current || createComment.isPending) return;
    const validationErrorKey = validateCommentContent(draft);
    if (validationErrorKey) {
      setShowValidation(true);
      return;
    }

    submissionGuard.current = true;
    createComment.mutate({ content: draft.trim() }, {
      onError: () => {
        submissionGuard.current = false;
        AccessibilityInfo.announceForAccessibility(t('community.detail.comments.announceFailure'));
      },
      onSuccess: () => {
        submissionGuard.current = false;
        setDraft('');
        setShowValidation(false);
        AccessibilityInfo.announceForAccessibility(t('community.detail.comments.announceSuccess'));
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ animated: true, y: commentsSectionY.current });
        });
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
      const alreadyPosted = (firstPage?.comments ?? []).some((comment) => comment.content === pendingContent);
      if (alreadyPosted) {
        submissionGuard.current = false;
        setDraft('');
        setShowValidation(false);
        createComment.reset();
        AccessibilityInfo.announceForAccessibility(t('community.detail.comments.announceSuccess'));
        return;
      }
      submissionGuard.current = false;
      submitComment();
    });
  };

  const validationErrorKey = validateCommentContent(draft);
  const clientFieldError = showValidation && validationErrorKey
    ? t(`community.detail.commentInput.validation.${validationErrorKey === 'contentRequired' ? 'required' : 'tooLong'}`)
    : undefined;
  const serverFieldError = createComment.isError ? communityCommentFieldError(createComment.error) : undefined;
  const fieldErrorText = serverFieldError ?? clientFieldError;

  const bannerKind = createComment.isError ? communityCommentErrorKind(createComment.error) : null;
  const bannerAction = createComment.isError ? communityCommentBannerAction(createComment.error) : 'none';
  // The banner covers everything except a 400 whose `content` field error is
  // already shown inline under the input — that case would otherwise say the
  // same thing twice.
  const showBanner = createComment.isError && !(bannerKind === 'validation' && Boolean(serverFieldError));

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
        <BackButton accessibilityLabel={t('community.detail.back')} accessibilityRole="button" onPress={onBack}>
          <BackButtonIcon height={42} width={40} />
        </BackButton>
        <HeaderSpacer />
        <MoreButton accessibilityLabel={t('community.detail.settings')} accessibilityRole="button" hitSlop={8}>
          <MoreButtonIcon height={42} width={40} />
        </MoreButton>
      </Header>

      {postQuery.isLoading ? (
        <CenteredState testID="v2-community-detail-loading">
          <ActivityIndicator color={theme.colors.primary} />
        </CenteredState>
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
              <Title accessibilityRole="header">{postQuery.data?.title}</Title>

              <Body>
                {(postQuery.data?.content ?? '').split('\n').filter((line) => line.length > 0).map((paragraph, index) => (
                  <BodyParagraph key={`${postId}-paragraph-${index}`}>{paragraph}</BodyParagraph>
                ))}
              </Body>

              <Places onOpenPlace={onOpenPlace} places={postQuery.data?.places} />
            </Post>

            <ActionBar>
              <LikeButton onSignIn={onSignIn} postId={postId} />
            </ActionBar>

            <CommentsSection
              commentsQuery={commentsQuery}
              now={new Date()}
              onLayout={(event) => { commentsSectionY.current = event.nativeEvent.layout.y; }}
              onSignIn={onSignIn}
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
            onChangeText={(text) => {
              setDraft(text);
              if (createComment.isError) createComment.reset();
            }}
            onSubmit={submitComment}
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
const BackButton = styled.Pressable`width: 40px; height: 42px; align-items: center; justify-content: center;`;
const MoreButton = styled.Pressable`width: 40px; height: 42px; align-items: center; justify-content: center;`;
const KeyboardArea = styled(KeyboardAvoidingView)`flex: 1;`;
const Content = styled(ScrollView)`flex: 1;`;
const CenteredState = styled.View`flex: 1; align-items: center; justify-content: center;`;

const Post = styled.View`gap: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.xl}px;`;
const ActionBar = styled.View`padding: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px;`;

const Title = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 20px; font-weight: 700; line-height: 26px;`;
const Body = styled.View`gap: 6px;`;
const BodyParagraph = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; line-height: ${({ theme }) => theme.typography.body.lineHeight}px;`;

const PlaceList = styled.View`gap: ${({ theme }) => theme.spacing.sm}px;`;
const PlaceRowStatic = styled.View`
  flex-direction: row; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const PlaceRowPressable = styled.Pressable`
  flex-direction: row; align-items: center; justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const PlaceName = styled(AppText)<{ $muted?: boolean }>`flex-shrink: 1; color: ${({ $muted, theme }) => ($muted ? theme.colors.textMuted : theme.colors.textStrong)}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: 700;`;

const BannerWrap = styled.View`padding: 0 ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.lg}px;`;
const ErrorBanner = styled.View`gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.dangerSoft};`;
const ErrorBannerText = styled(AppText)`color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const BannerButton = styled.Pressable`align-self: flex-start; padding: 8px 16px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary};`;
const BannerButtonLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;
