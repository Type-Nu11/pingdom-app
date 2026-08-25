import type { Coordinate } from '../../map/model/map.types';

export const PLACE_REPORT_CATEGORIES = [
  { id: 'restaurant' },
  { id: 'music' },
  { id: 'popup' },
  { id: 'beauty' },
  { id: 'exhibition' },
  { id: 'cafe' },
  { id: 'fashion' },
  { id: 'heritage' },
  { id: 'other' },
] as const;

export const PLACE_REPORT_FEATURES = [
  { id: 'kind' },
  { id: 'easyToFind' },
  { id: 'delicious' },
  { id: 'multilingual' },
  { id: 'parking' },
  { id: 'photoSpot' },
  { id: 'clean' },
] as const;

export type PlaceReportCategoryId = typeof PLACE_REPORT_CATEGORIES[number]['id'];
export type PlaceReportFeatureId = typeof PLACE_REPORT_FEATURES[number]['id'];
export type PlaceReportStep = 1 | 2 | 3 | 'complete';

export type PlaceReportDraft = {
  caption: string;
  category: PlaceReportCategoryId | null;
  coordinate: Coordinate | null;
  detailAddress: string;
  features: PlaceReportFeatureId[];
  locationQuery: string;
  closingTime: string;
  openingTime: string;
  photoUri: string | null;
  placeName: string;
};

export type PlaceReportValidationErrors = Partial<Record<
  'category' | 'detailAddress' | 'location' | 'operationHours' | 'photo' | 'placeName',
  true
>>;

export const initialPlaceReportDraft: PlaceReportDraft = {
  caption: '',
  category: null,
  coordinate: null,
  detailAddress: '',
  features: [],
  locationQuery: '',
  closingTime: '',
  openingTime: '',
  photoUri: null,
  placeName: '',
};

export function validatePlaceReportStep(
  draft: PlaceReportDraft,
  step: 1 | 2 | 3,
): PlaceReportValidationErrors {
  if (step === 1) {
    return {
      ...(!draft.coordinate ? { location: true } : {}),
      ...(!draft.detailAddress.trim() ? { detailAddress: true } : {}),
    };
  }

  if (step === 2) {
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/;
    return {
      ...(!draft.placeName.trim() ? { placeName: true } : {}),
      ...(!draft.category ? { category: true } : {}),
      ...(!validTime.test(draft.openingTime) || !validTime.test(draft.closingTime)
        ? { operationHours: true }
        : {}),
    };
  }

  return !draft.photoUri ? { photo: true } : {};
}

export function hasValidationErrors(errors: PlaceReportValidationErrors) {
  return Object.values(errors).some(Boolean);
}
