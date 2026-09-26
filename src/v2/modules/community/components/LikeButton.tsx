import { Text as AppText } from '../../../shared/components/Typography';
import React, { useRef } from 'react';
import { AccessibilityInfo, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';

import StarFilledIcon from '../../../../assets/v2/icons/community/star-filled.svg';
import StarOutlineIcon from '../../../../assets/v2/icons/community/star-outline.svg';
import { getApiErrorUx } from '../../../shared/api';
import { useSharedPulse } from '../../../shared/hooks/useSharedPulse';
import { useLikeStatus, useToggleLike } from '../hooks/useCommunity';

export type LikeButtonProps = {
  onSignIn?: () => void;
  postId: number;
};

/**
 * A single in-flight toggle at a time: taps are ignored (not queued) while
 * `busyRef`/`isPending` is true, so no two like/unlike requests for this post
 * are ever outstanding together and a reordered response can't clobber a
 * newer one. `busyRef` closes the gap between the mutate() call and React
 * re-rendering with `isPending: true`.
 */
export default function LikeButton({ onSignIn, postId }: LikeButtonProps) {
  const { t } = useTranslation();
  const likeQuery = useLikeStatus(postId);
  const toggleLike = useToggleLike(postId);
  const pulse = useSharedPulse();
  const busyRef = useRef(false);

  const attempt = (nextLiked: boolean) => {
    busyRef.current = true;
    toggleLike.mutate(nextLiked, {
      onError: () => {
        busyRef.current = false;
        AccessibilityInfo.announceForAccessibility(t('community.detail.like.announceFailure'));
      },
      onSuccess: () => {
        busyRef.current = false;
        AccessibilityInfo.announceForAccessibility(
          t(nextLiked ? 'community.detail.like.announceLiked' : 'community.detail.like.announceUnliked'),
        );
      },
    });
  };

  const handlePress = () => {
    if (busyRef.current || toggleLike.isPending) return;

    if (!likeQuery.data) {
      if (likeQuery.isError && getApiErrorUx(likeQuery.error).kind === 'authentication') {
        onSignIn?.();
        return;
      }
      void likeQuery.refetch();
      return;
    }

    attempt(!likeQuery.data.liked);
  };

  // A network/timeout failure leaves the server state ambiguous — the
  // like/unlike may have gone through before the response was lost. This
  // resyncs via GET first and only re-sends the toggle if the server still
  // disagrees with what the user asked for, instead of retrying blindly.
  const handleRetry = () => {
    if (busyRef.current || toggleLike.isPending || toggleLike.variables === undefined) return;
    const ux = getApiErrorUx(toggleLike.error);
    if (ux.kind === 'authentication') {
      onSignIn?.();
      return;
    }

    const desiredLiked = toggleLike.variables;
    if (ux.kind !== 'network' && ux.kind !== 'generic') {
      toggleLike.reset();
      return;
    }

    busyRef.current = true;
    void likeQuery.refetch().then((result) => {
      busyRef.current = false;
      if (result.data?.liked === desiredLiked) {
        toggleLike.reset();
        return;
      }
      attempt(desiredLiked);
    });
  };

  if (likeQuery.isLoading) {
    return (
      <Row testID="v2-community-like-loading">
        <Animated.View style={{ opacity: pulse }}>
          <IconSkeleton />
        </Animated.View>
        <Animated.View style={{ opacity: pulse }}>
          <TextSkeleton />
        </Animated.View>
      </Row>
    );
  }

  const liked = likeQuery.data?.liked ?? false;
  const likeCount = likeQuery.data?.likeCount ?? 0;
  const loadFailed = likeQuery.isError && !likeQuery.data;
  const toggleUx = toggleLike.isError ? getApiErrorUx(toggleLike.error) : null;
  const showRetryAction = toggleUx?.kind === 'network' || toggleUx?.kind === 'generic';

  return (
    <Column>
      <Row
        accessibilityHint={loadFailed ? undefined : t(liked ? 'community.detail.like.hintUnlike' : 'community.detail.like.hintLike')}
        accessibilityLabel={loadFailed ? t('community.detail.like.retryLabel') : t('community.detail.like.a11yLabel', { count: likeCount })}
        accessibilityRole="button"
        accessibilityState={{ busy: toggleLike.isPending, disabled: toggleLike.isPending, selected: liked }}
        disabled={toggleLike.isPending}
        onPress={handlePress}
        testID="v2-community-like-button"
      >
        {liked ? <StarFilledIcon height={20} width={20} /> : <StarOutlineIcon height={20} width={20} />}
        <Count $active={liked} $muted={loadFailed}>
          {loadFailed ? t('community.detail.like.retryLabel') : t('community.detail.like.count', { count: likeCount })}
        </Count>
      </Row>

      {toggleUx && toggleUx.kind !== 'canceled' ? (
        <ErrorRow>
          <ErrorText accessibilityLiveRegion="assertive" accessibilityRole="alert">
            {t(`common.apiError.${toggleUx.kind}.description`)}
          </ErrorText>
          {showRetryAction ? (
            <RetryButton accessibilityRole="button" onPress={handleRetry} testID="v2-community-like-retry">
              <RetryLabel>{t('community.detail.like.retryLabel')}</RetryLabel>
            </RetryButton>
          ) : toggleUx.kind === 'authentication' ? (
            <RetryButton accessibilityRole="button" onPress={onSignIn} testID="v2-community-like-sign-in">
              <RetryLabel>{t('community.detail.commentInput.errors.signIn')}</RetryLabel>
            </RetryButton>
          ) : null}
        </ErrorRow>
      ) : null}
    </Column>
  );
}

const Column = styled.View`gap: ${({ theme }) => theme.spacing.sm}px;`;
const Row = styled.Pressable`flex-direction: row; align-items: center; gap: 4px; align-self: flex-start;`;

const Count = styled(AppText)<{ $active: boolean; $muted: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active, $muted, theme }) => ($muted ? theme.colors.textMuted : $active ? theme.colors.primary : theme.colors.textAlternative)};
`;

const IconSkeleton = styled.View`width: 20px; height: 20px; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.border};`;
const TextSkeleton = styled.View`width: 48px; height: 14px; border-radius: ${({ theme }) => theme.radius.sm}px; background-color: ${({ theme }) => theme.colors.border};`;

const ErrorRow = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px;`;
const ErrorText = styled(AppText)`flex-shrink: 1; color: ${({ theme }) => theme.colors.danger}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px;`;
const RetryButton = styled.Pressable`align-self: flex-start; padding: 6px 14px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary};`;
const RetryLabel = styled(AppText)`color: ${({ theme }) => theme.colors.onPrimary}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 700;`;
