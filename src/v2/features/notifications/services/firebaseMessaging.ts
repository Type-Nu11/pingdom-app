import { NativeModules } from 'react-native';

declare const require: (moduleName: string) => any;

export type FirebaseRemoteMessage = {
  data?: Record<string, unknown>;
  messageId?: string;
  notification?: {
    body?: string;
    title?: string;
  };
};

type FirebaseMessagingModule = {
  AuthorizationStatus: {
    AUTHORIZED: number;
    PROVISIONAL: number;
  };
  getInitialNotification: (messaging: unknown) => Promise<FirebaseRemoteMessage | null>;
  getToken: (messaging: unknown) => Promise<string>;
  onMessage: (
    messaging: unknown,
    listener: (message: FirebaseRemoteMessage) => void,
  ) => () => void;
  onNotificationOpenedApp: (
    messaging: unknown,
    listener: (message: FirebaseRemoteMessage) => void,
  ) => () => void;
  onTokenRefresh: (messaging: unknown, listener: (token: string) => void) => () => void;
  registerDeviceForRemoteMessages: (messaging: unknown) => Promise<void>;
  requestPermission: (messaging: unknown) => Promise<number>;
  setBackgroundMessageHandler: (
    messaging: unknown,
    handler: (message: FirebaseRemoteMessage) => Promise<void>,
  ) => void;
};

export type FirebaseMessagingRuntime = FirebaseMessagingModule & {
  messaging: unknown;
};

let cachedRuntime: FirebaseMessagingRuntime | null | undefined;

export function getFirebaseMessagingRuntime(): FirebaseMessagingRuntime | null {
  if (cachedRuntime !== undefined) {
    return cachedRuntime;
  }

  if (!NativeModules.RNFBAppModule || !NativeModules.RNFBMessagingModule) {
    cachedRuntime = null;
    return cachedRuntime;
  }

  try {
    const { getApp } = require('@react-native-firebase/app');
    const messagingModule = require('@react-native-firebase/messaging') as FirebaseMessagingModule & {
      getMessaging: (app: unknown) => unknown;
    };

    cachedRuntime = {
      ...messagingModule,
      messaging: messagingModule.getMessaging(getApp()),
    };
  } catch (error) {
    console.warn('[V2 FCM] Native messaging is unavailable:', error);
    cachedRuntime = null;
  }

  return cachedRuntime;
}
