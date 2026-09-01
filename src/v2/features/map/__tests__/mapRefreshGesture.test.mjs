import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMapPullIndicatorDistance,
  isDownwardMapPull,
  shouldRefreshMapFromPullGesture,
} from '../utils/mapRefreshGesture.ts';

test('화면 상단의 명확한 아래 방향 드래그만 pull-to-refresh로 시작한다', () => {
  assert.equal(isDownwardMapPull({ dx: 2, dy: 9 }), true);
  assert.equal(isDownwardMapPull({ dx: 20, dy: 9 }), false);
  assert.equal(isDownwardMapPull({ dx: 0, dy: -9 }), false);
});

test('일정 거리 이상 아래로 당겼다가 놓을 때만 지도를 새로고침한다', () => {
  assert.equal(shouldRefreshMapFromPullGesture({ dx: 3, dy: 70 }), true);
  assert.equal(shouldRefreshMapFromPullGesture({ dx: 2, dy: 40 }), false);
  assert.equal(shouldRefreshMapFromPullGesture({ dx: 70, dy: 65 }), false);
  assert.equal(shouldRefreshMapFromPullGesture({ dx: 0, dy: -70 }), false);
});

test('pull-to-refresh 인디케이터는 저항을 적용하고 최대 이동 거리를 제한한다', () => {
  assert.equal(getMapPullIndicatorDistance(-10), 0);
  assert.equal(getMapPullIndicatorDistance(40), 22);
  assert.equal(getMapPullIndicatorDistance(1_000), 88);
});
