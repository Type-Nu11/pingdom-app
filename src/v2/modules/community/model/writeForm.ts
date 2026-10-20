// `categoryId` values come from the server-driven category list (`GET
// /community/categories`), so this is the one place a literal is allowed to
// live: everything else derives the PLACE policy from this constant instead
// of comparing against a hardcoded string.
export const PLACE_CATEGORY_ID = 'PLACE';

export const WRITE_TITLE_MAX_LENGTH = 50;
export const WRITE_CONTENT_MAX_LENGTH = 5000;

export function isPlaceCategory(categoryId: string | null): boolean {
  return categoryId === PLACE_CATEGORY_ID;
}

export type WritePlaceTag = {
  address: string;
  category: string;
  id: number;
  name: string;
};

export type WriteFormFieldErrorKey =
  | 'categoryRequired'
  | 'contentRequired'
  | 'contentTooLong'
  | 'placeRequired'
  | 'titleRequired'
  | 'titleTooLong';

export type WriteFormFieldErrors = Partial<Record<'categoryId' | 'content' | 'placeIds' | 'title', WriteFormFieldErrorKey>>;

export type WriteFormInput = {
  categoryId: string | null;
  content: string;
  placeTags: WritePlaceTag[];
  title: string;
};

export function validateWriteForm(input: WriteFormInput): WriteFormFieldErrors {
  const errors: WriteFormFieldErrors = {};
  const title = input.title.trim();
  const content = input.content.trim();

  if (!input.categoryId) {
    errors.categoryId = 'categoryRequired';
  }
  if (title.length === 0) {
    errors.title = 'titleRequired';
  } else if (title.length > WRITE_TITLE_MAX_LENGTH) {
    errors.title = 'titleTooLong';
  }
  if (content.length === 0) {
    errors.content = 'contentRequired';
  } else if (content.length > WRITE_CONTENT_MAX_LENGTH) {
    errors.content = 'contentTooLong';
  }
  if (isPlaceCategory(input.categoryId) && input.placeTags.length === 0) {
    errors.placeIds = 'placeRequired';
  }

  return errors;
}

export function isWriteFormValid(input: WriteFormInput): boolean {
  return Object.keys(validateWriteForm(input)).length === 0;
}
