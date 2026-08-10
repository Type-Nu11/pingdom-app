import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const v2Root = path.join(projectRoot, 'src', 'v2');
const sourceExtensions = new Set(['.ts', '.tsx']);
const violations = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      visit(absolutePath);
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      checkFile(absolutePath);
    }
  }
}

function report(filePath, rule) {
  violations.push(`${path.relative(projectRoot, filePath)}: ${rule}`);
}

function checkFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const normalizedPath = filePath.split(path.sep).join('/');
  const isTestFile = normalizedPath.includes('/__tests__/');

  if (/\bStyleSheet\b/.test(source)) {
    report(filePath, 'StyleSheet is not allowed in V2');
  }

  if (/process\.env/.test(source) && !normalizedPath.endsWith('/shared/config/env.ts')) {
    report(filePath, 'read environment values through shared/config/env.ts');
  }

  if (/from ['"]axios['"]/.test(source) && !normalizedPath.includes('/shared/api/')) {
    report(filePath, 'axios may only be imported by the shared API layer');
  }

  const importPattern = /from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = importPattern.exec(source)) !== null) {
    const importPath = match[1];

    if (!isTestFile && normalizedPath.includes('/screens/') && importPath.includes('/api/')) {
      report(filePath, 'screens must access API modules through hooks');
    }

    if (normalizedPath.includes('/hooks/') && importPath.includes('/shared/api')) {
      report(filePath, 'feature hooks must access the shared client through feature API modules');
    }

    if (importPath.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(filePath), importPath);
      const relativeToV2 = path.relative(v2Root, resolvedPath);

      if (!isTestFile && (relativeToV2.startsWith('..') || path.isAbsolute(relativeToV2))) {
        report(filePath, `relative import escapes the V2 boundary: ${importPath}`);
      }
    }
  }
}

visit(v2Root);

if (violations.length > 0) {
  console.error(['V2 boundary check failed:', ...violations.map((item) => `- ${item}`)].join('\n'));
  process.exit(1);
}

console.log('V2 boundary check passed.');
