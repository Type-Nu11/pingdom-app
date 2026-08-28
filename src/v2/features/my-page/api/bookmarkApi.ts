import { apiClient, type ApiClient } from '../../../shared/api';

export type BookmarkedPlaceSummary = {
  address: string;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
};

export type BookmarkedPlacesPage = {
  hasNext: boolean;
  limit: number;
  page: number;
  places: BookmarkedPlaceSummary[];
  totalCount: number;
  totalPages: number;
};

export type ListBookmarksParams = {
  limit?: number;
  page?: number;
};

export function createBookmarkApi(client: ApiClient = apiClient) {
  return {
    addBookmark: (placeId: number, signal?: AbortSignal): Promise<void> =>
      client.post<void, { placeId: number }>('/users/me/bookmarks', { placeId }, { signal }),

    listBookmarks: (
      params: ListBookmarksParams = {},
      signal?: AbortSignal,
    ): Promise<BookmarkedPlacesPage> =>
      client.get<BookmarkedPlacesPage>('/users/me/bookmarks', { params, signal }),

    removeBookmark: (placeId: number, signal?: AbortSignal): Promise<void> =>
      client.delete<void>(`/users/me/bookmarks/${placeId}`, undefined, { signal }),
  };
}

export const bookmarkApi = createBookmarkApi();
