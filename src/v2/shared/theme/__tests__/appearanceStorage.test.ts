import {
  readAppearancePreference,
  writeAppearancePreference,
  type AppearanceStorage,
} from '../appearanceStorage';

const storage = (value: string | null): AppearanceStorage => ({
  getItem: jest.fn().mockResolvedValue(value),
  setItem: jest.fn().mockResolvedValue(undefined),
});

describe('appearance storage', () => {
  test('restores a valid preference', async () => {
    await expect(readAppearancePreference(storage('DARK'), 50)).resolves.toBe('DARK');
  });

  test.each(['unknown', 'dark', '{'])('recovers invalid value %s to SYSTEM', async (value) => {
    await expect(readAppearancePreference(storage(value), 50)).resolves.toBe('SYSTEM');
  });

  test('read failure recovers to SYSTEM', async () => {
    const failing = storage(null);
    jest.mocked(failing.getItem).mockRejectedValueOnce(new Error('read failed'));
    await expect(readAppearancePreference(failing, 50)).resolves.toBe('SYSTEM');
  });

  test('read timeout recovers to SYSTEM instead of blocking startup', async () => {
    jest.useFakeTimers();
    const hanging = storage(null);
    jest.mocked(hanging.getItem).mockReturnValueOnce(new Promise(() => undefined));
    const result = readAppearancePreference(hanging, 100);
    await jest.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toBe('SYSTEM');
    jest.useRealTimers();
  });

  test('writes the enum preference unchanged', async () => {
    const target = storage(null);
    await writeAppearancePreference(target, 'LIGHT');
    expect(target.setItem).toHaveBeenCalledWith(expect.any(String), 'LIGHT');
  });
});
