import { useQuery } from '@tanstack/react-query';
import { userQueryKeys } from '../../../v2/features/travel-purposes/model/travelPurposeQueryKeys';
import { profileApi, type ListMyReviewsParams } from '../api/profileApi';

export const myReviewsQueryKeys = {
  all: [...userQueryKeys.me(), 'reviews'] as const,
  list: (params: ListMyReviewsParams) => [...myReviewsQueryKeys.all, params] as const,
};

export const useMyReviews = (params: ListMyReviewsParams = {}) => {
  const query = useQuery({
    queryFn: () => profileApi.listMyReviews(params),
    queryKey: myReviewsQueryKeys.list(params),
  });

  return {
    isError: query.isError,
    isLoading: query.isLoading,
    reviewCount: query.data?.totalElements ?? 0,
    reviews: query.data?.reviews ?? [],
  };
};

export default useMyReviews;
