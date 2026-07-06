import { api } from '../../../shared/api/apiClient';
import type { ApiCodeErrorResponse, ApiFieldErrorResponse } from '../../../types/api.types';

export type ProfileResponse = {
  birthYear: number;
  country: string;
  email: string;
  id: number;
  language: string;
  profileImageUrl: string | null;
  username: string;
};

export type ChangePasswordRequest = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type ProfileApiErrorCode = 'INVALID_CREDENTIALS' | 'INVALID_TOKEN' | 'USERNAME_ALREADY_EXISTS' | 'USER_NOT_FOUND';
export type ProfileApiErrorResponse = ApiCodeErrorResponse<ProfileApiErrorCode>;
export type ProfileValidationErrorResponse = ApiFieldErrorResponse;

export const profileApi = {
  changePassword: async (payload: ChangePasswordRequest): Promise<string> => {
    const { data } = await api.post<string>('/users/change-pw', payload);
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
};
