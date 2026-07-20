import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

export default function HomeScreen() {
  return <Container edges={['top', 'right', 'bottom', 'left']} testID="v2-home-screen" />;
}

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
