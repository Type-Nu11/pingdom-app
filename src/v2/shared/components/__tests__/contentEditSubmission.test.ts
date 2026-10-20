import { submitEditedAttachments } from '../contentEditSubmission';

test('keeps original IDs in order and uploads only new local attachments', async () => {
  const upload = jest.fn().mockResolvedValue(90);
  const discard = jest.fn();
  const save = jest.fn().mockResolvedValue('saved');
  await expect(submitEditedAttachments([{ uri: 'https://cdn/old.jpg', serverId: 7 },
    { uri: 'file:///new.jpg' }, { uri: 'https://cdn/other.jpg', serverId: 3 }], { upload, discard, save })).resolves.toBe('saved');
  expect(upload).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith([7, 90, 3]);
  expect(discard).not.toHaveBeenCalled();
});

test('failure discards only newly uploaded attachments, never the originals', async () => {
  const discard = jest.fn().mockResolvedValue(undefined);
  const error = new Error('server rejected');
  await expect(submitEditedAttachments([{ uri: 'https://cdn/old.jpg', serverId: 7 }, { uri: 'file:///new.jpg' }], {
    upload: jest.fn().mockResolvedValue(90), discard, save: jest.fn().mockRejectedValue(error),
  })).rejects.toBe(error);
  expect(discard.mock.calls).toEqual([[90]]);
});

test('does not silently reupload legacy remote photos with missing IDs', async () => {
  const upload = jest.fn(); const save = jest.fn();
  await expect(submitEditedAttachments([{ uri: 'https://cdn/old.jpg' }], { upload, discard: jest.fn(), save })).rejects.toThrow('ID is missing');
  expect(upload).not.toHaveBeenCalled(); expect(save).not.toHaveBeenCalled();
});
