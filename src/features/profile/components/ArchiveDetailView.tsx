import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage';
import type { UpdateRecordRequest } from '../../record/api/recordApi';
import { useDeletePost, useUpdatePost } from '../../record/hooks/usePostActions';
import type { Post } from '../../record/model/record.types';
import ArchiveFeedItem, { type ArchivePost } from './ArchiveFeedItem';

type ArchiveDetailViewProps = {
  initialPostId: number | null;
  posts?: Post[];
};

function formatArchiveDate(createdAt: string) {
  if (!createdAt) {
    return '';
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
}

function toArchivePost(post: Post): ArchivePost {
  return {
    date: formatArchiveDate(post.createdAt),
    description: post.description ?? '',
    id: post.id,
    imageSource: { uri: post.imageUrl },
    title: post.title || post.placeName,
    username: post.username,
  };
}

const ArchiveDetailView = ({
  initialPostId,
  posts: sourcePosts,
}: ArchiveDetailViewProps) => {
  const archivePosts = useMemo(() => {
    const mappedPosts = sourcePosts ? sourcePosts.map(toArchivePost) : [];

    if (!initialPostId) {
      return mappedPosts;
    }

    const selectedPost = mappedPosts.find((post) => post.id === initialPostId);

    if (!selectedPost) {
      return mappedPosts;
    }

    return [
      selectedPost,
      ...mappedPosts.filter((post) => post.id !== initialPostId),
    ];
  }, [initialPostId, sourcePosts]);
  const { deletePost, isDeleting } = useDeletePost();
  const { isUpdating, updatePost } = useUpdatePost();

  const handleDelete = async (id: number) => {
    try {
      await deletePost(id);
      Alert.alert('삭제 완료', '게시글을 삭제했습니다.');
    } catch (error) {
      Alert.alert(
        '게시물 삭제에 실패했어요',
        getApiErrorMessage(error, '게시글을 삭제하지 못했습니다.'),
      );
    }
  };

  const handleUpdate = async (id: number, payload: UpdateRecordRequest) => {
    try {
      await updatePost(id, payload);
    } catch (error) {
      Alert.alert(
        '게시물 수정에 실패했어요',
        getApiErrorMessage(error, '게시글을 수정하지 못했습니다.'),
      );
      throw error;
    }
  };

  return (
    <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.scroll}>
      {archivePosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>보관함에 게시글이 없어요</Text>
        </View>
      ) : (
        archivePosts.map((post, index) => (
          <ArchiveFeedItem
            key={post.id}
            isDeleting={isDeleting}
            isFirst={index === 0}
            isUpdating={isUpdating}
            item={post}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  emptyText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
});

export default ArchiveDetailView;
