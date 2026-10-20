export type PlaceListRuntimeState = 'disabled' | 'empty' | 'error' | 'loading' | 'ready';

type PlaceListRuntimeInput = {
  enabled: boolean;
  isError: boolean;
  isLoading: boolean;
  placeCount: number;
};

export function getPlaceListRuntimeState({
  enabled,
  isError,
  isLoading,
  placeCount,
}: PlaceListRuntimeInput): PlaceListRuntimeState {
  if (!enabled) return 'disabled';
  if (isLoading) return 'loading';
  if (isError) return 'error';
  return placeCount > 0 ? 'ready' : 'empty';
}
