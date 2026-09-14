import { Linking, Share } from 'react-native';

export type NativeShareContent = {
  message: string;
  title: string;
};

export type NativeShareResult = 'dismissed' | 'shared';

export type PlaceActionNative = {
  canOpenUrl: (url: string) => Promise<boolean>;
  isShareAvailable: () => boolean;
  openUrl: (url: string) => Promise<void>;
  share: (content: NativeShareContent) => Promise<NativeShareResult>;
};

export const nativePlaceActionBridge: PlaceActionNative = {
  canOpenUrl: (url) => Linking.canOpenURL(url),
  isShareAvailable: () => typeof Share.share === 'function',
  openUrl: (url) => Linking.openURL(url),
  share: async (content) => {
    const result = await Share.share(content);
    return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
  },
};
