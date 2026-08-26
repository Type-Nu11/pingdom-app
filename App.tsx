import V1App from './App.v1';
import { api } from './src/shared/api/apiClient';
import { configureApiTransport } from './src/v2/shared/api/apiClient';

// Application composition is the shared migration boundary: V2 feature hooks reuse the
// authenticated runtime transport while the current root navigator is migrated incrementally.
configureApiTransport(api);

export default V1App;
