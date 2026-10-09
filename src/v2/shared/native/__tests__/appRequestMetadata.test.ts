import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNativeAppRequestMetadata } from '../appRequestMetadata';

test('concurrent requests share a persisted anonymous installation UUID', async () => {
  const [first, second] = await Promise.all([getNativeAppRequestMetadata('1.0.0'), getNativeAppRequestMetadata('1.0.1')]);
  expect(first.deviceId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  expect(second.deviceId).toBe(first.deviceId);
  expect(second.appVersion).toBe('1.0.1');
  expect(await AsyncStorage.getItem('pingdom.installation-id')).toBe(first.deviceId);
  expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
});
