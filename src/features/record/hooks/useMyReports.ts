import { useQuery } from '@tanstack/react-query';
import { recordApi, type GetReportsRequest } from '../api/recordApi';

export const myReportsQueryKeys = {
  all: ['myReports'] as const,
  list: (params: GetReportsRequest) => [...myReportsQueryKeys.all, 'list', params] as const,
};

export const useMyReports = (params: GetReportsRequest = {}) => {
  const queryParams = {
    limit: params.limit ?? 20,
    page: params.page ?? 1,
  };
  const reportsQuery = useQuery({
    queryKey: myReportsQueryKeys.list(queryParams),
    queryFn: () => recordApi.getMyReports(queryParams),
  });

  return {
    error: reportsQuery.error,
    hasNext: reportsQuery.data?.hasNext ?? false,
    isError: reportsQuery.isError,
    isLoading: reportsQuery.isLoading,
    reports: reportsQuery.data?.reports ?? [],
  };
};

export default useMyReports;
