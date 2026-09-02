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

test('Android 지도는 장소와 사용자 위치 layer를 분리하고 동일 marker payload를 재적용하지 않는다', () => {
  const source = fs.readFileSync(path.resolve(
    'android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapView.kt',
  ), 'utf8');
  const updateUserLocation = source.match(
    /private fun updateUserLocationIfReady\(\)[\s\S]*?private fun addUserLocationLabelIfReady/,
  )?.[0] ?? '';

  assert.match(source, /USER_LOCATION_LAYER_ID/);
  assert.match(source, /getUserLocationLayer\(manager\)/);
  assert.match(source, /if \(nextMarkers == markers\) return/);
  assert.doesNotMatch(updateUserLocation, /updateMarkersIfReady\(\)/);
});

test('Android marker 한 번의 탭은 label callback만 JS에 전달한다', () => {
  const source = fs.readFileSync(path.resolve(
    'android/app/src/main/java/com/rmdka/pingdomapp/KakaoMapView.kt',
  ), 'utf8');
  const mapClickListener = source.match(
    /setOnMapClickListener[\s\S]*?setOnTerrainClickListener/,
  )?.[0] ?? '';

  assert.match(mapClickListener, /poi\?\.layerId == MARKER_LAYER_ID/);
  assert.match(mapClickListener, /return@setOnMapClickListener/);
  assert.doesNotMatch(mapClickListener, /emitMarkerPress\(poi\.poiId\)/);
});

test('iOS 지도도 동일 marker payload의 clear/add를 생략한다', () => {
  const source = fs.readFileSync(path.resolve('ios/KakaoMapView.swift'), 'utf8');

  assert.match(source, /private struct MapMarker: Equatable/);
  assert.match(source, /guard nextMarkers != parsedMarkersCache else \{ return \}/);
});
