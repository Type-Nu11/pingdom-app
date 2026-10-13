/** Server-enforced cap on images attached to one post (`imageIds` maxItems). */
export const MAX_POST_PHOTOS = 10;

/**
 * Photos beyond the one shown as the list thumbnail (Figma `+N`). A missing,
 * non-finite or single-photo count yields 0 so the badge stays hidden.
 */
export function extraPhotoCount(imageCount: number | null | undefined): number {
  if (typeof imageCount !== 'number' || !Number.isFinite(imageCount)) return 0;
  return Math.max(0, Math.floor(imageCount) - 1);
}

/** Joins the parts the response actually carries with the Figma ` · ` separator. */
export function joinMeta(parts: ReadonlyArray<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' · ');
}
