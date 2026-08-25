import type {
  VisitorVerificationReportCorrectionRequest,
  VisitorVerificationReportCreateRequest,
} from '../../../generated/visitorVerificationReports';
import type { MockHandler } from '../../handlers';
import {
  visitorVerificationReportCorrectionFixture,
  visitorVerificationReportCorrectionPageFixture,
  visitorVerificationReportFixture,
  visitorVerificationReportPageFixture,
} from './fixtures';

const REPORTS_PATH = '/visitor-verification-reports';
const REPORT_PATH = /^\/visitor-verification-reports\/(\d+)$/;
const CORRECTIONS_PATH = /^\/visitor-verification-reports\/(\d+)\/corrections$/;

function getReportId(path: string, pattern: RegExp): number {
  const value = pattern.exec(path)?.[1];
  return value ? Number(value) : visitorVerificationReportFixture.id;
}

export const visitorVerificationReportMockHandlers = [
  {
    method: 'GET',
    path: REPORTS_PATH,
    resolve: ({ scenario }) => scenario === 'empty'
      ? { ...visitorVerificationReportPageFixture, reports: [], totalElements: 0, totalPages: 0 }
      : visitorVerificationReportPageFixture,
  },
  {
    method: 'POST',
    path: REPORTS_PATH,
    resolve: ({ body }) => {
      const request = body as VisitorVerificationReportCreateRequest;
      return {
        ...visitorVerificationReportFixture,
        ...request,
        couponUsageStatus: request.couponUsageStatus ?? null,
        crowdLevel: request.crowdLevel ?? null,
        evidenceUrl: request.evidenceUrl ?? null,
        languageCode: request.languageCode ?? null,
        reviewedAt: null,
        status: 'SUBMITTED',
        waitTimeMinutes: request.waitTimeMinutes ?? null,
      };
    },
  },
  {
    method: 'GET',
    path: REPORT_PATH,
    resolve: ({ path }) => ({
      ...visitorVerificationReportFixture,
      id: getReportId(path, REPORT_PATH),
    }),
  },
  {
    method: 'GET',
    path: CORRECTIONS_PATH,
    resolve: ({ path, scenario }) => {
      const reportId = getReportId(path, CORRECTIONS_PATH);
      return scenario === 'empty'
        ? {
            ...visitorVerificationReportCorrectionPageFixture,
            corrections: [],
            totalElements: 0,
            totalPages: 0,
          }
        : {
            ...visitorVerificationReportCorrectionPageFixture,
            corrections: visitorVerificationReportCorrectionPageFixture.corrections.map(
              (correction) => ({ ...correction, reportId }),
            ),
          };
    },
  },
  {
    method: 'POST',
    path: CORRECTIONS_PATH,
    resolve: ({ body, path }) => {
      const request = body as VisitorVerificationReportCorrectionRequest;
      return {
        ...visitorVerificationReportCorrectionFixture,
        ...request,
        couponUsageStatus: request.couponUsageStatus ?? null,
        crowdLevel: request.crowdLevel ?? null,
        evidenceUrl: request.evidenceUrl ?? null,
        languageCode: request.languageCode ?? null,
        reportId: getReportId(path, CORRECTIONS_PATH),
        waitTimeMinutes: request.waitTimeMinutes ?? null,
      };
    },
  },
] satisfies readonly MockHandler[];
