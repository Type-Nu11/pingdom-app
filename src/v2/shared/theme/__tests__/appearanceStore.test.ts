import type { AppearanceStorage } from '../appearanceStorage';
import { createAppearanceStore } from '../appearanceStore';

const deferred = () => {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, reject, resolve };
};

const createStorage = (stored: string | null = null): AppearanceStorage => ({
  getItem: jest.fn().mockResolvedValue(stored),
  setItem: jest.fn().mockResolvedValue(undefined),
});

describe('appearance store', () => {
  test('hydrates a valid stored preference and marks completion', async () => {
    const store = createAppearanceStore(createStorage('DARK'));
    expect(store.getState()).toMatchObject({ preference: 'SYSTEM', hydrationStatus: 'idle' });
    await store.getState().hydrate();
    expect(store.getState()).toMatchObject({ preference: 'DARK', hydrationStatus: 'hydrated' });
  });

  test('read failure still releases the hydration gate with SYSTEM', async () => {
    const target = createStorage();
    jest.mocked(target.getItem).mockRejectedValueOnce(new Error('read failed'));
    const store = createAppearanceStore(target);
    await store.getState().hydrate();
    expect(store.getState()).toMatchObject({ preference: 'SYSTEM', hydrationStatus: 'hydrated' });
  });

  test('selection changes memory before persistence completes', () => {
    const target = createStorage();
    jest.mocked(target.setItem).mockReturnValueOnce(new Promise(() => undefined));
    const store = createAppearanceStore(target);
    void store.getState().setPreference('DARK');
    expect(store.getState().preference).toBe('DARK');
  });

  test('write failure keeps the visible choice and resolves safely', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const target = createStorage();
    jest.mocked(target.setItem).mockRejectedValueOnce(new Error('write failed'));
    const store = createAppearanceStore(target);
    await expect(store.getState().setPreference('LIGHT')).resolves.toBeUndefined();
    expect(store.getState().preference).toBe('LIGHT');
    expect(warn).toHaveBeenCalledWith('[Appearance] Failed to persist preference.');
    warn.mockRestore();
  });

  test('rapid selections persist the latest value after an older slow write', async () => {
    const first = deferred();
    const target = createStorage();
    jest.mocked(target.setItem)
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(undefined);
    const store = createAppearanceStore(target);

    const darkWrite = store.getState().setPreference('DARK');
    const lightWrite = store.getState().setPreference('LIGHT');
    expect(store.getState().preference).toBe('LIGHT');

    first.resolve();
    await Promise.all([darkWrite, lightWrite]);
    expect(target.setItem).toHaveBeenNthCalledWith(1, expect.any(String), 'DARK');
    expect(target.setItem).toHaveBeenNthCalledWith(2, expect.any(String), 'LIGHT');
  });
});
