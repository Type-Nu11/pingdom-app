import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from 'styled-components/native';
import { resolveFontFace, useAppFontFamily } from '../../../shared/fonts';

export const AssistantMarkdown = memo(function AssistantMarkdown({ children }: { children: string }) {
  const theme = useTheme();
  const fontFamily = useAppFontFamily();
  const style = useMemo(() => {
    const bold = resolveFontFace(fontFamily, '700');
    const emphasis = resolveFontFace(fontFamily, '800');
    const heading = (fontSize: number) => ({ ...emphasis, fontSize, lineHeight: fontSize + 6, marginBottom: 8 });
    const code = { color: theme.colors.textStrong, backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border, fontWeight: '400' as const, fontSize: 14, lineHeight: 20 };
    return {
      body: { ...bold, color: theme.colors.textStrong, fontSize: 16, lineHeight: 21 },
      strong: emphasis,
      heading1: heading(22), heading2: heading(20), heading3: heading(18),
      heading4: heading(16), heading5: heading(16), heading6: heading(16),
      paragraph: { marginTop: 0, marginBottom: 8 },
      bullet_list: { marginBottom: 8 }, ordered_list: { marginBottom: 8 },
      list_item: { marginBottom: 4 },
      bullet_list_icon: { marginLeft: 0, marginRight: 8 },
      ordered_list_icon: { marginLeft: 0, marginRight: 8 },
      link: { color: theme.colors.primary },
      blockquote: { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, padding: 8 },
      code_inline: { ...code, padding: 2 }, code_block: code, fence: code,
      hr: { backgroundColor: theme.colors.border, marginVertical: 8 },
      table: { borderColor: theme.colors.border }, tr: { borderColor: theme.colors.border },
    };
  }, [fontFamily, theme]);

  return <View testID="voice-assistant-message" accessibilityLiveRegion="polite">
    <Markdown style={style}>{children}</Markdown>
  </View>;
});
