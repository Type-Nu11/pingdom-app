import React from 'react';
import styled from 'styled-components/native';

type PlusIconProps = {
  color?: string;
  size?: number;
  thickness?: number;
};

/**
 * The design's "새 이벤트" affordance is a plain plus sign with no brand
 * identity, and the shared icon set has no plus asset, so it is drawn from two
 * bars rather than pulling in a new SVG.
 */
export default function PlusIcon({
  color = '#FFFFFF',
  size = 24,
  thickness = 2,
}: PlusIconProps) {
  return (
    <Box style={{ height: size, width: size }}>
      <Bar style={{ backgroundColor: color, height: thickness, width: size * 0.5 }} />
      <Bar style={{ backgroundColor: color, height: size * 0.5, width: thickness }} />
    </Box>
  );
}

const Box = styled.View`
  align-items: center;
  justify-content: center;
`;

const Bar = styled.View`
  position: absolute;
  border-radius: 1px;
`;
