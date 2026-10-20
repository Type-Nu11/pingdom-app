/** Existing attachments are retained by ID; only new local files are uploaded. */
export async function submitEditedAttachments<T>(photos: readonly { uri: string; serverId?: number }[], actions: {
  upload: (uri: string) => Promise<number>; discard: (id: number) => Promise<unknown>;
  save: (ids: number[]) => Promise<T>;
}): Promise<T> {
  const uploaded: number[] = [];
  try {
    const ids: number[] = [];
    for (const photo of photos) {
      if (photo.serverId !== undefined) { ids.push(photo.serverId); continue; }
      if (/^https?:/i.test(photo.uri)) throw new Error('Existing attachment ID is missing');
      const id = await actions.upload(photo.uri);
      if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid upload ID');
      uploaded.push(id); ids.push(id);
    }
    return await actions.save(ids);
  } catch (error) {
    // Endpoints only discard unattached uploads; never delete the original attachments.
    await Promise.allSettled(uploaded.map(id => Promise.resolve().then(() => actions.discard(id))));
    throw error;
  }
}
