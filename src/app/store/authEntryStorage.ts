import AsyncStorage from '@react-native-async-storage/async-storage';

// Device-level entry preference, independent of credentials and signup answers.
const AUTHENTICATED_ENTRY_KEY = '@pingdom/has-authenticated:v1';

export async function restoreAuthenticatedEntry(): Promise<boolean> {
  try {
    return await AsyncStorage.getItem(AUTHENTICATED_ENTRY_KEY) === 'true';
  } catch {
    return false;
  }
}

export async function rememberAuthenticatedEntry(): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTHENTICATED_ENTRY_KEY, 'true');
  } catch {
    // Entry persistence must not prevent login or credential cleanup.
  }
}
