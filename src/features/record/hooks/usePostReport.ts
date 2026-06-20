import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordApi, type PostReportRequest } from '../api/recordApi';
import { postQueryKeys } from './usePlacePosts';

type PostReportMutation = PostReportRequest & {
  postId: number;
};

export const usePostReport = () => {
  const queryClient = useQueryClient();

  const postReportMutation = useMutation({
    mutationFn: ({ postId, reason }: PostReportMutation) => recordApi.reportRecord(postId, { reason }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });

  return {
    isPending: postReportMutation.isPending,
    reportPost: (postId: number, reason: string) =>
      postReportMutation.mutateAsync({ postId, reason }).then(() => undefined),
  };
};

export default usePostReport;
