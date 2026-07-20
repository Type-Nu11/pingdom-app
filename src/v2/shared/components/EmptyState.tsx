import React from 'react';

import StateLayout, { type StateLayoutProps } from './StateLayout';

export type EmptyStateProps = Omit<StateLayoutProps, 'visual'>;

export default function EmptyState(props: EmptyStateProps) {
  return <StateLayout {...props} />;
}
