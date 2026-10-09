import AsyncStorage from '@react-native-async-storage/async-storage';
import { createInstallationIdReader } from '../api/installationId';

function createId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // Random identifier only; this value is not used to derive signing keys.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
    const nibble = Math.floor(Math.random() * 16);
    return (character === 'x' ? nibble : (nibble & 3) | 8).toString(16);
  });
}

export const getInstallationId = createInstallationIdReader(AsyncStorage, createId);
