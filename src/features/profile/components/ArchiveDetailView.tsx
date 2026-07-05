import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage';
import type { UpdateRecordRequest } from '../../record/api/recordApi';
import { useDeletePost, useUpdatePost } from '../../record/hooks/usePostActions';
import type { Post } from '../../record/model/record.types';
import {
  PROFILE_CAPTION,
  PROFILE_DATE,
  PROFILE_LIKE_COUNT,
  PROFILE_PLACE,
  PROFILE_USERNAME,
  profileImageSource,
} from '../constants/profileMock';
import ArchiveFeedItem, { type ArchivePost } from './ArchiveFeedItem';

type ArchiveDetailViewProps = {
  initialPostId: number | null;
  onOpenLikes: () => void;
  posts?: Post[];
};

const initialArchivePosts: ArchivePost[] = [
  {
    date: PROFILE_DATE,
    description: PROFILE_CAPTION,
    id: 1,
    imageSource: profileImageSource,
    likeCount: PROFILE_LIKE_COUNT,
    title: PROFILE_PLACE,
    username: PROFILE_USERNAME,
  },
  {
    date: PROFILE_DATE,
    description: PROFILE_CAPTION,
    id: 2,
    imageSource: profileImageSource,
    likeCount: PROFILE_LIKE_COUNT,
    title: PROFILE_PLACE,
    username: PROFILE_USERNAME,
  },
];

function formatArchiveDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return PROFILE_DATE;
  }

  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}`;
}

function formatLikeCount(likeCount: number) {
  if (likeCount >= 1000) {
    const compactCount = Math.floor(likeCount / 100) / 10;
    return `${compactCount % 1 === 0 ? Math.floor(compactCount) : compactCount}K`;
  }

  return String(likeCount);
}

function toArchivePost(post: Post): ArchivePost {
  return {
    date: formatArchiveDate(post.createdAt),
    description: post.description ?? '',
    id: post.id,
    imageSource: { uri: post.imageUrl },
    likeCount: formatLikeCount(post.likeCount),
    title: post.title || post.placeName,
    username: post.username,
  };
}

const ArchiveDetailView = ({
  initialPostId,
  onOpenLikes,
  posts: sourcePosts,
}: ArchiveDetailViewProps) => {
  const archivePosts = useMemo(() => {
    const mappedPosts = sourcePosts ? sourcePosts.map(toArchivePost) : initialArchivePosts;

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
  const [posts, setPosts] = useState(archivePosts);
  const { deletePost, isDeleting } = useDeletePost();
  const { isUpdating, updatePost } = useUpdatePost();

  useEffect(() => {
    setPosts(archivePosts);
  }, [archivePosts]);

  const handleDelete = async (id: number) => {
    try {
      await deletePost(id);
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
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
      setPosts((currentPosts) => currentPosts.map((post) => (
        post.id === id
          ? {
            ...post,
            description: payload.description ?? post.description,
            imageSource: payload.file ? { uri: payload.file.uri } : post.imageSource,
            title: payload.title,
          }
          : post
      )));
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
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>보관함에 게시글이 없어요</Text>
        </View>
      ) : (
        posts.map((post, index) => (
          <ArchiveFeedItem
            key={post.id}
            isDeleting={isDeleting}
            isFirst={index === 0}
            isUpdating={isUpdating}
            item={post}
            onDelete={handleDelete}
            onOpenLikes={onOpenLikes}
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
