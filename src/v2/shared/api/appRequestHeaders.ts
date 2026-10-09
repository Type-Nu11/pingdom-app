export type AppRequestMetadata = { appVersion: string; deviceId: string };
type MetadataProvider = () => Promise<AppRequestMetadata>;
let provider: MetadataProvider | undefined;

/** Application composition supplies persistent installation metadata for the app proxy. */
export function configureAppRequestMetadata(next: MetadataProvider): () => void {
  provider = next;
  return () => { if (provider === next) provider = undefined; };
}

export async function getAppRequestHeaders(): Promise<Record<string, string>> {
  if (!provider) return {};
  const metadata = await provider();
  return {
    'X-Timestamp': String(Math.floor(Date.now() / 1000)),
    'X-App-Version': metadata.appVersion,
    'X-Device-Id': metadata.deviceId,
  };
}
