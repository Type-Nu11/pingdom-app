import React, { useEffect } from 'react';
import { BackHandler, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import GlassSurface from '../../presentation/components/GlassSurface';

type Props = { visible: boolean; onContinue: () => void; onClose: () => void };

export default function MapAssistantIntro({ visible, onContinue, onClose }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => subscription.remove();
  }, [visible, onClose]);
  if (!visible) return null;
  return <Overlay testID="map-assistant-intro" accessibilityViewIsModal onAccessibilityEscape={onClose}>
    <Backdrop accessible={false} onPress={onClose} />
    <Card testID="map-assistant-intro-card" style={{ borderRadius: theme.liquidGlass.sheet.topRadius,
      borderColor: theme.liquidGlass.sheet.rim, boxShadow: theme.liquidGlass.sheet.shadow }}>
      <Title>{t('voiceAssistant.command.introTitle')}</Title>
      <Body>{t('voiceAssistant.command.submission')}</Body>
      <Actions>
        <Secondary accessibilityRole="button" accessibilityLabel={t('voiceAssistant.command.introClose')} onPress={onClose}>
          <SecondaryText>{t('voiceAssistant.command.introClose')}</SecondaryText>
        </Secondary>
        <Primary accessibilityRole="button" accessibilityLabel={t('voiceAssistant.command.introContinue')} onPress={onContinue}>
          <PrimaryText>{t('voiceAssistant.command.introContinue')}</PrimaryText>
        </Primary>
      </Actions>
    </Card>
  </Overlay>;
}

const Overlay = styled.View`
  position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;
  z-index: 1001; elevation: 1001; justify-content: center; padding: 24px;
`;
const Backdrop = styled.Pressable`
  position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;
  background-color: rgba(0, 0, 0, 0.42);
`;
const Card = styled(GlassSurface)`
  width: 100%; max-width: 400px; align-self: center; overflow: hidden;
  padding: 24px; gap: 18px; border-width: 1px;
`;
const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.textStrong}; font-size: 22px; font-weight: 700;
`;
const Body = styled(Text)`
  color: ${({ theme }) => theme.colors.text}; font-size: 15px; line-height: 23px;
`;
const Actions = styled.View`flex-direction: row; justify-content: flex-end; gap: 8px;`;
const Secondary = styled.Pressable`
  min-height: 44px; padding: 10px 16px; justify-content: center; border-radius: 22px;
  background-color: ${({ theme }) => theme.liquidGlass.category.tint};
`;
const Primary = styled.Pressable`
  min-height: 44px; padding: 10px 16px; justify-content: center; border-radius: 22px;
  background-color: ${({ theme }) => theme.liquidGlass.primaryCta.tint};
`;
const SecondaryText = styled(Text)`color: ${({ theme }) => theme.colors.textStrong}; font-weight: 600;`;
const PrimaryText = styled(Text)`color: ${({ theme }) => theme.liquidGlass.primaryCta.foreground}; font-weight: 700;`;
