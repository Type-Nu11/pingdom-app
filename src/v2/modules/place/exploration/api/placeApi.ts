import { apiClient, getApiErrorUx, toApiError } from '../../../../shared/api';
import type { PlacesPage } from '../../core/place.types';

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

export type BookmarkApiErrorCode =
  | 'BOOKMARK_ALREADY_EXISTS'
  | 'BOOKMARK_NOT_FOUND'
  | 'PLACE_NOT_FOUND';

export function isBookmarkAuthenticationError(error: unknown) {
  return getApiErrorUx(error).kind === 'authentication';
}

export function isExpectedBookmarkStateError(error: unknown, nextBookmarked: boolean) {
  const code = toApiError(error).code?.toUpperCase();
  return (nextBookmarked && code === 'BOOKMARK_ALREADY_EXISTS')
    || (!nextBookmarked && code === 'BOOKMARK_NOT_FOUND');
}

export const placeApi = {
  createBookmark: async (payload: CreateBookmarkRequest): Promise<CreateBookmarkResponse> => {
    return apiClient.post<CreateBookmarkResponse, CreateBookmarkRequest>('/users/me/bookmarks', payload);
  },
  getBookmarkedPlaces: async (
    params: GetBookmarkedPlacesRequest = {},
    signal?: AbortSignal,
  ): Promise<PlacesPage> => {
    return apiClient.get<PlacesPage>('/users/me/bookmarks', {
      signal,
      params: {
        limit: params.limit ?? 20,
        page: params.page ?? 1,
      },
    });
  },
  removeBookmark: async (placeId: number): Promise<RemoveBookmarkResponse> => {
    return apiClient.delete<RemoveBookmarkResponse>(`/users/me/bookmarks/${placeId}`);
  },
  deletePlace: async (id: number): Promise<string> => {
    return apiClient.delete<string>(`/places/${id}`);
  },
  getPlaces: async (params: GetPlacesRequest = {}): Promise<PlacesPage> => {
    return apiClient.get<PlacesPage>('/places', {
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

  },
  autocompletePlaces: async (
    params: GetPlaceAutocompleteRequest
  ): Promise<PlaceAutocompleteResponse> => {
    return apiClient.get<PlaceAutocompleteResponse>('/places/autocomplete', {
      params: {
        keyword: params.keyword,
        limit: params.limit ?? 10,
        ...(params.latitude !== undefined ? { latitude: params.latitude } : {}),
        ...(params.longitude !== undefined ? { longitude: params.longitude } : {}),
      },
    });

  },
};
