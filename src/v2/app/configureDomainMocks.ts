import { accountMockHandlers, notificationMockHandlers, scoutProfileMockHandlers } from '../modules/user/mock';
import { configureDomainMockHandlers } from '../shared/api/mock/registry';

configureDomainMockHandlers([
  ...accountMockHandlers,
  ...notificationMockHandlers,
  ...scoutProfileMockHandlers,
]);
