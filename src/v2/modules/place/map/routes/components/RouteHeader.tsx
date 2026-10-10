import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { Text } from '../../../../../shared/components/Typography';
import GlassSurface from '../../presentation/components/GlassSurface';
import CloseIcon from '../assets/close.svg';
import ShareIcon from '../assets/share.svg';

export default function RouteHeader({ onShare, onClose, editing = false }: {
  onShare: () => void; onClose: () => void; editing?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const tint = theme.colorScheme === 'dark' ? theme.liquidGlass.navigation.tint : 'rgba(255,255,255,0.24)';
  return <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    {(['share', 'close'] as const).map((action, index) => <React.Fragment key={action}>
      {index === 1 && <Text accessibilityRole="header" style={{ flex: 1, textAlign: 'center', fontSize: 20, lineHeight: 26, fontWeight: '700', color: theme.colors.textStrong }}>{t('routes.title')}</Text>}
      <GlassSurface tintColor={tint} androidTintColor={tint} style={{ borderRadius: 22,
        boxShadow: theme.liquidGlass.navigation.shadow }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t(editing && action === 'close' ? 'routes.editor.close' : `routes.${action}`)}
          onPress={action === 'share' ? onShare : onClose} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          {action === 'share' ? <ShareIcon /> : <CloseIcon />}
        </Pressable>
      </GlassSurface>
    </React.Fragment>)}
  </View>;
}
