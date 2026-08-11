import { readFile } from 'node:fs/promises';

const path = new URL('../docs/api/account.openapi.json', import.meta.url);
const document = JSON.parse(await readFile(path, 'utf8'));
const expectedOperations = new Map([
  ['POST /auth/password-reset/request', 'requestPasswordReset'],
  ['POST /auth/password-reset/confirm', 'confirmPasswordReset'],
  ['POST /auth/logout', 'logout'],
  ['POST /auth/email/resend', 'resendVerificationEmail'],
  ['POST /users/me/oauth-accounts/google/link', 'startGoogleLink'],
  ['DELETE /users/me/oauth-accounts/google', 'unlinkGoogle'],
  ['GET /users/me/export', 'exportMyData'],
]);
const excludedPaths = ['/auth/admin/login', '/auth/oauth2/success'];
const actualOperations = new Map();

for (const [route, pathItem] of Object.entries(document.paths ?? {})) {
  for (const method of ['delete', 'get', 'patch', 'post', 'put']) {
    const operation = pathItem[method];
    if (operation) actualOperations.set(`${method.toUpperCase()} ${route}`, operation.operationId);
  }
}

const failures = [];
for (const [operation, operationId] of expectedOperations) {
  if (actualOperations.get(operation) !== operationId) {
    failures.push(`Missing or changed operation: ${operation} (${operationId})`);
  }
}
for (const operation of actualOperations.keys()) {
  if (!expectedOperations.has(operation)) failures.push(`Unexpected operation: ${operation}`);
}
for (const route of excludedPaths) {
  if (document.paths?.[route]) failures.push(`Excluded path must not be present: ${route}`);
}

if (failures.length) {
  console.error(['Account API contract validation failed:', ...failures.map((item) => `- ${item}`)].join('\n'));
  process.exitCode = 1;
} else {
  console.log('Account API contract is valid: 7 operations and excluded paths are absent.');
}
