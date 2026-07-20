export type PlaceListItem = {
  address: string;
  category?: string;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
};

export type PlaceListPage = {
  hasNext: boolean;
  limit: number;
  page: number;
  places: PlaceListItem[];
  totalCount: number;
  totalPages: number;
};

export type GetPlaceListParams = {
  limit?: number;
  page?: number;
};
