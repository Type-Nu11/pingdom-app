import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';

export const profileQueryKeys = {
  me: () => ['profile', 'me'] as const,
};

export const useProfile = () => {
  const profileQuery = useQuery({
    queryKey: profileQueryKeys.me(),
    queryFn: profileApi.getProfile,
  });

  return {
    error: profileQuery.error,
    isError: profileQuery.isError,
    isLoading: profileQuery.isLoading,
    profile: profileQuery.data ?? null,
    refetch: profileQuery.refetch,
  };
};

export default useProfile;
