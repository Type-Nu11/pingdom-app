export const INSTALLATION_ID_KEY = 'pingdom.installation-id.v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };

// An installation identifier, never an authentication secret or advertising ID.
export function createInstallationIdReader(storage: Storage, createId: () => string) {
  let pending: Promise<string> | null = null;
  return () => {
    if (!pending) {
      pending = (async () => {
        const stored = await storage.getItem(INSTALLATION_ID_KEY);
        if (stored && UUID.test(stored)) return stored;
        const id = createId();
        if (!UUID.test(id)) throw new Error('Invalid installation UUID');
        await storage.setItem(INSTALLATION_ID_KEY, id);
        return id;
      })().catch(error => { pending = null; throw error; });
    }
    return pending;
  };
}
