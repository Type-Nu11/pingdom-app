import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { profileApi, type ProfileImageFile, type ProfileImageUploadResponse } from '../api/profileApi';
import { profileQueryKeys } from './useProfile';

export class ProfileImagePermissionError extends Error {
  constructor() {
    super('MEDIA_LIBRARY_PERMISSION_DENIED');
    this.name = 'ProfileImagePermissionError';
  }
}

function toProfileImageFile(asset: ImagePicker.ImagePickerAsset): ProfileImageFile {
  const type = asset.mimeType ?? 'image/jpeg';
  const extension = type.split('/')[1] ?? 'jpg';
  return {
    name: asset.fileName ?? `profile-image.${extension}`,
    type,
    uri: asset.uri,
  };
}

export async function pickProfileImage(): Promise<ProfileImageFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new ProfileImagePermissionError();
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ['images'],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return toProfileImageFile(result.assets[0]);
}

export const useChangeProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfileImageUploadResponse, unknown, ProfileImageFile>({
    mutationFn: (file) => profileApi.changeProfileImage(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.me() });
    },
  });
};

export default useChangeProfileImage;
