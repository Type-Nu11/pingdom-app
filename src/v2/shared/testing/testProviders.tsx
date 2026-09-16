// Test-only compatibility entrypoint; move callers with their domains in #360.
// Production imports of this path are rejected by check:v2.
export { createTestI18n, createTestQueryClient, createTestWrapper, renderWithProviders } from '../../app/testing/testProviders';
