export const LEGACY_FEATURE_PREFIX = 'src/features/';

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

export function parseNameStatus(output) {
  const tokens = output.split('\0');
  const entries = [];

  for (let index = 0; index < tokens.length - 1;) {
    const status = tokens[index++];

    if (!status) {
      continue;
    }

    const code = status[0];
    const isRenameOrCopy = code === 'R' || code === 'C';
    const oldPath = isRenameOrCopy ? tokens[index++] : undefined;
    const filePath = tokens[index++];

    if (!filePath) {
      throw new Error(`Malformed git name-status output near status: ${status}`);
    }

    entries.push({ status, oldPath, filePath });
  }

  return entries;
}

function isSourceFile(filePath) {
  const extensionStart = filePath.lastIndexOf('.');
  return extensionStart !== -1 && sourceExtensions.has(filePath.slice(extensionStart));
}

export function findLegacySourceChanges(entries) {
  return entries.filter(({ filePath }) =>
    filePath.startsWith(LEGACY_FEATURE_PREFIX) && isSourceFile(filePath),
  );
}
