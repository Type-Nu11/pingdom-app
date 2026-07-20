import React from 'react';

import StateLayout, { type StateLayoutProps } from './StateLayout';

export type ErrorStateProps = Omit<StateLayoutProps, 'visual'>;

export default function ErrorState(props: ErrorStateProps) {
  return <StateLayout {...props} />;
}
