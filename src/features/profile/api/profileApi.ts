import { api } from '../../../shared/api/apiClient';
import type { ApiCodeErrorResponse, ApiFieldErrorResponse } from '../../../types/api.types';

export type UserRole = 'ADMIN' | 'MERCHANT_OWNER' | 'USER';

export type ProfileResponse = {
  birthYear: number;
  country: string;
  email: string;
  id: number;
  language: string;
  profileImageUrl: string | null;
  /** Absent on older server builds; treat missing as a plain user. */
  role?: UserRole;
  username: string;
};

export type ChangePasswordRequest = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type ProfileImageUploadResponse = {
  profileImageUrl: string;
};

export type ProfileImageFile = {
  name: string;
  type: string;
  uri: string;
};

export type MyPlaceReviewVisibilityStatus = 'DELETED' | 'HIDDEN' | 'VISIBLE';

export type MyPlaceReview = {
  content: string;
  createdAt: string;
  imageUrls: string[];
  placeId: number;
  recommendReason: string;
  reviewId: number;
  visibilityStatus: MyPlaceReviewVisibilityStatus;
};

export type MyPlaceReviewPage = {
  hasNext: boolean;
  limit: number;
  page: number;
  reviews: MyPlaceReview[];
  totalElements: number;
  totalPages: number;
};

export type ListMyReviewsParams = {
  limit?: number;
  page?: number;
};

export type ProfileApiErrorCode = 'INVALID_CREDENTIALS' | 'INVALID_TOKEN' | 'USERNAME_ALREADY_EXISTS' | 'USER_NOT_FOUND';
export type ProfileApiErrorResponse = ApiCodeErrorResponse<ProfileApiErrorCode>;
export type ProfileValidationErrorResponse = ApiFieldErrorResponse;

export const profileApi = {
  changePassword: async (payload: ChangePasswordRequest): Promise<string> => {
    const { data } = await api.post<string>('/users/change-pw', payload);
    return data;
  },
  changeProfileImage: async (file: ProfileImageFile): Promise<ProfileImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file as unknown as Blob);
    const { data } = await api.post<ProfileImageUploadResponse>('/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  changeUsername: async (newUsername: string): Promise<string> => {
    const { data } = await api.post<string>('/users/change-id', { newUsername });
    return data;
  },
  deleteProfile: async (): Promise<void> => {
    await api.delete('/users/me');
  },
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await api.get<ProfileResponse>('/users/me');
    return data;
  },
  listMyReviews: async (params: ListMyReviewsParams = {}): Promise<MyPlaceReviewPage> => {
    const { data } = await api.get<MyPlaceReviewPage>('/users/me/reviews', { params });
    return data;
  },
};
