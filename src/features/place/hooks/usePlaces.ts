import { Place } from '../model/place.types';

export const usePlaces = () => {
  return {
    places: [] as Place[],
  };
};

export default usePlaces;
