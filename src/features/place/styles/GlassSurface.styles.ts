import styled from 'styled-components/native';

export const AndroidStaticSurface = styled.View<{ $backgroundColor: string }>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

export const MaterialTint = styled.View<{ $tintColor: string }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${({ $tintColor }) => $tintColor};
`;
