import { api } from '../../../shared/api/apiClient';
import type {
  ApiCodeErrorResponse as CommonApiCodeErrorResponse,
  ApiFieldErrorResponse as CommonApiFieldErrorResponse,
} from '../../../types/api.types';
import type { PostsPage } from '../../record/model/record.types';
import type { PlaceRecommendations, PlacesPage } from '../model/place.types';

export type PlaceSearchItem = {
  address: string;
  category: string;
  id: string;
  lat: number;
  lng: number;
  name: string;
  roadAddress: string;
};

type PlaceSearchResponse = {
  places: PlaceSearchItem[];
};

export type GetPlacesRequest = {
  keyword?: string;
  limit?: number;
  page?: number;
};

export type GetPlaceRecommendationsRequest = {
  latitude: number;
  limit?: number;
  longitude: number;
  radiusKm?: number;
};

export type CreatePlaceRequest = {
  address: string;
  category?: string;
  latitude: number;
  longitude: number;
  name: string;
};

export type CreatePlaceResponse = {
  address: string;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
};

export type CoordinateTokenRequest = {
  baseLatitude: number;
  baseLongitude: number;
  kakaoPlaceId: string;
};

export type CoordinateTokenResponse = {
  coordinateToken: string;
  kakaoPlaceId?: string;
  latitude?: number;
  longitude?: number;
};

export type UploadPlaceWithTokenRequest = {
  address: string;
  category: string;
  coordinateToken: string;
  imageUrl?: string;
  kakaoPlaceId: string;
  name: string;
};

export type CreateBookmarkRequest = {
  placeId: number;
};

export type CreateBookmarkResponse = {
  id: number;
  message: string;
  placeId: number;
};

export type RemoveBookmarkResponse = {
  message: string;
  placeId: number;
  userId: number;
};

export type GetBookmarkedPostsRequest = {
  limit?: number;
  page?: number;
};

export type RecordRecommendationClickRequest = {
  placeId: number;
  recommendationVersion: string;
};

export type RecordRecommendationClickResponse = {
  message: string;
  placeId: number;
};

export type ApiFieldErrorResponse = CommonApiFieldErrorResponse;

export type ApiTokenErrorResponse = CommonApiCodeErrorResponse<'INVALID_TOKEN'>;

export type BookmarkApiErrorCode =
  | 'BOOKMARK_ALREADY_EXISTS'
  | 'BOOKMARK_NOT_FOUND'
  | 'PLACE_NOT_FOUND';

export type BookmarkApiErrorResponse = CommonApiCodeErrorResponse<BookmarkApiErrorCode>;

export const placeApi = {
  createBookmark: async (payload: CreateBookmarkRequest): Promise<CreateBookmarkResponse> => {
    const { data } = await api.post<CreateBookmarkResponse>('/map/bookmarks', payload);
    return data;
  },
  getBookmarkedPosts: async (
    params: GetBookmarkedPostsRequest = {},
  ): Promise<PostsPage> => {
    const { data } = await api.get<PostsPage>('/map/bookmarks', {
      params: {
        limit: params.limit ?? 100,
        page: params.page ?? 1,
      },
    });
    return data;
  },
  removeBookmark: async (placeId: number): Promise<RemoveBookmarkResponse> => {
    const { data } = await api.delete<RemoveBookmarkResponse>('/map/bookmarks', {
      params: { placeId },
    });
    return data;
  },
  createPlace: async (payload: CreatePlaceRequest) => {
    const { data } = await api.post<CreatePlaceResponse>('/map/places/create', payload);

    return data;
  },
  createPlaceCoordinates: async (payload: CoordinateTokenRequest): Promise<CoordinateTokenResponse> => {
    const { data } = await api.post<CoordinateTokenResponse>('/map/places/coordinates', payload);
    return data;
  },
  createPlaceWithCoordinateToken: async (
    payload: UploadPlaceWithTokenRequest
  ): Promise<CreatePlaceResponse> => {
    const { data } = await api.post<CreatePlaceResponse>('/map/places/upload', payload);
    return data;
  },
  deletePlace: async (id: number): Promise<string> => {
    const { data } = await api.delete<string>(`/map/places/${id}/delete`);
    return data;
  },
  getPlaces: async (params: GetPlacesRequest = {}): Promise<PlacesPage> => {
    const { data } = await api.get<PlacesPage>('/place', {
      params: {
        limit: params.limit ?? 100,
        page: params.page ?? 1,
        ...(params.keyword ? { keyword: params.keyword } : {}),
      },
    });

    return data;
  },
  getRecommendations: async (
    params: GetPlaceRecommendationsRequest
  ): Promise<PlaceRecommendations> => {
    const { data } = await api.get<PlaceRecommendations>('/place/recommendations', {
      params: {
        latitude: params.latitude,
        limit: params.limit ?? 10,
        longitude: params.longitude,
        radiusKm: params.radiusKm ?? 5,
      },
    });

    return data;
  },
  recordRecommendationClick: async (
    payload: RecordRecommendationClickRequest
  ): Promise<RecordRecommendationClickResponse> => {
    const { data } = await api.post<RecordRecommendationClickResponse>(
      '/place/recommendations/click',
      payload
    );

    return data;
  },
  searchPlaces: async (query: string) => {
    const { data } = await api.get<PlaceSearchResponse>('/places/search', {
      params: { query },
    });

    return data.places;
  },
};
