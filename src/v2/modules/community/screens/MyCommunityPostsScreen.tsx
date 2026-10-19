import React from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/native';
import { ApiErrorState, HeaderBackButton, LoadingState } from '../../../shared/components';
import { Text } from '../../../shared/components/Typography';
import Button from '../../../shared/components/Button';
import OwnerContentActions from '../../../shared/components/OwnerContentActions';
import { useContentDeletion } from '../../../shared/components/useContentDeletion';
import { useAppDialog } from '../../../shared/components/AppDialogProvider';
import ChevronIcon from '../../../shared/assets/icons/chevron-right-24.svg';
import { textStyleCss } from '../../../shared/theme/typography';
import PostCard from '../components/PostCard';
import { useDeletePost, useMyCommunityPosts } from '../hooks/useCommunity';
import type { MyPost } from '../hooks/useCommunity';

type OpenProps = { onOpenPost: (postId: number) => void; onEditPost: (postId: number) => void };
function OwnPost({ post, showDivider = true, onOpenPost, onEditPost }: OpenProps & { post: MyPost; showDivider?: boolean }) {
  const { t } = useTranslation();
  const dialog = useAppDialog();
  const mutation = useDeletePost(post.postId!);
  const deletion = useContentDeletion(() => mutation.mutateAsync(), undefined, post.postId);
  return <View>
    {post.hidden ? <Label>{t('editContent.hidden')}</Label> : null}
    <PostCard post={post} showDivider={showDivider} now={new Date()} onOpenOverflow={() => {}}
      onPress={() => { if (!post.hidden && post.postId) onOpenPost(post.postId); else dialog.toast(t('editContent.hidden')); }}
      ownerActions={<OwnerContentActions compact busy={deletion.busy} canEdit={!post.hidden}
        onEdit={post.postId ? () => onEditPost(post.postId!) : undefined} onDelete={deletion.confirm} />} />
  </View>;
}

export function MyCommunityPostsPreview({ onOpenList, onOpenPost, onEditPost }: OpenProps & { onOpenList: () => void }) {
  const { t } = useTranslation();
  const query = useMyCommunityPosts(2);
  const posts = query.data?.pages[0]?.posts?.filter(post => post.postId) ?? [];
  return <Section>
    <SectionHeader accessibilityRole="button" onPress={onOpenList} testID="my-community-posts-heading">
      <SectionTitle>{t('editContent.myPosts')}</SectionTitle><ChevronIcon />
    </SectionHeader>
    {query.isPending ? <LoadingState /> : query.isError ? <ApiErrorState error={query.error} onRetry={() => void query.refetch()} />
      : !posts.length ? <Label>{t('editContent.emptyPosts')}</Label>
        : posts.map((post, index) => <OwnPost key={post.postId} post={post} showDivider={index < posts.length - 1} onOpenPost={onOpenPost} onEditPost={onEditPost} />)}
  </Section>;
}

export default function MyCommunityPostsScreen({ onBack, onOpenPost, onEditPost }: OpenProps & { onBack: () => void }) {
  const { t } = useTranslation();
  const query = useMyCommunityPosts();
  const posts = query.data?.pages.flatMap(page => page.posts ?? []).filter(post => post.postId) ?? [];
  return <Screen edges={['top', 'bottom', 'left', 'right']}>
    <Header><HeaderBackButton accessibilityLabel={t('editContent.back')} onPress={onBack} /><Title>{t('editContent.myPosts')}</Title></Header>
    {query.isPending ? <LoadingState fill /> : query.isError && !posts.length
      ? <ApiErrorState fill error={query.error} onBack={onBack} onRetry={() => void query.refetch()} />
      : <FlatList contentContainerStyle={LIST_CONTENT_STYLE} data={posts} refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()} keyExtractor={post => String(post.postId)}
        renderItem={({ item }) => <OwnPost post={item} onOpenPost={onOpenPost} onEditPost={onEditPost} />}
        ListEmptyComponent={<Label>{t('editContent.emptyPosts')}</Label>}
        ListFooterComponent={query.hasNextPage ? <Button label={t('editContent.loadMore')} loading={query.isFetchingNextPage}
          onPress={() => { if (!query.isFetching) void query.fetchNextPage(); }} /> : null} />}
  </Screen>;
}
const Screen = styled(SafeAreaView)`flex: 1; background-color: ${({ theme }) => theme.colors.background};`;
const LIST_CONTENT_STYLE = { paddingHorizontal: 24, paddingBottom: 16 } as const;
// MyPage owns the section's vertical spacing; keep the same 24px side inset
// as its travel and verified-place sections, without another padded button.
const Section = styled.View`padding: 0 24px;`;
const SectionHeader = styled.Pressable.attrs({ hitSlop: 10 })`min-height: 24px; flex-direction: row; align-items: center; justify-content: space-between;`;
const SectionTitle = styled(Text)`flex: 1; min-width: 0; color: ${({ theme }) => theme.colors.labelStrong}; ${({ theme }) => textStyleCss(theme.typography.headline2Bold)}`;
const Header = styled.View`flex-direction: row; align-items: center; padding: 0 16px;`;
const Title = styled(Text)`flex: 1; font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.colors.textStrong};`;
const Label = styled(Text)`padding: 16px 24px; color: ${({ theme }) => theme.colors.textMuted};`;
