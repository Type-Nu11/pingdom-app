import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import GlassSurface from '../../presentation/components/GlassSurface';

type Props = {
  title: string; message: string; detail?: string; busy?: boolean;
  onClose: () => void; onRetry?: () => void; retryLabel?: string;
};

/** Uses the map's glass-card, typography and button tokens in the current modal window. */
export default function RouteNotice({ title, message, detail, busy, onClose, onRetry, retryLabel }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  return <Overlay testID="route-notice" accessibilityViewIsModal onAccessibilityEscape={onClose}>
    <Backdrop accessible={false} onPress={onClose} style={{ backgroundColor: theme.colors.overlay }} />
    <Card tintColor={theme.liquidGlass.sheet.tint} androidTintColor={theme.liquidGlass.sheet.tint}
      style={{ borderColor: theme.liquidGlass.sheet.rim, boxShadow: theme.liquidGlass.sheet.shadow }}>
      <Content bounces={false}>
        <Text accessibilityRole="header" style={[theme.typography.headline1Bold, { color: theme.colors.textStrong }]}>{title}</Text>
        {busy && <ActivityIndicator testID="route-start-locating" color={theme.colors.primary} />}
        <Text accessibilityLiveRegion="polite" style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>{message}</Text>
        {!!detail && <Text style={[theme.typography.labelMedium, { color: theme.colors.textSecondary }]}>{detail}</Text>}
        <Actions>
          <Action testID="route-notice-close" accessibilityRole="button" onPress={onClose} style={{ backgroundColor: theme.colors.fillNeutral }}>
            <Text style={[theme.typography.labelBold, { color: theme.colors.textStrong, textAlign: 'center' }]}>{t('routes.close')}</Text>
          </Action>
          {!busy && onRetry && <Action testID="route-notice-retry" accessibilityRole="button" onPress={onRetry}
            style={{ backgroundColor: theme.colors.primary }}>
            <Text style={[theme.typography.labelBold, { color: theme.colors.textInverse, textAlign: 'center' }]}>{retryLabel}</Text>
          </Action>}
        </Actions>
      </Content>
    </Card>
  </Overlay>;
}
const Overlay = styled.View`
  position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;
  z-index: 1001; elevation: 1001; justify-content: center; padding: 24px;
`;
const Backdrop = styled.Pressable`position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px;`;
const Card = styled(GlassSurface)`
  width: 100%; max-width: 400px; max-height: 85%; align-self: center;
  border-radius: 36px; border-width: 1px; overflow: hidden;
`;
const Content = styled.ScrollView.attrs({ contentContainerStyle: { padding: 24, gap: 18 } })``;
const Actions = styled.View`flex-direction: row; flex-wrap: wrap; gap: 8px;`;
const Action = styled.Pressable`
  flex-grow: 1; flex-shrink: 1; min-height: 48px; padding: 12px 16px;
  justify-content: center; border-radius: 24px;
`;
