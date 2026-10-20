import React from 'react';
import styled from 'styled-components/native';

import LoadingLogo from '../../../assets/v2/images/pingdom-loading-logo.svg';

const LOGO_WIDTH = 97;
const LOGO_HEIGHT = 111;

export default function AppLoadingScreen() {
  return (
    <Container testID="app-loading-screen">
      <LoadingLogo height={LOGO_HEIGHT} testID="app-loading-logo" width={LOGO_WIDTH} />
    </Container>
  );
}

// The logo sits entirely above the vertical center (its bottom edge is at 50%).
// Bottom padding of one logo height lifts the centered logo by half of it.
const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-bottom: ${LOGO_HEIGHT}px;
  background-color: ${({ theme }) => theme.colors.background};
`;
