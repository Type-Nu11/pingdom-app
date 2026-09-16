import assert from 'node:assert/strict';
import test from 'node:test';

import { assertApiModeAllowed, resolvePlaceListEnabled, resolveVoiceAssistantEnabled } from '../../config/env.ts';
import { getPlaceListRuntimeState } from '../../../features/place-exploration/model/placeListRuntime.ts';

test('real API environments enable place requests by default and explicit flags win', () => {
  assert.equal(resolvePlaceListEnabled({
    apiMode: 'real', appEnvironment: 'development',
  }), true);
  assert.equal(resolvePlaceListEnabled({
    apiMode: 'mock', appEnvironment: 'development',
  }), false);
  assert.equal(resolvePlaceListEnabled({
    apiMode: 'real', appEnvironment: 'staging',
  }), true);
  assert.equal(resolvePlaceListEnabled({
    apiMode: 'real', appEnvironment: 'production',
  }), true);
  assert.equal(resolvePlaceListEnabled({
    apiMode: 'mock', appEnvironment: 'development', value: 'true',
  }), true);
  assert.equal(resolvePlaceListEnabled({
    apiMode: 'real', appEnvironment: 'development', value: 'false',
  }), false);
});

test('mock transport is rejected in staging and production', () => {
  assert.doesNotThrow(() => assertApiModeAllowed({
    apiMode: 'mock', appEnvironment: 'development',
  }));
  for (const appEnvironment of ['staging', 'production']) {
    assert.throws(
      () => assertApiModeAllowed({ apiMode: 'mock', appEnvironment }),
      /mock is allowed only.*development/,
    );
  }
});

test('disabled, loading, error, empty, and server-backed ready states stay distinct', () => {
  assert.equal(getPlaceListRuntimeState({
    enabled: false, isError: false, isLoading: false, placeCount: 3,
  }), 'disabled');
  assert.equal(getPlaceListRuntimeState({
    enabled: true, isError: false, isLoading: true, placeCount: 0,
  }), 'loading');
  assert.equal(getPlaceListRuntimeState({
    enabled: true, isError: true, isLoading: false, placeCount: 0,
  }), 'error');
  assert.equal(getPlaceListRuntimeState({
    enabled: true, isError: false, isLoading: false, placeCount: 0,
  }), 'empty');
  assert.equal(getPlaceListRuntimeState({
    enabled: true, isError: false, isLoading: false, placeCount: 1,
  }), 'ready');
});


test('assistant input preview requires explicit opt-in, including production', () => {
  assert.equal(resolveVoiceAssistantEnabled(), false);
  assert.equal(resolveVoiceAssistantEnabled('false'), false);
  assert.equal(resolveVoiceAssistantEnabled('true'), true);
  assert.throws(() => resolveVoiceAssistantEnabled('1'));
  assert.throws(() => resolveVoiceAssistantEnabled('yes'));
});
