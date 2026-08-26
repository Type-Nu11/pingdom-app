/**
 * Contract extracted from the live server OpenAPI (`/v3/api-docs`) on 2026-08-25.
 * Keep optional request fields distinct from required nullable response fields.
 */
export type VisitorVerificationReportType =
  | 'PLACE_INFORMATION'
  | 'OPERATING_HOURS'
  | 'LOCATION'
  | 'CLOSED_PLACE'
  | 'WAIT_TIME'
  | 'LANGUAGE_SUPPORT'
  | 'COUPON_USAGE'
  | 'CROWD_LEVEL'
  | 'OTHER';

export type VisitorVerificationReportStatus = 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
export type VisitorVerificationCouponUsageStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
export type VisitorVerificationCrowdLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'FULL';

export type VisitorVerificationReportCreateRequest = {
  placeId: number;
  reportType: VisitorVerificationReportType;
  description: string;
  evidenceUrl?: string;
  waitTimeMinutes?: number;
  languageCode?: string;
  couponUsageStatus?: VisitorVerificationCouponUsageStatus;
  crowdLevel?: VisitorVerificationCrowdLevel;
};

export type VisitorVerificationReportCorrectionRequest = Omit<
  VisitorVerificationReportCreateRequest,
  'placeId' | 'reportType'
>;

export type MyVisitorVerificationReport = {
  id: number;
  placeId: number;
  reportType: VisitorVerificationReportType;
  description: string;
  evidenceUrl: string | null;
  waitTimeMinutes: number | null;
  languageCode: string | null;
  couponUsageStatus: VisitorVerificationCouponUsageStatus | null;
  crowdLevel: VisitorVerificationCrowdLevel | null;
  status: VisitorVerificationReportStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  updatedAt: string;
};

export type MyVisitorVerificationReportCorrection = {
  id: number;
  reportId: number;
  placeId: number;
  reportType: VisitorVerificationReportType;
  description: string;
  evidenceUrl: string | null;
  waitTimeMinutes: number | null;
  languageCode: string | null;
  couponUsageStatus: VisitorVerificationCouponUsageStatus | null;
  crowdLevel: VisitorVerificationCrowdLevel | null;
  reportStatus: VisitorVerificationReportStatus;
  status: VisitorVerificationReportStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  updatedAt: string;
};

export type VisitorVerificationReportListParams = {
  page?: number;
  limit?: number;
};

export type MyVisitorVerificationReportPage = {
  reports: MyVisitorVerificationReport[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type MyVisitorVerificationReportCorrectionPage = {
  corrections: MyVisitorVerificationReportCorrection[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};
