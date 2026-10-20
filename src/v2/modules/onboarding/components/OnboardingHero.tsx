import React from 'react';
import { Image, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native';

type Props = Readonly<{
  // Figma offset of the logo block below the header, for the 874px frame.
  heroTop: number;
  logoAccessibilityLabel: string;
  subtitle: string;
  title: string;
}>;

// Figma frame (402x874): the logo block starts 183px below the header; shorter
// screens give that space back so the CTA never collides with the text.
const FIGMA_FRAME_HEIGHT = 874;
const MIN_HERO_TOP = 24;

export default function OnboardingHero({ heroTop, logoAccessibilityLabel, subtitle, title }: Props) {
  const { height } = useWindowDimensions();
  const top = Math.max(MIN_HERO_TOP, heroTop - Math.max(0, FIGMA_FRAME_HEIGHT - height));

  return (
    <Group style={{ paddingTop: top }}>
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
  justify-content: flex-start;
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
