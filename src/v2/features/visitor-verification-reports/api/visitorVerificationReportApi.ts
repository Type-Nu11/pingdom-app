import { apiClient, type ApiClient } from '../../../shared/api';
import type {
  MyVisitorVerificationReport,
  MyVisitorVerificationReportCorrection,
  MyVisitorVerificationReportCorrectionPage,
  MyVisitorVerificationReportPage,
  VisitorVerificationReportCorrectionRequest,
  VisitorVerificationReportCreateRequest,
  VisitorVerificationReportListParams,
} from '../model/visitorVerificationReport.types';

const REPORTS_PATH = '/visitor-verification-reports';

export function createVisitorVerificationReportApi(client: ApiClient = apiClient) {
  return {
    createReport: (
      body: VisitorVerificationReportCreateRequest,
      signal?: AbortSignal,
    ): Promise<MyVisitorVerificationReport> =>
      client.post<MyVisitorVerificationReport, VisitorVerificationReportCreateRequest>(
        REPORTS_PATH,
        body,
        { signal },
      ),

    getReport: (
      reportId: number,
      signal?: AbortSignal,
    ): Promise<MyVisitorVerificationReport> =>
      client.get<MyVisitorVerificationReport>(`${REPORTS_PATH}/${reportId}`, { signal }),

    listCorrections: (
      reportId: number,
      params: VisitorVerificationReportListParams = {},
      signal?: AbortSignal,
    ): Promise<MyVisitorVerificationReportCorrectionPage> =>
      client.get<MyVisitorVerificationReportCorrectionPage>(
        `${REPORTS_PATH}/${reportId}/corrections`,
        { params, signal },
      ),

    listReports: (
      params: VisitorVerificationReportListParams = {},
      signal?: AbortSignal,
    ): Promise<MyVisitorVerificationReportPage> =>
      client.get<MyVisitorVerificationReportPage>(REPORTS_PATH, { params, signal }),

    submitCorrection: (
      reportId: number,
      body: VisitorVerificationReportCorrectionRequest,
      signal?: AbortSignal,
    ): Promise<MyVisitorVerificationReportCorrection> =>
      client.post<
        MyVisitorVerificationReportCorrection,
        VisitorVerificationReportCorrectionRequest
      >(`${REPORTS_PATH}/${reportId}/corrections`, body, { signal }),
  };
}

export const visitorVerificationReportApi = createVisitorVerificationReportApi();
