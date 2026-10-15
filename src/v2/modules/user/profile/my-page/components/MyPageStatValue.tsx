import Skeleton from '../../../../../shared/components/Skeleton';
import { Text as AppText } from '../../../../../shared/components/Typography';
import React from 'react';
import styled from 'styled-components/native';

const UNAVAILABLE_VALUE = '-';

export type MyPageStatValueProps = {
  isError: boolean;
  isLoading: boolean;
  testID?: string;
  value: number;
};

/**
 * A stat that is still loading must not read as a real count, so the number is
 * withheld until it is known: a skeleton while loading, a dash when the request
 * failed.
 */
export default function MyPageStatValue({
  isError,
  isLoading,
  testID,
  value,
}: MyPageStatValueProps) {

  if (isLoading) {
    return (
      <Slot testID={testID}>
        <Skeleton variant="stat" />
      </Slot>
    );
  }

  return <Value testID={testID}>{isError ? UNAVAILABLE_VALUE : value}</Value>;
}

const Slot = styled.View`
  height: 26px;
  align-items: center;
  justify-content: center;
`;

const Value = styled(AppText)`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 20px;
  font-weight: 700;
`;
