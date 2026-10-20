import React from 'react';
import styled from 'styled-components/native';

export default function OnboardingHeading({ subtitle, title }: Readonly<{ subtitle: string; title: string }>) {
  return (
    <Heading>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </Heading>
  );
}

const Heading = styled.View`
  margin-bottom: 18px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.labelStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
  line-height: 41.6px;
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: 20.8px;
`;
