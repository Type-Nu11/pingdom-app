import { useMutation } from '@tanstack/react-query';
import {
  placeApi,
  type CoordinateTokenRequest,
  type CoordinateTokenResponse,
} from '../api/placeApi';

export const useCreatePlaceCoordinateToken = () => {
  const coordinateTokenMutation = useMutation<
    CoordinateTokenResponse,
    Error,
    CoordinateTokenRequest
  >({
    mutationFn: (payload) => placeApi.createPlaceCoordinates(payload),
  });

  return {
    createCoordinateToken: coordinateTokenMutation.mutateAsync,
    error: coordinateTokenMutation.error,
    isCreatingCoordinateToken: coordinateTokenMutation.isPending,
    isError: coordinateTokenMutation.isError,
  };
};

export default useCreatePlaceCoordinateToken;
