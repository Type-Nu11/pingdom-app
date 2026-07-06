import { useMutation, useQueryClient } from '@tanstack/react-query';
import { placeQueryKeys } from '../../place/hooks/usePlaces';
import { recordApi, type CreateRecordRequest } from '../api/recordApi';
import { postQueryKeys } from './usePlacePosts';

export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  const createRecordMutation = useMutation({
    mutationFn: (payload: CreateRecordRequest) => recordApi.createRecord(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: placeQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.all });
    },
  });

  return {
    createRecord: createRecordMutation.mutateAsync,
    error: createRecordMutation.error,
    isError: createRecordMutation.isError,
    isUploading: createRecordMutation.isPending,
  };
};

export default useCreateRecord;
