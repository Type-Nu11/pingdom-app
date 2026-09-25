import { Text as AppText, TextInput as AppTextInput } from '../../../shared/components/Typography';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled, { useTheme } from 'styled-components/native';

import AvatarPlaceholder from '../../../shared/assets/icons/avatar-placeholder.svg';
import BackButtonIcon from '../../../../assets/v2/icons/community/back-button.svg';
import ChatDotsIcon from '../../../../assets/v2/icons/community/chat-dots.svg';
import ChevronRightIcon from '../../../../assets/v2/icons/community/chevron-right.svg';
import CommentAvatarIcon from '../../../../assets/v2/icons/community/comment-avatar.svg';
import HeartActiveIcon from '../../../../assets/v2/icons/community/heart-active.svg';
import HeartOutlineIcon from '../../../../assets/v2/icons/community/heart-outline.svg';
import MoreButtonIcon from '../../../../assets/v2/icons/community/more-button.svg';
import SendIcon from '../../../../assets/v2/icons/community/send.svg';
import StarFilledIcon from '../../../../assets/v2/icons/community/star-filled.svg';
import StarOutlineIcon from '../../../../assets/v2/icons/community/star-outline.svg';
import { getCommunityPostDetail } from '../model/fixtures';
import type { CommunityComment } from '../model/types';

export type CommunityDetailScreenProps = {
  onBack: () => void;
  onOpenPlace?: (placeId: number) => void;
  postId: number;
};

function CommentRow({ comment, isReply }: { comment: CommunityComment; isReply: boolean }) {
  const { t } = useTranslation();
  return (
    <CommentWrap $isReply={isReply}>
      <Avatar $small={isReply}>
        <CommentAvatarIcon height={isReply ? 16 : 18} width={isReply ? 16 : 18} />
      </Avatar>
      <CommentBody>
        <NameRow>
          <CommentAuthor>{comment.authorName}</CommentAuthor>
          {comment.isAuthor ? (
            <AuthorBadge>
              <AuthorBadgeText>{t('community.detail.authorBadge')}</AuthorBadgeText>
            </AuthorBadge>
          ) : null}
          <CommentTime>{comment.relativeTime}</CommentTime>
        </NameRow>
        <CommentContent>{comment.content}</CommentContent>
        <CommentActions>
          <ReplyLabel>{t('community.detail.replyTo')}</ReplyLabel>
          <LikeRow>
            {comment.liked ? <HeartActiveIcon height={14} width={14} /> : <HeartOutlineIcon height={14} width={14} />}
            <LikeCount $liked={comment.liked}>{comment.likeCount}</LikeCount>
          </LikeRow>
        </CommentActions>
      </CommentBody>
    </CommentWrap>
  );
}

export default function CommunityDetailScreen({ onBack, onOpenPlace, postId }: CommunityDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [commentDraft, setCommentDraft] = useState('');
  const post = getCommunityPostDetail(postId);

  if (!post) {
    return (
      <Screen edges={['top', 'right', 'bottom', 'left']}>
        <Header>
          <BackButton accessibilityLabel={t('community.detail.back')} accessibilityRole="button" onPress={onBack}>
            <BackButtonIcon height={42} width={40} />
          </BackButton>
        </Header>
        <NotFoundText>{t('community.detail.notFound')}</NotFoundText>
      </Screen>
    );
  }

  const topLevelComments = post.comments.filter((comment) => comment.parentId === null);
  const repliesByParentId = new Map<number, CommunityComment[]>();
  post.comments.forEach((comment) => {
    if (comment.parentId === null) return;
    const replies = repliesByParentId.get(comment.parentId) ?? [];
    replies.push(comment);
    repliesByParentId.set(comment.parentId, replies);
  });

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

      <KeyboardArea behavior={Platform.OS === 'ios' ? 'padding' : undefined} testID="v2-community-detail-keyboard">
        <Content keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <Post>
            <AuthorRow>
              <Avatar>
                <AvatarPlaceholder height={37} width={37} />
              </Avatar>
              <AuthorInfo>
                <AuthorName>{post.authorName}</AuthorName>
                <AuthorMeta>
                  {t('community.postMeta', { location: post.location, time: post.relativeTime, count: post.viewCount })}
                </AuthorMeta>
              </AuthorInfo>
            </AuthorRow>

            <Tags>
              {post.tags.map((tag) => (
                <TagChip key={tag}>
                  <TagLabel>{t(`community.categories.${tag}`)}</TagLabel>
                </TagChip>
              ))}
            </Tags>

            <Title accessibilityRole="header">{post.title}</Title>

            <Body>
              {post.bodyParagraphs.map((paragraph, index) => (
                <BodyParagraph key={`${post.id}-paragraph-${index}`}>{paragraph}</BodyParagraph>
              ))}
            </Body>

            {post.photoUrls.length > 0 ? (
              <PhotoScroll horizontal showsHorizontalScrollIndicator={false}>
                {post.photoUrls.map((url, index) => (
                  <PhotoWrap key={url}>
                    <Photo source={{ uri: url }} />
                    {index === 0 ? (
                      <PhotoCounter>
                        <PhotoCounterText>1/{post.photoUrls.length}</PhotoCounterText>
                      </PhotoCounter>
                    ) : null}
                  </PhotoWrap>
                ))}
              </PhotoScroll>
            ) : null}

            {post.placeTag ? (
              <PlaceTag
                accessibilityLabel={`${t('community.detail.placeTagPrefix')} ${post.placeTag.name}`}
                accessibilityRole="button"
                onPress={onOpenPlace ? () => onOpenPlace(post.placeTag!.placeId) : undefined}
              >
                <PlaceImageWrap>
                  {post.placeTag.imageUrl ? (
                    <PlaceImage source={{ uri: post.placeTag.imageUrl }} />
                  ) : (
                    <AvatarPlaceholder height={50} width={50} />
                  )}
                </PlaceImageWrap>
                <PlaceInfo>
                  <PlaceCategory numberOfLines={1}>{post.placeTag.category}</PlaceCategory>
                  <PlaceNameRow>
                    <PlaceName numberOfLines={1}>{post.placeTag.name}</PlaceName>
                    <ChevronRightIcon height={24} width={24} />
                  </PlaceNameRow>
                </PlaceInfo>
              </PlaceTag>
            ) : null}
          </Post>

          <ActionBar>
            <ActionItem>
              {post.liked ? <StarFilledIcon height={20} width={20} /> : <StarOutlineIcon height={20} width={20} />}
              <ActionLabel $tone="primary">{t('community.detail.likeCount', { count: post.likeCount })}</ActionLabel>
            </ActionItem>
            <ActionItem>
              <ChatDotsIcon height={20} width={20} />
              <ActionLabel>{t('community.detail.commentCount', { count: post.commentCount })}</ActionLabel>
            </ActionItem>
          </ActionBar>

          <Comments>
            <CommentsHeading>
              <CommentsHeadingLabel>{t('community.detail.commentsHeading')}</CommentsHeadingLabel>
              <CommentsHeadingCount>{post.commentCount}</CommentsHeadingCount>
            </CommentsHeading>

            {topLevelComments.map((comment) => (
              <React.Fragment key={comment.id}>
                <CommentRow comment={comment} isReply={false} />
                {(repliesByParentId.get(comment.id) ?? []).map((reply) => (
                  <CommentRow comment={reply} isReply key={reply.id} />
                ))}
              </React.Fragment>
            ))}

            {post.hiddenCommentCount > 0 ? (
              <ShowMoreRow accessibilityRole="button" testID="v2-community-show-more-comments">
                <ShowMoreLabel>
                  {t('community.detail.showMoreComments', { count: post.hiddenCommentCount })}
                </ShowMoreLabel>
                <ChevronDown>
                  <ChevronRightIcon height={16} width={16} />
                </ChevronDown>
              </ShowMoreRow>
            ) : null}
          </Comments>
        </Content>

        <CommentInputBar>
          <CommentField
            onChangeText={setCommentDraft}
            placeholder={t('community.detail.commentPlaceholder')}
            placeholderTextColor={theme.colors.textMuted}
            testID="v2-community-comment-input"
            value={commentDraft}
          />
          <SendButton
            accessibilityLabel={t('community.detail.send')}
            accessibilityRole="button"
            disabled={commentDraft.trim().length === 0}
            testID="v2-community-comment-send"
          >
            <SendIcon height={22} width={22} />
          </SendButton>
        </CommentInputBar>
      </KeyboardArea>
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
const NotFoundText = styled(AppText)`margin: ${({ theme }) => theme.spacing.xl}px; text-align: center; color: ${({ theme }) => theme.colors.textMuted};`;

const Post = styled.View`gap: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px ${({ theme }) => theme.spacing.md}px;`;
const AuthorRow = styled.View`flex-direction: row; align-items: center; gap: 10px;`;
const Avatar = styled.View<{ $small?: boolean }>`
  width: ${({ $small }) => ($small ? 28 : 37)}px;
  height: ${({ $small }) => ($small ? 28 : 37)}px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const AuthorInfo = styled.View`flex: 1; gap: 2px;`;
const AuthorName = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 14px; font-weight: 700;`;
const AuthorMeta = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px;`;

const Tags = styled.View`flex-direction: row; gap: 4px; align-items: center;`;
const TagChip = styled.View`padding: 4px 8px; border-radius: 8px; background-color: ${({ theme }) => theme.colors.backgroundNeutral};`;
const TagLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 500;`;

const Title = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 20px; font-weight: 700; line-height: 26px;`;
const Body = styled.View`gap: 6px;`;
const BodyParagraph = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px; line-height: ${({ theme }) => theme.typography.body.lineHeight}px;`;

const PhotoScroll = styled.ScrollView.attrs({ contentContainerStyle: { gap: 8 } })``;
const PhotoWrap = styled.View`width: 200px; height: 200px; border-radius: ${({ theme }) => theme.radius.md}px; overflow: hidden;`;
const Photo = styled(Image)`width: 100%; height: 100%;`;
const PhotoCounter = styled.View`position: absolute; right: 8px; bottom: 8px; padding: 3px 8px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: rgba(0, 0, 0, 0.4);`;
const PhotoCounterText = styled(AppText)`color: ${({ theme }) => theme.colors.textInverse}; font-size: 12px; font-weight: 500;`;

const PlaceTag = styled.Pressable`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.sm}px; border-radius: ${({ theme }) => theme.radius.md}px; background-color: ${({ theme }) => theme.colors.surfaceMuted};`;
const PlaceImageWrap = styled.View`width: 50px; height: 50px; border-radius: ${({ theme }) => theme.radius.sm}px; overflow: hidden; align-items: center; justify-content: center; background-color: ${({ theme }) => theme.colors.disabled};`;
const PlaceImage = styled(Image)`width: 100%; height: 100%;`;
const PlaceInfo = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const PlaceCategory = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const PlaceNameRow = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const PlaceName = styled(AppText)`flex-shrink: 1; color: ${({ theme }) => theme.colors.textStrong}; font-size: ${({ theme }) => theme.typography.title.fontSize}px; font-weight: 700;`;

const ActionBar = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.md}px; padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.lg}px; border-bottom-width: 8px; border-bottom-color: ${({ theme }) => theme.colors.backgroundNeutral};`;
const ActionItem = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const ActionLabel = styled(AppText)<{ $tone?: 'primary' }>`color: ${({ $tone, theme }) => ($tone === 'primary' ? theme.colors.primary : theme.colors.textAlternative)}; font-size: ${({ theme }) => theme.typography.caption.fontSize}px; font-weight: 500;`;

const Comments = styled.View`gap: ${({ theme }) => theme.spacing.lg}px; padding: ${({ theme }) => theme.spacing.lg}px;`;
const CommentsHeading = styled.View`flex-direction: row; align-items: center; gap: 4px;`;
const CommentsHeadingLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 18px; font-weight: 700;`;
const CommentsHeadingCount = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; font-size: 18px; font-weight: 700;`;

const CommentWrap = styled.View<{ $isReply: boolean }>`flex-direction: row; align-items: flex-start; gap: 10px; margin-bottom: ${({ theme }) => theme.spacing.md}px; ${({ $isReply }) => ($isReply ? 'margin-left: 42px;' : '')}`;
const CommentBody = styled.View`flex: 1; gap: 4px; min-width: 0;`;
const NameRow = styled.View`flex-direction: row; align-items: center; gap: 6px;`;
const CommentAuthor = styled(AppText)`color: ${({ theme }) => theme.colors.textStrong}; font-size: 14px; font-weight: 700;`;
const CommentTime = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px;`;
const AuthorBadge = styled.View`padding: 2px 6px; border-radius: 6px; background-color: ${({ theme }) => theme.colors.primarySelected};`;
const AuthorBadgeText = styled(AppText)`color: ${({ theme }) => theme.colors.primary}; font-size: 12px; font-weight: 500;`;
const CommentContent = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: 14px; line-height: 18px;`;
const CommentActions = styled.View`flex-direction: row; align-items: center; gap: 12px;`;
const ReplyLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textMuted}; font-size: 12px; font-weight: 500;`;
const LikeRow = styled.View`flex-direction: row; align-items: center; gap: 2px;`;
const LikeCount = styled(AppText)<{ $liked: boolean }>`color: ${({ $liked, theme }) => ($liked ? theme.colors.primary : theme.colors.textMuted)}; font-size: 12px; font-weight: 500;`;

const ShowMoreRow = styled.Pressable`flex-direction: row; align-items: center; justify-content: center; gap: 6px; height: 48px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.backgroundNeutral};`;
const ShowMoreLabel = styled(AppText)`color: ${({ theme }) => theme.colors.textAlternative}; font-size: ${({ theme }) => theme.typography.body.fontSize}px;`;
const ChevronDown = styled.View`transform: rotate(90deg);`;

const CommentInputBar = styled.View`flex-direction: row; align-items: center; gap: ${({ theme }) => theme.spacing.sm}px; padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.lg}px; border-top-width: 1px; border-top-color: ${({ theme }) => theme.colors.border};`;
const CommentField = styled(AppTextInput)`flex: 1; height: 44px; padding: 0 ${({ theme }) => theme.spacing.md}px; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.backgroundNeutral}; color: ${({ theme }) => theme.colors.text}; font-size: 14px;`;
const SendButton = styled.Pressable`width: 44px; height: 44px; align-items: center; justify-content: center; border-radius: ${({ theme }) => theme.radius.full}px; background-color: ${({ theme }) => theme.colors.primary}; opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};`;
