const light = {
  primaryCta: { tint: 'rgba(255, 25, 86, 0.56)', foreground: '#F6F6F7' },
  header: { radius: 30, tint: 'rgba(248, 248, 248, 0.56)', rim: 'rgba(255, 255, 255, 0.64)', highlightOpacity: 0.16, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.15)' },
  search: { radius: 26, tint: 'rgba(228, 228, 229, 0.60)', rim: 'rgba(255, 255, 255, 0.24)', highlightOpacity: 0.12, shadow: 'inset 0px 4px 20px 0px rgba(0, 0, 0, 0.10)' },
  category: { tint: 'rgba(255, 255, 255, 0.36)', activeTint: 'rgba(255, 201, 211, 0.24)', androidTint: 'rgba(255, 255, 255, 0.2582)', androidActiveTint: 'rgba(255, 146, 166, 0.1191)', border: 'transparent', activeBorder: 'rgba(255, 74, 117, 0.88)', shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.12)' },
  sheet: { topRadius: 36, bottomRadius: 48, tint: 'rgba(248, 248, 248, 0.64)', rim: 'rgba(255, 255, 255, 0.60)', highlightOpacity: 0.12, shadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.10)' },
  navigation: { tint: 'rgba(255, 255, 255, 0.36)', selectedTint: 'rgba(228, 228, 229, 0.64)', pressedTint: 'rgba(228, 228, 229, 0.82)', rim: 'rgba(255, 255, 255, 0.64)', highlightOpacity: 0.16, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06)' },
  fallbackSurface: 'rgba(255, 255, 255, 0.92)', nativeTint: 'rgba(255, 255, 255, 0.18)', highlight: '#FFFFFF', shadowFill: 'rgba(255, 255, 255, 0.01)',
} as const;

export type LiquidGlassTheme = {
  primaryCta: { tint: string; foreground: string };
  header: { radius: number; tint: string; rim: string; highlightOpacity: number; shadow: string };
  search: { radius: number; tint: string; rim: string; highlightOpacity: number; shadow: string };
  category: { tint: string; activeTint: string; androidTint: string; androidActiveTint: string; border: string; activeBorder: string; shadow: string };
  sheet: { topRadius: number; bottomRadius: number; tint: string; rim: string; highlightOpacity: number; shadow: string };
  navigation: { tint: string; selectedTint: string; pressedTint: string; rim: string; highlightOpacity: number; shadow: string };
  fallbackSurface: string;
  nativeTint: string;
  highlight: string;
  shadowFill: string;
};

export const lightLiquidGlass = light;
// Figma Glass/* variables; opaque fallback remains available without native blur.
export const darkLiquidGlass = {
  primaryCta: { tint: 'rgba(255, 25, 86, 0.72)', foreground: '#F6F6F7' },
  header: { radius: 30, tint: 'rgba(22, 22, 26, 0.78)', rim: 'rgba(255, 255, 255, 0.10)', highlightOpacity: 0.08, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.40)' },
  search: { radius: 26, tint: 'rgba(255, 255, 255, 0.08)', rim: 'rgba(255, 255, 255, 0.10)', highlightOpacity: 0.07, shadow: 'inset 0px 2px 12px 0px rgba(0, 0, 0, 0.32)' },
  category: { tint: 'rgba(28, 28, 32, 0.56)', activeTint: 'rgba(255, 25, 86, 0.18)', androidTint: 'rgba(28, 28, 32, 0.56)', androidActiveTint: 'rgba(255, 25, 86, 0.18)', border: 'rgba(255, 255, 255, 0.10)', activeBorder: 'rgba(255, 74, 117, 0.72)', shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.40)' },
  sheet: { topRadius: 36, bottomRadius: 48, tint: 'rgba(22, 22, 26, 0.78)', rim: 'rgba(255, 255, 255, 0.10)', highlightOpacity: 0.06, shadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.40)' },
  navigation: { tint: 'rgba(28, 28, 32, 0.56)', selectedTint: 'rgba(255, 255, 255, 0.08)', pressedTint: 'rgba(38, 38, 43, 0.72)', rim: 'rgba(255, 255, 255, 0.10)', highlightOpacity: 0.07, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.40)' },
  fallbackSurface: 'rgba(27, 27, 32, 0.96)', nativeTint: 'rgba(27, 27, 32, 0.72)', highlight: '#FFFFFF', shadowFill: 'rgba(0, 0, 0, 0.01)',
} as const satisfies LiquidGlassTheme;

export const liquidGlass = lightLiquidGlass;
