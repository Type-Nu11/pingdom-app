import React, { forwardRef } from 'react';
import { View, type ViewProps } from 'react-native';

const SvgMock = forwardRef<View, ViewProps>(function SvgMock(props, ref) {
  return <View {...props} ref={ref} />;
});

export const ReactComponent = SvgMock;
export default SvgMock;
