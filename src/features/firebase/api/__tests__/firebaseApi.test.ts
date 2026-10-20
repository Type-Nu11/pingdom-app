import { api } from '../../../../shared/api/apiClient';
import { updateFcmToken } from '../firebaseApi';

jest.mock('../../../../shared/api/apiClient', () => ({
  api: {
    post: jest.fn(),
  },
}));

const postMock = jest.mocked(api.post);

describe('firebaseApi', () => {
  it('registers the FCM token through the current endpoint', async () => {
    postMock.mockResolvedValueOnce({ data: undefined } as never);

    await updateFcmToken({ token: 'device-token' });

    expect(postMock).toHaveBeenCalledWith('/firebase/fcm-tokens', { token: 'device-token' });
  });
});
