export const COMMENT_CONTENT_MAX_LENGTH = 1000;
export const COMMENT_COUNTER_WARNING_THRESHOLD = 900;

export type CommentFieldErrorKey = 'contentRequired' | 'contentTooLong';

export function validateCommentContent(content: string): CommentFieldErrorKey | undefined {
  const trimmed = content.trim();
  if (trimmed.length === 0) return 'contentRequired';
  if (trimmed.length > COMMENT_CONTENT_MAX_LENGTH) return 'contentTooLong';
  return undefined;
}
