import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const sourceRoot = path.resolve('src');
const registrationPattern = /requireNativeComponent(?:<[^;]+?>)?\(['"]KakaoMapView['"]\)/gs;

function collectSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(entryPath);
    return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });
}

test('KakaoMapView 네이티브 호스트 컴포넌트는 앱 번들에서 한 번만 등록한다', () => {
  const registrations = collectSourceFiles(sourceRoot).flatMap((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    return [...source.matchAll(registrationPattern)].map(() => path.relative(sourceRoot, filePath));
  });

  assert.deepEqual(registrations, ['v2/shared/native/KakaoMapNativeView.tsx']);
});
