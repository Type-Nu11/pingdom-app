import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getOperatingStatusPresentation,
  getSupportLevelLabelKey,
  getTrustConfidenceLabelKey,
} from '../../../features/place-detail/model/placePresentation.ts';

test('UNKNOWN and future enum values use safe place UI fallbacks', () => {
  assert.equal(getOperatingStatusPresentation('UNKNOWN').labelKey, 'placeStatus.unknown');
  assert.equal(getOperatingStatusPresentation('FUTURE_STATUS').labelKey, 'placeStatus.unknown');
  assert.equal(getSupportLevelLabelKey('UNKNOWN'), 'placeSupport.unknown');
  assert.equal(getSupportLevelLabelKey('FUTURE_LEVEL'), 'placeSupport.unknown');
  assert.equal(getTrustConfidenceLabelKey('UNKNOWN'), 'placeTrust.confidence.unknown');
  assert.equal(getTrustConfidenceLabelKey('FUTURE_CONFIDENCE'), 'placeTrust.confidence.unknown');
});
