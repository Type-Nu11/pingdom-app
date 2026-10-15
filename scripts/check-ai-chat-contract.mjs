import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const doc = JSON.parse(await readFile(new URL('../docs/api/ai-chat.openapi.json', import.meta.url)));
const chat = doc.paths['/ai/chat'].post;
assert.deepEqual(Object.keys(doc.paths), ['/ai/chat']);
assert.deepEqual(chat.security, [{ bearerAuth: [] }]);
assert.equal(chat.requestBody.content['application/json'].schema.$ref, '#/components/schemas/AiChatRequest');
assert.equal(chat.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/AiChatResponse');
assert.deepEqual(doc.components.schemas.AiChatRequest.required, ['messages']);
assert.equal(doc.components.schemas.AiChatRequest.properties.messages.maxItems, 50);
assert.equal(doc.components.schemas.AiChatRequest.properties.tools.maxItems, 20);
assert.deepEqual(doc.components.schemas.Message.properties.role.enum, ['user', 'assistant', 'tool']);
for (const status of ['400', '401', '403', '502']) assert.ok(chat.responses[status]);
function refs(value) {
  if (!value || typeof value !== 'object') return;
  if (value.$ref) assert.ok(doc.components.schemas[value.$ref.split('/').pop()], `Missing ${value.$ref}`);
  Object.values(value).forEach(refs);
}
refs(doc.paths); refs(doc.components.schemas);
assert.equal(doc['x-source'].location, 'https://www.typenull.xyz/v3/api-docs/app');
assert.match(doc['x-source'].sha256, /^[0-9a-f]{64}$/);
console.log('AI chat contract passed: tools, conversation, authentication and error schemas.');
