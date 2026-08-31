import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { profileApi } from '../api/profileApi';
import { myReviewsQueryKeys, profileQueryKeys } from '../model/profileQueryKeys';
import type {
  ListMyReviewsParams,
  ProfileImageFile,
  ProfileImageUploadResponse,
  SaveProfileInput,
  SaveProfileResult,
} from '../model/profile.types';

export class ProfileImagePermissionError extends Error {
  constructor() {
    super('MEDIA_LIBRARY_PERMISSION_DENIED');
    this.name = 'ProfileImagePermissionError';
  }
}

export type SaveProfileOperation = 'password' | 'username';

export class SaveProfileError extends Error {
  readonly operation: SaveProfileOperation;
  readonly originalError: unknown;
  readonly usernameChanged: boolean;

  constructor(
    operation: SaveProfileOperation,
    originalError: unknown,
    { usernameChanged = false }: { usernameChanged?: boolean } = {},
  ) {
    super(originalError instanceof Error ? originalError.message : 'PROFILE_SAVE_FAILED');
    this.name = 'SaveProfileError';
    this.operation = operation;
    this.originalError = originalError;
    this.usernameChanged = usernameChanged;
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
  const normalizedMimeType = asset.mimeType?.toLowerCase() === 'image/jpg'
    ? 'image/jpeg'
    : asset.mimeType?.toLowerCase();
  const filenameExtension = asset.fileName?.split('.').pop()?.toLowerCase();
  const type = normalizedMimeType
    ?? (filenameExtension === 'png' ? 'image/png' : undefined)
    ?? (filenameExtension === 'jpg' || filenameExtension === 'jpeg' ? 'image/jpeg' : undefined);

  if (type !== 'image/jpeg' && type !== 'image/png') {
    throw new Error('PROFILE_IMAGE_TYPE_UNSUPPORTED');
  }

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

  return useMutation<SaveProfileResult, SaveProfileError, SaveProfileInput>({
    mutationFn: async ({ password, username }) => {
      let usernameChanged = false;

      if (username) {
        try {
          await profileApi.changeUsername(username);
          usernameChanged = true;
        } catch (error) {
          throw new SaveProfileError('username', error);
        }
      }

      if (password) {
        try {
          await profileApi.changePassword(password);
        } catch (error) {
          throw new SaveProfileError('password', error, { usernameChanged });
        }
      }

      return { passwordChanged: Boolean(password), usernameChanged };
    },
    onSettled: async (data, error) => {
      if (data?.usernameChanged || error?.usernameChanged) {
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
