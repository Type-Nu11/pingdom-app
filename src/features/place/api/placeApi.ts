import { api } from '../../../shared/api/apiClient';

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

export const placeApi = {
  getPlaces: async () => {
    return [];
  },
  searchPlaces: async (query: string) => {
    const { data } = await api.get<PlaceSearchResponse>('/places/search', {
      params: { query },
    });

    return data.places;
  },
};
