import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordApi } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import type { Post, PostsPage } from '../../record/model/record.types';
import type { RecommendedPlace } from '../model/place.types';

const POST_BACKED_PLACE_PARAMS = {
  limit: 100,
  page: 1,
};

const POST_BACKED_PLACE_QUERY_KEY = [
  ...postQueryKeys.all,
  'postBackedPlaces',
  POST_BACKED_PLACE_PARAMS,
] as const;

type PostBackedRecommendedPlace = RecommendedPlace & {
  imageUrl?: string;
};

async function getPostsForPlaceCards(): Promise<PostsPage> {
  const firstPage = await recordApi.getPosts(POST_BACKED_PLACE_PARAMS);

  if (!firstPage.hasNext || firstPage.totalPages <= 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) => (
      recordApi.getPosts({
        ...POST_BACKED_PLACE_PARAMS,
        page: index + 2,
      })
    ))
  );

  return {
    ...firstPage,
    hasNext: false,
    posts: [
      ...firstPage.posts,
      ...remainingPages.flatMap((page) => page.posts),
    ],
  };
}

function toPostBackedPlace(post: Post): PostBackedRecommendedPlace {
  return {
    address: '',
    distanceMeters: 0,
    id: post.placeId,
    imageUrl: post.imageUrl,
    latitude: 0,
    longitude: 0,
    name: post.placeName,
    placeGrowth: {
      currentLevelMinPhotoCount: 0,
      level: 0,
      nextLevelMinPhotoCount: 0,
      photoCount: 0,
      progressPercent: 0,
    },
    reason: '',
    userId: post.userId,
    username: post.username,
  };
}

export function usePostBackedPlaces() {
  const postsQuery = useQuery({
    queryFn: getPostsForPlaceCards,
    queryKey: POST_BACKED_PLACE_QUERY_KEY,
  });

  const places = useMemo(() => {
    const postsByPlaceId = new Map<number, Post>();

    (postsQuery.data?.posts ?? [])
      .filter((post) => Boolean(post.imageUrl?.trim()))
      .sort((a, b) => {
        if (b.likeCount !== a.likeCount) {
          return b.likeCount - a.likeCount;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .forEach((post) => {
        if (!postsByPlaceId.has(post.placeId)) {
          postsByPlaceId.set(post.placeId, post);
        }
      });

    return Array.from(postsByPlaceId.values()).map(toPostBackedPlace);
  }, [postsQuery.data?.posts]);

  return {
    error: postsQuery.error,
    isError: postsQuery.isError,
    isLoading: postsQuery.isLoading,
    places,
    refetch: postsQuery.refetch,
  };
}

export default usePostBackedPlaces;
