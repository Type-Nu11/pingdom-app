import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppRequestMetadata } from '../api/appRequestHeaders';

const STORAGE_KEY = 'pingdom.installation-id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let installationId: Promise<string> | undefined;

// An anonymous installation identifier, never an authentication credential or hardware ID.
function newInstallationId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 3) | 8).toString(16);
  });
}

async function readInstallationId(): Promise<string> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored && UUID_PATTERN.test(stored)) return stored;
  const id = newInstallationId();
  await AsyncStorage.setItem(STORAGE_KEY, id);
  return id;
}

export async function getNativeAppRequestMetadata(appVersion: string): Promise<AppRequestMetadata> {
  installationId ??= readInstallationId().catch(error => { installationId = undefined; throw error; });
  return { appVersion, deviceId: await installationId };
}
