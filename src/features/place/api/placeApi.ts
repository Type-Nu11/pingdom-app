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

export type CreatePlaceRequest = {
  address: string;
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

export type ApiFieldErrorResponse = {
  errors?: Record<string, string>;
  message: string;
};

export type ApiTokenErrorResponse = {
  code: 'INVALID_TOKEN';
  message: string;
};

export const placeApi = {
  createPlace: async (payload: CreatePlaceRequest) => {
    const { data } = await api.post<CreatePlaceResponse>('/map/places/create', payload);

    return data;
  },
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
