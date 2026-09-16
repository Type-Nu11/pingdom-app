import { configureI18nResources, initializeI18n as initializeSharedI18n } from '../../shared/i18n';
import { resources } from './resources';

// Register before hydration (including language changes initiated by other callers).
configureI18nResources(resources);
export { i18n } from '../../shared/i18n';
export function initializeI18n(profileLanguage?: unknown): Promise<void> {
  return initializeSharedI18n(profileLanguage);
}
