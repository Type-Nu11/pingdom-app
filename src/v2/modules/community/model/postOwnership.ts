/** Missing or malformed IDs must never imply author ownership. */
export function canManageCommunityPost(authorId: unknown, userId: unknown): boolean {
  return typeof authorId === 'number' && Number.isSafeInteger(authorId) && authorId > 0
    && typeof userId === 'number' && Number.isSafeInteger(userId) && userId > 0
    && authorId === userId;
}
