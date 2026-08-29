import * as ImagePicker from 'expo-image-picker';

import type { SelectedPhoto } from '../model/visitVerification';

export type MediaPickerResult =
  | { status: 'cancelled'; photos: [] }
  | { status: 'denied'; photos: [] }
  | { status: 'selected'; photos: SelectedPhoto[] };

export type VisitVerificationMediaPicker = {
  pickPhotos(remaining: number): Promise<MediaPickerResult>;
};

export const visitVerificationMediaPicker: VisitVerificationMediaPicker = {
  async pickPhotos(remaining) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { photos: [], status: 'denied' };

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      quality: 0.9,
      selectionLimit: remaining,
    });
    if (result.canceled) return { photos: [], status: 'cancelled' };

    return {
      photos: result.assets.slice(0, remaining).map((asset) => ({
        fileName: asset.fileName,
        height: asset.height,
        mimeType: asset.mimeType,
        uri: asset.uri,
        width: asset.width,
      })),
      status: 'selected',
    };
  },
};
