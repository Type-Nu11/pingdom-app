export const accountUserQueryKeys = {
  all: ['v2', 'users'] as const,
  me: () => [...accountUserQueryKeys.all, 'me'] as const,
};

export const oauthAccountQueryKeys = {
  all: [...accountUserQueryKeys.me(), 'oauth-accounts'] as const,
  provider: (provider: 'GOOGLE') => [...oauthAccountQueryKeys.all, provider] as const,
  google: () => oauthAccountQueryKeys.provider('GOOGLE'),
};

export const userDataExportQueryKeys = {
  all: [...accountUserQueryKeys.me(), 'export'] as const,
  mine: () => userDataExportQueryKeys.all,
};
