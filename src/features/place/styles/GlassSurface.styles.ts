import styled from 'styled-components/native';

export const AndroidStaticSurface = styled.View<{ $backgroundColor: string }>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;
