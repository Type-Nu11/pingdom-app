import { useQuery } from '@tanstack/react-query';
import { placeApi } from '../api/placeApi';
import { Place } from '../model/place.types';

export const usePlaces = () => {
  const placesQuery = useQuery({
    queryKey: ['places'],
    queryFn: () => placeApi.getPlaces({ limit: 100 }),
  });

  return {
    isLoading: placesQuery.isLoading,
    places: (placesQuery.data ?? []).map<Place>((place) => ({
      address: place.address,
      id: String(place.id),
      lat: place.latitude,
      latitude: place.latitude,
      lng: place.longitude,
      longitude: place.longitude,
      name: place.name,
      registrant: place.registrant,
    })),
    refetch: placesQuery.refetch,
  };
};

export default usePlaces;
