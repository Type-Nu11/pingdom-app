import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordApi } from '../api/recordApi';
import { postQueryKeys } from './usePlacePosts';

export const usePostReport = () => {
  const queryClient = useQueryClient();

  const postReportMutation = useMutation({
    mutationFn: (postId: number) => recordApi.reportRecord(postId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });

  return {
    isPending: postReportMutation.isPending,
    reportPost: (postId: number) =>
      postReportMutation.mutateAsync(postId).then(() => undefined),
  };
};

export default usePostReport;
