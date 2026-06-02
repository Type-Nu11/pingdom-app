import { api } from '../../../shared/api/apiClient';

export type ProfileResponse = {
  birthYear: number;
  country: string;
  email: string;
  id: number;
  language: string;
  profileImageUrl: string | null;
  username: string;
};

export const profileApi = {
  deleteProfile: async (): Promise<void> => {
    await api.delete('/users/me');
  },
  getProfile: async (): Promise<ProfileResponse> => {
    const { data } = await api.get<ProfileResponse>('/users/me');
    return data;
  },
};
