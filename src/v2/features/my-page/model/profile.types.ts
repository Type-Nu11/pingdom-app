export type UserRole = 'ADMIN' | 'MERCHANT_OWNER' | 'USER';

export type Profile = {
  birthYear: number;
  country: string;
  email: string;
  id: number;
  language: string;
  profileImageUrl: string | null;
  role?: UserRole;
  username: string;
};

export type ChangePasswordInput = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type SaveProfileInput = {
  password?: ChangePasswordInput;
  username?: string;
};

export type ProfileImageFile = {
  name: string;
  type: string;
  uri: string;
};

export type ProfileImageUploadResponse = {
  profileImageUrl: string;
};

export type MyPlaceReviewVisibilityStatus = 'DELETED' | 'HIDDEN' | 'VISIBLE';

export type MyPlaceReview = {
  content: string;
  createdAt: string;
  imageUrls: string[];
  placeId: number;
  recommendReason: string;
  reviewId: number;
  visibilityStatus: MyPlaceReviewVisibilityStatus;
};

export type MyPlaceReviewPage = {
  hasNext: boolean;
  limit: number;
  page: number;
  reviews: MyPlaceReview[];
  totalElements: number;
  totalPages: number;
};

export type ListMyReviewsParams = {
  limit?: number;
  page?: number;
};
