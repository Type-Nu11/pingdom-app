import { api } from '../../../shared/api/apiClient';
import type {
  ApiCodeErrorResponse as CommonApiCodeErrorResponse,
  ApiFieldErrorResponse as CommonApiFieldErrorResponse,
} from '../../../types/api.types';
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
  coordinateToken: string;
  imageUrl?: string;
  kakaoPlaceId: string;
  name: string;
};

export type FavoritePlaceRequest = {
  placeId: number;
};

export type FavoritePlaceResponse = {
  id: number;
  message: string;
  placeId: number;
};

export type ApiFieldErrorResponse = CommonApiFieldErrorResponse;

export type ApiTokenErrorResponse = CommonApiCodeErrorResponse<'INVALID_TOKEN'>;

export const placeApi = {
  addFavorite: async (payload: FavoritePlaceRequest): Promise<FavoritePlaceResponse> => {
    const { data } = await api.post<FavoritePlaceResponse>('/map/favorites', payload);
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
  searchPlaces: async (query: string) => {
    const { data } = await api.get<PlaceSearchResponse>('/places/search', {
      params: { query },
    });

    return data.places;
  },
};
