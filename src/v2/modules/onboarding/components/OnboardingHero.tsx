import React from 'react';
import { Image } from 'react-native';
import styled from 'styled-components/native';

type Props = Readonly<{
  logoAccessibilityLabel: string;
  subtitle: string;
  title: string;
}>;

export default function OnboardingHero({ logoAccessibilityLabel, subtitle, title }: Props) {
  return (
    <Group>
      <Logo
        accessibilityLabel={logoAccessibilityLabel}
        resizeMode="contain"
        source={require('../../../../assets/v2/images/pingDomLogo.png')}
      />
      <TextGroup>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TextGroup>
    </Group>
  );
}

const Group = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 32px;
`;

const Logo = styled(Image)`
  width: 247px;
  height: 144px;
`;

const TextGroup = styled.View`
  align-items: center;
  gap: 8px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.labelNormal};
  font-size: ${({ theme }) => theme.typography.title1Bold.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title1Bold.fontWeight};
  line-height: ${({ theme }) => theme.typography.title1Bold.lineHeight}px;
  text-align: center;
`;

const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight}px;
  text-align: center;
`;
