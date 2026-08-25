import { api } from '../../../../shared/api/apiClient';
import { recordApi } from '../recordApi';

jest.mock('../../../../shared/api/apiClient', () => ({
  api: {
    delete: jest.fn(),
    post: jest.fn(),
  },
}));

const deleteMock = jest.mocked(api.delete);
const postMock = jest.mocked(api.post);

describe('recordApi command endpoints', () => {
  it('uses the current post command paths', async () => {
    jest.spyOn(console, 'log').mockImplementation();
    postMock
      .mockResolvedValueOnce({ data: 'updated' } as never)
      .mockResolvedValueOnce({ data: 'reported' } as never);
    deleteMock.mockResolvedValueOnce({ data: 'deleted' } as never);

    await recordApi.updateRecord(7, { title: 'updated' });
    await recordApi.deleteRecord(7);
    await recordApi.reportRecord(7, { reason: 'reason' });

    expect(postMock).toHaveBeenNthCalledWith(1, '/map/posts/7', expect.any(FormData), {
      headers: { 'Content-Type': undefined },
    });
    expect(deleteMock).toHaveBeenCalledWith('/map/posts/7');
    expect(postMock).toHaveBeenNthCalledWith(2, '/map/posts/7/report', { reason: 'reason' });
  });
});
