import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  ChangePasswordInput,
  ListMyReviewsParams,
  MyPlaceReviewPage,
  Profile,
  ProfileImageFile,
  ProfileImageUploadResponse,
} from '../model/profile.types';

const PROFILE_PATH = '/users/me';
const MY_REVIEWS_PATH = '/users/me/reviews';
const CHANGE_USERNAME_PATH = '/users/change-id';
const CHANGE_PASSWORD_PATH = '/users/change-pw';
const PROFILE_IMAGE_PATH = '/users/me/profile-image';

export function createProfileApi(client: ApiClient = apiClient) {
  return {
    changePassword: (body: ChangePasswordInput): Promise<string> =>
      client.post<string, ChangePasswordInput>(CHANGE_PASSWORD_PATH, body),
    changeProfileImage: (file: ProfileImageFile): Promise<ProfileImageUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file as unknown as Blob);
      return client.post<ProfileImageUploadResponse, FormData>(PROFILE_IMAGE_PATH, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    changeUsername: (newUsername: string): Promise<string> =>
      client.post<string, { newUsername: string }>(CHANGE_USERNAME_PATH, { newUsername }),
    getProfile: (signal?: AbortSignal): Promise<Profile> =>
      client.get<Profile>(PROFILE_PATH, { signal }),
    listMyReviews: (
      params: ListMyReviewsParams = {},
      signal?: AbortSignal,
    ): Promise<MyPlaceReviewPage> =>
      client.get<MyPlaceReviewPage>(MY_REVIEWS_PATH, { params, signal }),
  };
}

export const profileApi = createProfileApi();
