import React, { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { ErrorState } from '../shared/components';

type AppErrorBoundaryState = {
  error: Error | null;
};

export default class AppErrorBoundary extends Component<PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[V2 AppErrorBoundary]', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return <ErrorFallback onRetry={this.reset} />;
  }
}

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <FallbackContainer edges={['top', 'right', 'bottom', 'left']}>
      <ErrorState
        actionLabel={t('common.error.retry')}
        description={t('common.error.description')}
        fill
        onAction={onRetry}
        title={t('common.error.title')}
      />
    </FallbackContainer>
  );
}

const FallbackContainer = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
