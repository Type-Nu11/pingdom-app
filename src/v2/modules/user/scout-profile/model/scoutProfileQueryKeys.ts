export const scoutProfileQueryKeys = {
  all: ['v2', 'users', 'me', 'scout-profile'] as const,
  mine: () => scoutProfileQueryKeys.all,
};
