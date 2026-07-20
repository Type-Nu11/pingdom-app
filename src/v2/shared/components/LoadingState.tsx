import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components/native';

import StateLayout from './StateLayout';

export type LoadingStateProps = {
  description?: string;
  fill?: boolean;
};

export default function LoadingState({ description, fill = false }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <StateLayout
      description={description}
      fill={fill}
      visual={<ActivityIndicator color={theme.colors.primary} />}
    />
  );
}
