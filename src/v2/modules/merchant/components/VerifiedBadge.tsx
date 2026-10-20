import React from 'react';
import styled from 'styled-components/native';

import CheckIcon from '../../../../assets/v2/icons/check.svg';

type VerifiedBadgeProps = {
  size?: number;
};

/**
 * The shared check asset is a bare white tick, so it is placed on a primary
 * disc to read as the verified marker shown next to the merchant name.
 */
export default function VerifiedBadge({ size = 16 }: VerifiedBadgeProps) {
  return (
    <Disc style={{ borderRadius: size / 2, height: size, width: size }}>
      <CheckIcon height={size * 0.62} width={size * 0.62} />
    </Disc>
  );
}

const Disc = styled.View`
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
`;
