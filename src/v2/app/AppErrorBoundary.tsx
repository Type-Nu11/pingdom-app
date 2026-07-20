import React, { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

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
      <FallbackTitle>{t('common.error.title')}</FallbackTitle>
      <FallbackDescription>{t('common.error.description')}</FallbackDescription>
      <RetryButton accessibilityRole="button" onPress={onRetry}>
        <RetryLabel>{t('common.error.retry')}</RetryLabel>
      </RetryButton>
    </FallbackContainer>
  );
}

const FallbackContainer = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.xl}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const FallbackTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
`;

const FallbackDescription = styled(Text)`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const RetryButton = styled.Pressable`
  min-height: ${({ theme }) => theme.spacing.xxl}px;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.none}px ${({ theme }) => theme.spacing.lg}px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const RetryLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
`;
