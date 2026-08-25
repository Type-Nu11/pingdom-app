import type {
  MyVisitorVerificationReport,
  MyVisitorVerificationReportCorrection,
  MyVisitorVerificationReportCorrectionPage,
  MyVisitorVerificationReportPage,
} from '../../../generated/visitorVerificationReports';

export const visitorVerificationReportFixture = {
  id: 172,
  placeId: 17,
  reportType: 'WAIT_TIME',
  description: '주말 오후 대기 시간은 약 30분입니다.',
  evidenceUrl: 'https://example.com/evidence/wait-time.jpg',
  waitTimeMinutes: 30,
  languageCode: null,
  couponUsageStatus: null,
  crowdLevel: null,
  status: 'ACCEPTED',
  rejectionReason: null,
  createdAt: '2026-08-20T05:30:00Z',
  reviewedAt: '2026-08-21T02:10:00Z',
  updatedAt: '2026-08-21T02:10:00Z',
} satisfies MyVisitorVerificationReport;

export const visitorVerificationReportCorrectionFixture = {
  id: 173,
  reportId: visitorVerificationReportFixture.id,
  placeId: visitorVerificationReportFixture.placeId,
  reportType: visitorVerificationReportFixture.reportType,
  description: '평일 오후 대기 시간은 약 15분입니다.',
  evidenceUrl: null,
  waitTimeMinutes: 15,
  languageCode: null,
  couponUsageStatus: null,
  crowdLevel: null,
  reportStatus: visitorVerificationReportFixture.status,
  status: 'SUBMITTED',
  rejectionReason: null,
  createdAt: '2026-08-22T03:00:00Z',
  reviewedAt: null,
  updatedAt: '2026-08-22T03:00:00Z',
} satisfies MyVisitorVerificationReportCorrection;

export const visitorVerificationReportPageFixture = {
  reports: [visitorVerificationReportFixture],
  page: 1,
  limit: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
} satisfies MyVisitorVerificationReportPage;

export const visitorVerificationReportCorrectionPageFixture = {
  corrections: [visitorVerificationReportCorrectionFixture],
  page: 1,
  limit: 20,
  totalElements: 1,
  totalPages: 1,
  hasNext: false,
} satisfies MyVisitorVerificationReportCorrectionPage;
