import { readFile } from 'node:fs/promises';

const document = JSON.parse(await readFile(
  new URL('../docs/api/community.openapi.json', import.meta.url),
  'utf8',
));
const failures = [];

const expected = [
  ['get', '/community/categories', 'listCategories', 200],
  ['get', '/community/categories/{categoryId}/posts', 'listPostsByCategory', 200],
  ['post', '/community/posts', 'createPost', 201],
  ['get', '/community/posts/{postId}', 'getPost', 200],
  ['get', '/community/posts/{postId}/comments', 'listComments', 200],
  ['post', '/community/posts/{postId}/comments', 'createComment', 201],
  ['get', '/community/posts/{postId}/likes', 'getLikeStatus', 200],
  ['post', '/community/posts/{postId}/likes', 'likePost', 200],
  ['delete', '/community/posts/{postId}/likes', 'unlikePost', 200],
  ['post', '/community/posts/{postId}/places/{placeId}/view', 'recordPlaceView', 200],
  ['post', '/community/posts/{postId}/reports', 'reportPost', 201],
  ['post', '/community/posts/{postId}/comments/{commentId}/reports', 'reportComment', 201],
];

if (!/^https?:\/\//.test(document['x-source']?.location ?? '')) failures.push('source URL missing');
if (!Number.isFinite(Date.parse(document['x-source']?.checkedAt ?? ''))) failures.push('checkedAt missing');
if (!/^[a-f0-9]{64}$/.test(document['x-source']?.sha256 ?? '')) failures.push('source hash missing');

for (const [method, path, operationId, success] of expected) {
  const operation = document.paths?.[path]?.[method];
  if (!operation) failures.push(`${method.toUpperCase()} ${path} missing`);
  if (operation?.operationId !== operationId) failures.push(`${method.toUpperCase()} ${path} operationId changed`);
  if (!operation?.responses?.[success]) failures.push(`${method.toUpperCase()} ${path} ${success} response missing`);
  if (!operation?.security?.some((entry) => 'bearerAuth' in entry)) failures.push(`${method.toUpperCase()} ${path} bearerAuth missing`);
}

for (const schema of [
  'CommunityCategoryItem',
  'CommunityCommentSummary',
  'CommunityPostCategoryListResponse',
  'CommunityPostCommentCreateRequest',
  'CommunityPostCommentCreateResponse',
  'CommunityPostCommentListResponse',
  'CommunityPostCreateRequest',
  'CommunityPostCreateResponse',
  'CommunityPostDetailResponse',
  'CommunityPostLikeResponse',
  'CommunityPostListResponse',
  'CommunityPostSummary',
  'CommunityReportCreateRequest',
  'CommunityReportCreateResponse',
  'ErrorResponse',
  'Place',
  'ValidationErrorResponse',
]) {
  if (!document.components?.schemas?.[schema]) failures.push(`${schema} missing`);
}

// Guards the fix for the array-item schema regression this contract exists to
// catch: categories/posts/comments must reference their own named item schema,
// never the unrelated nationwide-trending-place `Item` schema.
const listItemSchemas = [
  ['CommunityPostCategoryListResponse', 'categories', 'CommunityCategoryItem'],
  ['CommunityPostListResponse', 'posts', 'CommunityPostSummary'],
  ['CommunityPostCommentListResponse', 'comments', 'CommunityCommentSummary'],
];
for (const [schemaName, property, expectedItemSchema] of listItemSchemas) {
  const itemsRef = document.components?.schemas?.[schemaName]?.properties?.[property]?.items?.$ref;
  if (itemsRef !== `#/components/schemas/${expectedItemSchema}`) {
    failures.push(`${schemaName}.${property}[] must reference ${expectedItemSchema}, found ${itemsRef ?? 'nothing'}`);
  }
}

// Error statuses must resolve to ErrorResponse (optionally oneOf with
// ValidationErrorResponse for 400s), never the operation's own success DTO.
const errorStatusChecks = [
  ['/community/categories/{categoryId}/posts', 'get', 400],
  ['/community/posts/{postId}', 'get', 404],
  ['/community/posts', 'post', 400],
  ['/community/posts', 'post', 404],
  ['/community/posts/{postId}/comments', 'get', 404],
  ['/community/posts/{postId}/comments', 'post', 400],
  ['/community/posts/{postId}/comments', 'post', 404],
];
function schemaRefsAt(status) {
  const content = status?.content ?? {};
  const mediaType = content['application/json'] ?? content['*/*'];
  const schema = mediaType?.schema;
  if (!schema) return [];
  if (Array.isArray(schema.oneOf)) return schema.oneOf.map((entry) => entry.$ref);
  return [schema.$ref];
}
const allowedErrorRefs = new Set([
  '#/components/schemas/ErrorResponse',
  '#/components/schemas/ValidationErrorResponse',
]);
for (const [path, method, status] of errorStatusChecks) {
  const response = document.paths?.[path]?.[method]?.responses?.[status];
  const refs = schemaRefsAt(response);
  if (refs.length === 0 || refs.some((ref) => !allowedErrorRefs.has(ref))) {
    failures.push(`${method.toUpperCase()} ${path} ${status} must resolve to ErrorResponse/ValidationErrorResponse, found ${refs.join(', ') || 'nothing'}`);
  }
}

function visit(value, location = '#') {
  if (!value || typeof value !== 'object') return;
  if (typeof value.$ref === 'string') {
    const match = value.$ref.match(/^#\/components\/schemas\/(.+)$/);
    if (!match || !document.components?.schemas?.[match[1]]) failures.push(`unresolved ref at ${location}`);
  }
  Object.entries(value).forEach(([key, child]) => visit(child, `${location}/${key}`));
}
visit(document);

if (failures.length) {
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Community contract valid: category/post/comment item schemas and error responses are correctly typed.');
}
