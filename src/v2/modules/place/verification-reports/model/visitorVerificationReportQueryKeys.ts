import type { VisitorVerificationReportListParams } from './visitorVerificationReport.types';

export const visitorVerificationReportQueryKeys = {
  all: ['v2', 'visitor-verification-reports'] as const,
  lists: () => [...visitorVerificationReportQueryKeys.all, 'list'] as const,
  list: (params: VisitorVerificationReportListParams) =>
    [...visitorVerificationReportQueryKeys.lists(), params] as const,
  details: () => [...visitorVerificationReportQueryKeys.all, 'detail'] as const,
  detail: (reportId: number) =>
    [...visitorVerificationReportQueryKeys.details(), reportId] as const,
  corrections: (reportId: number) =>
    [...visitorVerificationReportQueryKeys.detail(reportId), 'corrections'] as const,
  correctionList: (reportId: number, params: VisitorVerificationReportListParams) =>
    [...visitorVerificationReportQueryKeys.corrections(reportId), params] as const,
};
