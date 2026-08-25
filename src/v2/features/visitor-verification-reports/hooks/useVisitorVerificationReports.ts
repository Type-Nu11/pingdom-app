import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { visitorVerificationReportApi } from '../api/visitorVerificationReportApi';
import { visitorVerificationReportQueryKeys } from '../model/visitorVerificationReportQueryKeys';
import type {
  VisitorVerificationReportCorrectionRequest,
  VisitorVerificationReportCreateRequest,
  VisitorVerificationReportListParams,
} from '../model/visitorVerificationReport.types';

type VisitorVerificationReportApi = typeof visitorVerificationReportApi;

export function createVisitorVerificationReportListQueryOptions(
  params: VisitorVerificationReportListParams = {},
  api: Pick<VisitorVerificationReportApi, 'listReports'> = visitorVerificationReportApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.listReports(params, signal),
    queryKey: visitorVerificationReportQueryKeys.list(params),
  };
}

export function createVisitorVerificationReportDetailQueryOptions(
  reportId: number,
  api: Pick<VisitorVerificationReportApi, 'getReport'> = visitorVerificationReportApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) => api.getReport(reportId, signal),
    queryKey: visitorVerificationReportQueryKeys.detail(reportId),
  };
}

export function createVisitorVerificationReportCorrectionsQueryOptions(
  reportId: number,
  params: VisitorVerificationReportListParams = {},
  api: Pick<VisitorVerificationReportApi, 'listCorrections'> = visitorVerificationReportApi,
) {
  return {
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      api.listCorrections(reportId, params, signal),
    queryKey: visitorVerificationReportQueryKeys.correctionList(reportId, params),
  };
}

export function createVisitorVerificationReportMutationOptions(
  api: Pick<VisitorVerificationReportApi, 'createReport'> = visitorVerificationReportApi,
) {
  return {
    mutationFn: (body: VisitorVerificationReportCreateRequest) => api.createReport(body),
    retry: false,
  };
}

export function createVisitorVerificationReportCorrectionMutationOptions(
  api: Pick<VisitorVerificationReportApi, 'submitCorrection'> = visitorVerificationReportApi,
) {
  return {
    mutationFn: ({ body, reportId }: {
      body: VisitorVerificationReportCorrectionRequest;
      reportId: number;
    }) => api.submitCorrection(reportId, body),
    retry: false,
  };
}

export async function invalidateVisitorVerificationReportCaches(
  queryClient: QueryClient,
  reportId: number,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: visitorVerificationReportQueryKeys.lists() }),
    queryClient.invalidateQueries({
      exact: true,
      queryKey: visitorVerificationReportQueryKeys.detail(reportId),
    }),
    queryClient.invalidateQueries({
      queryKey: visitorVerificationReportQueryKeys.corrections(reportId),
    }),
  ]);
}

export function useVisitorVerificationReports(
  params: VisitorVerificationReportListParams = {},
) {
  return useQuery(createVisitorVerificationReportListQueryOptions(params));
}

export function useVisitorVerificationReport(reportId: number) {
  return useQuery(createVisitorVerificationReportDetailQueryOptions(reportId));
}

export function useVisitorVerificationReportCorrections(
  reportId: number,
  params: VisitorVerificationReportListParams = {},
) {
  return useQuery(createVisitorVerificationReportCorrectionsQueryOptions(reportId, params));
}

export function useCreateVisitorVerificationReport() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createVisitorVerificationReportMutationOptions(),
    onSuccess: async (report) => {
      await invalidateVisitorVerificationReportCaches(queryClient, report.id);
    },
  });
}

export function useSubmitVisitorVerificationReportCorrection() {
  const queryClient = useQueryClient();

  return useMutation({
    ...createVisitorVerificationReportCorrectionMutationOptions(),
    onSuccess: async (_correction, { reportId }) => {
      await invalidateVisitorVerificationReportCaches(queryClient, reportId);
    },
  });
}
