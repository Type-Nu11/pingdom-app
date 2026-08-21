import { api } from '../../../shared/api/apiClient';
import type {
  ApiCodeErrorResponse as CommonApiCodeErrorResponse,
  ApiFieldErrorResponse as CommonApiFieldErrorResponse,
} from '../../../types/api.types';
import type { PostsPage } from '../../record/model/record.types';
import type { PlaceRecommendations, PlacesPage } from '../model/place.types';

export type PlaceAutocompleteItem = {
  address: string;
  category?: string;
  distanceMeters?: number;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
};

export type GetPlaceAutocompleteRequest = {
  keyword: string;
  latitude?: number;
  limit?: number;
  longitude?: number;
};

export type PlaceAutocompleteResponse = {
  keyword: string;
  limit: number;
  places: PlaceAutocompleteItem[];
  totalCount: number;
};

export type PlaceSort = 'LATEST' | 'NEAREST';

export type GetPlacesRequest = {
  category?: string;
  keyword?: string;
  latitude?: number;
  limit?: number;
  longitude?: number;
  page?: number;
  radiusKm?: number;
  sort?: PlaceSort;
};

export type GetPlaceRecommendationsRequest = {
  latitude: number;
  limit?: number;
  longitude: number;
  radiusKm?: number;
  recommendationVersion?: string;
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

export type GetBookmarkedPlacesRequest = {
  limit?: number;
  page?: number;
};

export type GetBookmarkedPostsRequest = {
  limit?: number;
  page?: number;
};

export type RecordRecommendationClickRequest = {
  placeId: number;
  recommendationVersion: string;
  requestId: string;
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
    const { data } = await api.post<CreateBookmarkResponse>('/users/me/bookmarks', payload);
    return data;
  },
  getBookmarkedPlaces: async (
    params: GetBookmarkedPlacesRequest = {},
  ): Promise<PlacesPage> => {
    const { data } = await api.get<PlacesPage>('/users/me/bookmarks', {
      params: {
        limit: params.limit ?? 20,
        page: params.page ?? 1,
      },
    });
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
    const { data } = await api.delete<RemoveBookmarkResponse>(`/users/me/bookmarks/${placeId}`);
    return data;
  },
  deletePlace: async (id: number): Promise<string> => {
    const { data } = await api.delete<string>(`/places/${id}`);
    return data;
  },
  getPlaces: async (params: GetPlacesRequest = {}): Promise<PlacesPage> => {
    const { data } = await api.get<PlacesPage>('/places', {
      params: {
        limit: params.limit ?? 100,
        page: params.page ?? 1,
        ...(params.keyword ? { keyword: params.keyword } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.latitude !== undefined ? { latitude: params.latitude } : {}),
        ...(params.longitude !== undefined ? { longitude: params.longitude } : {}),
        ...(params.radiusKm !== undefined ? { radiusKm: params.radiusKm } : {}),
        ...(params.sort ? { sort: params.sort } : {}),
      },
    });

    return data;
  },
  getRecommendations: async (
    params: GetPlaceRecommendationsRequest
  ): Promise<PlaceRecommendations> => {
    const { data } = await api.get<PlaceRecommendations>('/places/recommendations', {
      params: {
        latitude: params.latitude,
        limit: params.limit ?? 10,
        longitude: params.longitude,
        radiusKm: params.radiusKm ?? 5,
        ...(params.recommendationVersion ? { recommendationVersion: params.recommendationVersion } : {}),
      },
    });

    return data;
  },
  recordRecommendationClick: async (
    payload: RecordRecommendationClickRequest
  ): Promise<RecordRecommendationClickResponse> => {
    const { data } = await api.post<RecordRecommendationClickResponse>(
      '/places/recommendations/click',
      payload
    );

    return data;
  },
  autocompletePlaces: async (
    params: GetPlaceAutocompleteRequest
  ): Promise<PlaceAutocompleteResponse> => {
    const { data } = await api.get<PlaceAutocompleteResponse>('/places/autocomplete', {
      params: {
        keyword: params.keyword,
        limit: params.limit ?? 10,
        ...(params.latitude !== undefined ? { latitude: params.latitude } : {}),
        ...(params.longitude !== undefined ? { longitude: params.longitude } : {}),
      },
    });

    return data;
  },
};
