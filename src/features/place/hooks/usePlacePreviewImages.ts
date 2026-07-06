import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { recordApi } from '../../record/api/recordApi';
import { postQueryKeys } from '../../record/hooks/usePlacePosts';
import type { Post, PostsPage } from '../../record/model/record.types';
import type { RecommendedPlace } from '../model/place.types';

const PREVIEW_POST_PARAMS = {
  limit: 100,
  page: 1,
};

const PREVIEW_POST_QUERY_KEY = [
  ...postQueryKeys.all,
  'previewImages',
  PREVIEW_POST_PARAMS,
] as const;

function getInlinePreviewImage(place: RecommendedPlace) {
  const placeWithImages = place as RecommendedPlace & {
    imageUrl?: string;
    images?: Array<{ imageUrl?: string; url?: string } | string>;
    mediaUrls?: string[];
    thumbnailUrl?: string;
  };
  const imageUrl = placeWithImages.imageUrl ?? placeWithImages.thumbnailUrl;

  if (imageUrl) {
    return imageUrl;
  }

  const imageFromImages = placeWithImages.images?.find((image) => (
    typeof image === 'string' ? Boolean(image) : Boolean(image.imageUrl ?? image.url)
  ));

  if (typeof imageFromImages === 'string') {
    return imageFromImages;
  }

  return imageFromImages?.imageUrl ?? imageFromImages?.url ?? placeWithImages.mediaUrls?.[0];
}

function getPostPreviewImage(post: Post) {
  const postWithMedia = post as Post & {
    imageUrls?: string[];
    images?: Array<{ imageUrl?: string; url?: string } | string>;
    mediaUrls?: string[];
  };
  const imageUrls = [
    ...(Array.isArray(postWithMedia.imageUrls) ? postWithMedia.imageUrls : []),
    ...(Array.isArray(postWithMedia.mediaUrls) ? postWithMedia.mediaUrls : []),
    ...(Array.isArray(postWithMedia.images)
      ? postWithMedia.images.map((image) => (
        typeof image === 'string' ? image : image.imageUrl ?? image.url
      ))
      : []),
    post.imageUrl,
  ].filter((url): url is string => Boolean(url?.trim()));

  return imageUrls[0];
}

async function getPostsForPreviewImages(): Promise<PostsPage> {
  const firstPage = await recordApi.getPosts(PREVIEW_POST_PARAMS);

  if (!firstPage.hasNext || firstPage.totalPages <= 1) {
    return firstPage;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) => (
      recordApi.getPosts({
        ...PREVIEW_POST_PARAMS,
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

export function usePlacePreviewImages(places: RecommendedPlace[]) {
  const placeIds = useMemo(
    () => places
      .map((place) => Number(place.id))
      .filter((placeId) => Number.isFinite(placeId)),
    [places]
  );
  const previewQueries = useQueries({
    queries: placeIds.map((placeId) => {
      const queryParams = {
        limit: 20,
        page: 1,
        placeId,
      };

      return {
        enabled: Number.isFinite(placeId),
        queryFn: () => recordApi.getPosts(queryParams),
        queryKey: postQueryKeys.place(placeId, queryParams),
        staleTime: 30_000,
      };
    }),
  });
  const previewPostsQuery = useQuery({
    queryFn: getPostsForPreviewImages,
    queryKey: PREVIEW_POST_QUERY_KEY,
  });

  return useMemo(() => {
    const imageUrlsByPlaceId: Record<string, string> = {};
    const isLoadingByPlaceId: Record<string, boolean> = {};

    places.forEach((place) => {
      const imageUrl = getInlinePreviewImage(place);

      if (imageUrl) {
        imageUrlsByPlaceId[String(place.id)] = imageUrl;
      }
    });

    (previewPostsQuery.data?.posts ?? []).forEach((post) => {
      const placeKey = String(post.placeId);
      const imageUrl = getPostPreviewImage(post);

      if (imageUrl && !imageUrlsByPlaceId[placeKey]) {
        imageUrlsByPlaceId[placeKey] = imageUrl;
      }
    });

    previewQueries.forEach((query, index) => {
      const placeId = placeIds[index];
      const placeKey = String(placeId);
      const previewPost = query.data?.posts.find((post) => (
        Number(post.placeId) === placeId && Boolean(getPostPreviewImage(post))
      ));
      const previewImageUrl = previewPost ? getPostPreviewImage(previewPost) : undefined;

      if (previewImageUrl && !imageUrlsByPlaceId[placeKey]) {
        imageUrlsByPlaceId[placeKey] = previewImageUrl;
      }

      isLoadingByPlaceId[placeKey] = !imageUrlsByPlaceId[placeKey]
        && (query.isLoading || previewPostsQuery.isLoading);
    });

    return {
      imageUrlsByPlaceId,
      isLoadingByPlaceId,
    };
  }, [placeIds, places, previewPostsQuery.data?.posts, previewPostsQuery.isLoading, previewQueries]);
}
