import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  type RenderOptions,
  userEvent,
} from '@testing-library/react-native';
import { createInstance, type i18n as I18nInstance } from 'i18next';
import React, { type PropsWithChildren, type ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import {
  supportedLanguages,
  type SupportedLanguage,
} from '../../shared/i18n/resources';
import {
  AppThemeProvider,
  type AppearancePreference,
  type ResolvedColorScheme,
} from '../../shared/theme';
import { createAppearanceStore } from '../../shared/theme/appearanceStore';
import { resources } from '../i18n/resources';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        gcTime: Infinity,
        retry: false,
      },
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });
}

export async function createTestI18n(language: SupportedLanguage = 'ko') {
  const instance = createInstance();

  await instance.use(initReactI18next).init({
    fallbackLng: 'en',
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    lng: language,
    resources,
    supportedLngs: [...supportedLanguages],
  });

  return instance;
}

type TestProviderOptions = {
  appearancePreference?: AppearancePreference;
  colorScheme?: ResolvedColorScheme;
  i18n?: I18nInstance;
  language?: SupportedLanguage;
  queryClient?: QueryClient;
};

export async function createTestWrapper(options: TestProviderOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const i18n = options.i18n ?? await createTestI18n(options.language);
  const appearanceStore = createAppearanceStore({
    getItem: async () => options.appearancePreference ?? 'LIGHT',
    setItem: async () => undefined,
  });
  appearanceStore.setState({
    hydrationStatus: 'hydrated',
    preference: options.appearancePreference ?? 'LIGHT',
  });

  function TestProviders({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <AppThemeProvider
            appearanceStore={appearanceStore}
            fontFamily="Pretendard"
            systemSchemeOverride={options.colorScheme ?? 'light'}
          >
            {children}
          </AppThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    );
  }

  return { i18n, queryClient, wrapper: TestProviders };
}

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & TestProviderOptions;

export async function renderWithProviders(
  ui: ReactElement,
  {
    appearancePreference,
    colorScheme,
    i18n,
    language,
    queryClient,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const providers = await createTestWrapper({
    appearancePreference,
    colorScheme,
    i18n,
    language,
    queryClient,
  });
  const result = await render(ui, { wrapper: providers.wrapper, ...renderOptions });

  return {
    ...result,
    i18n: providers.i18n,
    queryClient: providers.queryClient,
    user: userEvent.setup(),
  };
}
