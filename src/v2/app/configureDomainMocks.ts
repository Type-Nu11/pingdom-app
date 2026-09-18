import { accountMockHandlers, notificationMockHandlers } from '../modules/user/mock';
import { configureDomainMockHandlers } from '../shared/api/mock/registry';

configureDomainMockHandlers([
  ...accountMockHandlers,
  ...notificationMockHandlers,
]);
