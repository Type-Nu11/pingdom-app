import type {
  MyVisitorVerificationReport,
  MyVisitorVerificationReportCorrection,
  VisitorVerificationReportCorrectionRequest,
  VisitorVerificationReportCreateRequest,
} from '../../../features/visitor-verification-reports';

const createRequest = {
  description: '대기 시간 제보',
  placeId: 17,
  reportType: 'WAIT_TIME',
  waitTimeMinutes: 30,
} satisfies VisitorVerificationReportCreateRequest;

const correctionRequest = {
  description: '대기 시간 정정',
  waitTimeMinutes: 15,
} satisfies VisitorVerificationReportCorrectionRequest;

const report = {
  id: 172,
  placeId: createRequest.placeId,
  reportType: createRequest.reportType,
  description: createRequest.description,
  evidenceUrl: null,
  waitTimeMinutes: createRequest.waitTimeMinutes,
  languageCode: null,
  couponUsageStatus: null,
  crowdLevel: null,
  status: 'SUBMITTED',
  rejectionReason: null,
  createdAt: '2026-08-25T00:00:00Z',
  reviewedAt: null,
  updatedAt: '2026-08-25T00:00:00Z',
} satisfies MyVisitorVerificationReport;

const correction = {
  ...report,
  ...correctionRequest,
  id: 173,
  reportId: report.id,
  reportStatus: 'ACCEPTED',
} satisfies MyVisitorVerificationReportCorrection;

void correction;

// @ts-expect-error The live OpenAPI does not define a PENDING report state.
const invalidStatus: MyVisitorVerificationReport['status'] = 'PENDING';

const invalidCorrection: VisitorVerificationReportCorrectionRequest = {
  description: 'invalid',
  // @ts-expect-error A correction request does not accept placeId.
  placeId: 17,
};

void invalidStatus;
void invalidCorrection;
