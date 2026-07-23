import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  type RenderOptions,
  userEvent,
} from '@testing-library/react-native';
import { createInstance, type i18n as I18nInstance } from 'i18next';
import React, { type PropsWithChildren, type ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { ThemeProvider } from 'styled-components/native';

import {
  resources,
  type SupportedLanguage,
} from '../../src/v2/shared/i18n/resources';
import { theme } from '../../src/v2/shared/theme';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        gcTime: Infinity,
        retry: false,
      },
    },
  });
}

export function createTestI18n(language: SupportedLanguage = 'ko') {
  const instance = createInstance();

  void instance.use(initReactI18next).init({
    fallbackLng: 'ko',
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    lng: language,
    resources,
    supportedLngs: ['ko', 'en'],
  });

  return instance;
}

type TestProviderOptions = {
  i18n?: I18nInstance;
  language?: SupportedLanguage;
  queryClient?: QueryClient;
};

export function createTestWrapper(options: TestProviderOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const i18n = options.i18n ?? createTestI18n(options.language);

  function TestProviders({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    );
  }

  return { i18n, queryClient, wrapper: TestProviders };
}

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & TestProviderOptions;

export async function renderWithProviders(
  ui: ReactElement,
  { i18n, language, queryClient, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const providers = createTestWrapper({ i18n, language, queryClient });
  const result = await render(ui, { wrapper: providers.wrapper, ...renderOptions });

  return {
    ...result,
    i18n: providers.i18n,
    queryClient: providers.queryClient,
    user: userEvent.setup(),
  };
}
