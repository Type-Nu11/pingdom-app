import { userQueryKeys } from '../../travel-purposes/model/travelPurposeQueryKeys';
import type { ListMyReviewsParams } from './profile.types';

export const profileQueryKeys = {
  me: userQueryKeys.me,
};

export const myReviewsQueryKeys = {
  all: [...userQueryKeys.me(), 'reviews'] as const,
  list: (params: ListMyReviewsParams) => [...myReviewsQueryKeys.all, params] as const,
};
