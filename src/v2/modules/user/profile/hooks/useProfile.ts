import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { profileApi } from '../api/profileApi';
import { markProfileImageReplaced } from '../model/profileImageUri';
import { myReviewsQueryKeys, profileQueryKeys } from '../model/profileQueryKeys';
import type {
  ListMyReviewsParams,
  Profile,
  ProfileImageFile,
  ProfileImageUploadResponse,
  SaveProfileInput,
  SaveProfileResult,
} from '../model/profile.types';

export type ProfileImageSource = 'camera' | 'library';

export class ProfileImagePermissionError extends Error {
  readonly canAskAgain: boolean;
  readonly source: ProfileImageSource;

  constructor(source: ProfileImageSource = 'library', canAskAgain = true) {
    super(source === 'camera' ? 'CAMERA_PERMISSION_DENIED' : 'MEDIA_LIBRARY_PERMISSION_DENIED');
    this.name = 'ProfileImagePermissionError';
    this.canAskAgain = canAskAgain;
    this.source = source;
  }
}

export class ProfileImageTypeError extends Error {
  constructor() {
    super('PROFILE_IMAGE_TYPE_UNSUPPORTED');
    this.name = 'ProfileImageTypeError';
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

export async function pickProfileImage(
  source: ProfileImageSource = 'library',
): Promise<ProfileImageFile | null> {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new ProfileImagePermissionError(source, permission.canAskAgain ?? true);
  }

  const options: ImagePicker.ImagePickerOptions = {
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 0.8,
  };
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);

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
    throw new ProfileImageTypeError();
  }

  const extension = type.split('/')[1] ?? 'jpg';
  return {
    name: asset.fileName ?? `profile-image.${extension}`,
    type,
    uri: asset.uri,
  };
}

export function useProfile({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useQuery({
    enabled,
    queryFn: ({ signal }) => profileApi.getProfile(signal),
    queryKey: profileQueryKeys.me(),
  });

  return {
    error: query.error,
    isFetching: query.isFetching,
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
    serverReviewCount: query.data?.totalElements,
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

  return useMutation<
    ProfileImageUploadResponse,
    unknown,
    { file: ProfileImageFile; signal?: AbortSignal }
  >({
    mutationFn: ({ file, signal }) => profileApi.changeProfileImage(file, signal),
    onSuccess: async ({ profileImageUrl }) => {
      const key = profileQueryKeys.me();
      const previous = queryClient.getQueryData<Profile>(key);
      if (previous) {
        markProfileImageReplaced(previous.id, previous.profileImageUrl, profileImageUrl);
        queryClient.setQueryData<Profile>(key, { ...previous, profileImageUrl });
      }
      await queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
