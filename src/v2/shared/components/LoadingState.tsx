import React from 'react';
import Skeleton, { type SkeletonVariant } from './Skeleton';

export type LoadingStateProps = {
  description?: string;
  fill?: boolean;
  variant?: SkeletonVariant;
  count?: number;
};

export default function LoadingState({ description, fill = false, variant = 'list', count }: LoadingStateProps) {
  return (
    <Skeleton accessibilityLabel={description} variant={variant} count={count}
      style={{ width: '100%', padding: 16, ...(fill ? { flex: 1 } : { flexShrink: 0 }) }} />
  );
}
