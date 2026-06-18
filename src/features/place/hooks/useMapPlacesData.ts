import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placeApi, type PostListItem } from '../api/placeApi';
import type { HotPlace, MapMarker, MarkerPreview, Place } from '../model/place.types';
import usePlaces from './usePlaces';

const NEARBY_PING_RADIUS_METERS = 100;
const DEFAULT_MARKER_CATEGORY: MapMarker['category'] = 'music';

const getDistanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) => {
  const earthRadiusMeters = 6371000;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180;
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

const getNearbyPingRail = (
  selectedMarkerId: string | null,
  previews: MarkerPreview[],
) => {
  const selected = previews.find((preview) => preview.id === selectedMarkerId);

  if (!selected) {
    return [];
  }

  const nearby = previews.filter((preview) => (
    getDistanceMeters(selected, preview) <= NEARBY_PING_RADIUS_METERS
  ));
  const selectedIndex = nearby.findIndex((preview) => preview.id === selected.id);

  if (nearby.length < 3) {
    return nearby;
  }

  if (selectedIndex <= 0) {
    return [nearby[nearby.length - 1], nearby[0], ...nearby.slice(1, -1)];
  }

  const previous = nearby[selectedIndex - 1];
  const afterSelected = nearby.slice(selectedIndex);
  const beforePrevious = nearby.slice(0, selectedIndex - 1);
  return [previous, ...afterSelected, ...beforePrevious];
};

const formatCompactCount = (value: number) => {
  if (value >= 1000) {
    const compact = value / 1000;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}K`;
  }

  return String(value);
};

const formatRelativeTime = (value?: string) => {
  if (!value) {
    return '';
  }

  const createdAt = new Date(value).getTime();

  if (Number.isNaN(createdAt)) {
    return '';
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

  if (diffMinutes < 1) {
    return '방금 전';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return `${Math.floor(diffHours / 24)}일 전`;
};

const buildMarkers = (places: Place[]): MapMarker[] => (
  places.map((place) => ({
    category: DEFAULT_MARKER_CATEGORY,
    id: place.id,
    lat: place.lat,
    lng: place.lng,
    markerType: 'default',
  }))
);

const buildHotPlaces = (places: Place[], posts: PostListItem[]): HotPlace[] => {
  const postCountByPlace = posts.reduce<Record<string, number>>((acc, post) => {
    const placeId = String(post.placeId);
    acc[placeId] = (acc[placeId] ?? 0) + 1;
    return acc;
  }, {});

  return [...places]
    .sort((a, b) => (postCountByPlace[b.id] ?? 0) - (postCountByPlace[a.id] ?? 0))
    .slice(0, 10)
    .map((place, index) => ({
      id: place.id,
      location: place.name,
      rank: index + 1,
      username: place.registrant ?? place.address ?? '',
    }));
};

const buildMarkerPreviews = (places: Place[], posts: PostListItem[]): MarkerPreview[] => {
  const postsByPlace = posts.reduce<Record<string, PostListItem[]>>((acc, post) => {
    const placeId = String(post.placeId);
    acc[placeId] = [...(acc[placeId] ?? []), post];
    return acc;
  }, {});

  return places.map((place) => {
    const placePosts = postsByPlace[place.id] ?? [];
    const firstPost = placePosts[0];

    return {
      firstRegistrant: place.registrant ?? firstPost?.username ?? '',
      feeds: placePosts.map((post) => ({
        caption: post.description || post.title,
        id: String(post.id),
        imageUrls: post.imageUrl ? [post.imageUrl] : [],
        likeCount: formatCompactCount(post.likeCount),
        placeName: post.placeName || place.name,
        postedAt: formatRelativeTime(post.createdAt),
        username: post.username,
      })),
      id: place.id,
      lat: place.lat,
      lng: place.lng,
      locationLabel: place.address ?? '',
      title: place.name,
      updates: [],
    };
  });
};

export const useMapPlacesData = (selectedMarkerId: string | null) => {
  const { places } = usePlaces();
  const { data: posts = [] } = useQuery({
    queryKey: ['map-posts'],
    queryFn: () => placeApi.getPosts({ limit: 100 }),
  });

  const mapMarkers = useMemo(() => buildMarkers(places), [places]);
  const hotPlaces = useMemo(() => buildHotPlaces(places, posts), [places, posts]);
  const markerPreviews = useMemo(() => buildMarkerPreviews(places, posts), [places, posts]);
  const nearbyMarkerPreviews = useMemo(
    () => getNearbyPingRail(selectedMarkerId, markerPreviews),
    [markerPreviews, selectedMarkerId],
  );

  return {
    hotPlaces,
    mapMarkers,
    markerPreviews,
    nearbyMarkerPreviews,
  };
};

export default useMapPlacesData;
