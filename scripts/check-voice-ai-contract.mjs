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
// Do not turn the upstream opaque response into an invented wire DTO.
assert.deepEqual(doc.components.schemas.JsonNode, { type: 'object' });
console.log('Voice AI snapshot contract passed (ProviderEnvelope wire schema remains server #1645).');
