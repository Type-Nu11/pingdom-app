import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
const url = 'https://www.typenull.xyz/v3/api-docs';
const source = process.argv[2] ?? url;
const raw = source.startsWith('https://')
  ? await fetch(source).then(r => { if (!r.ok) throw new Error(`OpenAPI HTTP ${r.status}`); return r.text(); })
  : await readFile(source, 'utf8');
const doc = JSON.parse(raw);
const paths = {};
for (const [path, method] of [
  ['/voice-ai/sessions', 'post'],
  ['/voice-ai/sessions/{sessionId}/refresh', 'post'],
  ['/voice-ai/sessions/{sessionId}/messages', 'post'],
  ['/voice-ai/sessions/{sessionId}', 'delete'],
]) {
  if (!doc.paths?.[path]?.[method]) throw new Error(`Missing ${method} ${path}`);
  paths[path] = { [method]: doc.paths[path][method] };
}
const schemas = {};
function refs(value) {
  if (!value || typeof value !== 'object') return;
  if (value.$ref?.startsWith('#/components/schemas/')) {
    const name = value.$ref.split('/').pop();
    if (!schemas[name]) {
      if (!doc.components.schemas[name]) throw new Error(`Missing schema ${name}`);
      schemas[name] = doc.components.schemas[name]; refs(schemas[name]);
    }
  }
  Object.values(value).forEach(refs);
}
refs(paths);
await writeFile('docs/api/voice-ai.openapi.json', JSON.stringify({
  openapi: doc.openapi, info: doc.info,
  'x-source': { location: url, sha256: createHash('sha256').update(raw).digest('hex') },
  paths, components: { schemas, securitySchemes: doc.components.securitySchemes },
}, null, 2) + '\n');
