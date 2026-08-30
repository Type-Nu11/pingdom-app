import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { profileApi } from '../api/profileApi';
import { myReviewsQueryKeys, profileQueryKeys } from '../model/profileQueryKeys';
import type {
  ListMyReviewsParams,
  ProfileImageFile,
  ProfileImageUploadResponse,
  SaveProfileInput,
} from '../model/profile.types';

export class ProfileImagePermissionError extends Error {
  constructor() {
    super('MEDIA_LIBRARY_PERMISSION_DENIED');
    this.name = 'ProfileImagePermissionError';
  }
}

export async function pickProfileImage(): Promise<ProfileImageFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new ProfileImagePermissionError();

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const type = asset.mimeType ?? 'image/jpeg';
  const extension = type.split('/')[1] ?? 'jpg';
  return {
    name: asset.fileName ?? `profile-image.${extension}`,
    type,
    uri: asset.uri,
  };
}

export function useProfile() {
  const query = useQuery({
    queryFn: ({ signal }) => profileApi.getProfile(signal),
    queryKey: profileQueryKeys.me(),
  });

  return {
    error: query.error,
    isError: query.isError,
    isLoading: query.isLoading,
    profile: query.data ?? null,
    refetch: query.refetch,
  };
}

export function useMyReviews(params: ListMyReviewsParams = {}) {
  const query = useQuery({
    queryFn: ({ signal }) => profileApi.listMyReviews(params, signal),
    queryKey: myReviewsQueryKeys.list(params),
  });

  return {
    isError: query.isError,
    isLoading: query.isLoading,
    refetch: query.refetch,
    reviewCount: query.data?.totalElements ?? 0,
    reviews: query.data?.reviews ?? [],
  };
}

export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, SaveProfileInput>({
    mutationFn: async ({ password, username }) => {
      if (username) await profileApi.changeUsername(username);
      if (password) await profileApi.changePassword(password);
    },
    onSettled: async (_data, _error, variables) => {
      if (variables.username) {
        await queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
      }
    },
  });
}

export function useChangeProfileImage() {
  const queryClient = useQueryClient();

  return useMutation<ProfileImageUploadResponse, unknown, ProfileImageFile>({
    mutationFn: (file) => profileApi.changeProfileImage(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
    },
  });
}
