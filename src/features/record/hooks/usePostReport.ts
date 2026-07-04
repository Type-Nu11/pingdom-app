import { useMutation } from '@tanstack/react-query';
import { recordApi, type PostReportRequest } from '../api/recordApi';

type PostReportMutation = PostReportRequest & {
  postId: number;
};

export const usePostReport = () => {
  const postReportMutation = useMutation({
    mutationFn: ({ postId, reason }: PostReportMutation) => recordApi.reportRecord(postId, { reason }),
  });

  return {
    isPending: postReportMutation.isPending,
    reportPost: (postId: number, reason: string) =>
      postReportMutation.mutateAsync({ postId, reason }).then(() => undefined),
  };
};

export default usePostReport;
