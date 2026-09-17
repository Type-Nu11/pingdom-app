import { QueryObserver, type QueryClient, type QueryKey } from '@tanstack/react-query';
import { VoiceCommandError } from './voiceCommandTime';

export type VoiceQueryOptions<T> = {
  queryKey: QueryKey; queryFn: (context: { signal?: AbortSignal }) => Promise<T>; staleTime?: number;
};
/** A disposable observer in the existing cache. Never cancelQueries/clear a shared client. */
export function observeVoiceQuery<T>(client: QueryClient, options: VoiceQueryOptions<T>, signal: AbortSignal, force: boolean) {
  return new Promise<{ data: T; queryKey: QueryKey; dataUpdatedAt: number }>((resolve, reject) => {
    if (signal.aborted) { reject(new VoiceCommandError('CANCELED')); return; }
    const observer = new QueryObserver<T>(client, { ...options, staleTime: force ? 0 : Math.min(options.staleTime ?? 30000, 30000) });
    let unsubscribe = () => {};
    let done = false;
    const finish = (error?: unknown) => {
      if (done) return;
      const result = observer.getCurrentResult();
      if (!error && (result.isFetching || result.isPending)) return;
      done = true;
      signal.removeEventListener('abort', abort);
      unsubscribe(); observer.destroy();
      if (error || result.isError) reject(error ?? result.error);
      else resolve({ data: result.data as T, queryKey: options.queryKey, dataUpdatedAt: result.dataUpdatedAt });
    };
    const abort = () => finish(new VoiceCommandError('CANCELED'));
    signal.addEventListener('abort', abort, { once: true });
    unsubscribe = observer.subscribe(() => finish());
    finish();
    if (done) unsubscribe();
  });
}
