import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const doc = JSON.parse(await readFile(new URL('../docs/api/voice-ai.openapi.json', import.meta.url)));
for (const [path, method, success] of [
  ['/voice-ai/sessions', 'post', '201'],
  ['/voice-ai/sessions/{sessionId}/refresh', 'post', '200'],
  ['/voice-ai/sessions/{sessionId}/messages', 'post', '200'],
  ['/voice-ai/sessions/{sessionId}', 'delete', '200'],
]) {
  const operation = doc.paths[path][method];
  assert.deepEqual(operation.security, [{ bearerAuth: [] }]);
  assert.ok(operation.responses[success]);
}
assert.deepEqual(doc.components.schemas.VoiceAiMessageRequest.required, ['requestId', 'text']);
assert.equal(doc.components.schemas.VoiceAiMessageRequest.properties.text.maxLength, 2000);
assert.equal(doc.components.securitySchemes.bearerAuth.scheme, 'bearer');
assert.equal(doc['x-source'].location, 'https://www.typenull.xyz/v3/api-docs');
assert.match(doc['x-source'].sha256, /^[0-9a-f]{64}$/);
assert.deepEqual(doc.components.schemas.VoiceAiSessionResponse.required, ['expiresAt', 'sessionId']);
const messages = doc.paths['/voice-ai/sessions/{sessionId}/messages'].post;
assert.equal(messages.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/ProviderEnvelopeV1');
assert.equal(doc.components.schemas.ProviderEnvelopeV1.oneOf.length, 8);
for (const status of ['400', '401', '403', '404', '409', '410', '429', '502', '503']) {
  assert.ok(messages.responses[status].content['application/json'].schema);
}
console.log('Voice AI snapshot contract passed: envelope, expiry, authentication and error contracts.');
