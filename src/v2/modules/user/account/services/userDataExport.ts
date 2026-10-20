import type { UserDataExport } from '../model/account.types';

export type ExportArtifact = {
  fileName: string;
  uri: string;
};

export type UserDataExportWriter = (
  json: string,
  fileName: string,
) => Promise<ExportArtifact>;

export type ExportPlatform = 'native' | 'web';
export type PlatformExportWriters = Record<ExportPlatform, UserDataExportWriter>;

export function createUserDataExportFileName(now: Date = new Date()): string {
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  return `pingdom-user-data-${timestamp}.json`;
}

export function serializeUserDataExport(data: UserDataExport): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}

export async function writeUserDataExport(
  data: UserDataExport,
  writer: UserDataExportWriter = writeUserDataExportForCurrentPlatform,
  now: Date = new Date(),
): Promise<ExportArtifact> {
  const fileName = createUserDataExportFileName(now);
  return writer(serializeUserDataExport(data), fileName);
}

export function writeUserDataExportForPlatform(
  platform: ExportPlatform,
  json: string,
  fileName: string,
  writers: PlatformExportWriters,
): Promise<ExportArtifact> {
  return writers[platform](json, fileName);
}

async function writeUserDataExportForCurrentPlatform(
  json: string,
  fileName: string,
): Promise<ExportArtifact> {
  const { Platform } = await import('react-native');
  const platform: ExportPlatform = Platform.OS === 'web' ? 'web' : 'native';

  return writeUserDataExportForPlatform(platform, json, fileName, {
    web: async (content, name) => {
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      const uri = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.download = name;
      anchor.href = uri;
      anchor.click();
      URL.revokeObjectURL(uri);
      return { fileName: name, uri };
    },
    native: async (content, name) => {
      const [{ File, Paths }, Sharing] = await Promise.all([
        import('expo-file-system'),
        import('expo-sharing'),
      ]);
      const file = new File(Paths.cache, name);
      file.write(content);

      if (!await Sharing.isAvailableAsync()) {
        throw new Error('File sharing is not available on this device.');
      }

      await Sharing.shareAsync(file.uri, {
        dialogTitle: 'PingDom data export',
        mimeType: 'application/json',
        UTI: 'public.json',
      });

      return { fileName: name, uri: file.uri };
    },
  });
}
