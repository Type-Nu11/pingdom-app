const light = {
  header: { radius: 30, tint: 'rgba(248, 248, 248, 0.56)', rim: 'rgba(255, 255, 255, 0.64)', highlightOpacity: 0.16, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.15)' },
  search: { radius: 26, tint: 'rgba(228, 228, 229, 0.60)', rim: 'rgba(255, 255, 255, 0.24)', highlightOpacity: 0.12, shadow: 'inset 0px 4px 20px 0px rgba(0, 0, 0, 0.10)' },
  category: { tint: 'rgba(255, 255, 255, 0.36)', activeTint: 'rgba(255, 201, 211, 0.24)', androidTint: 'rgba(255, 255, 255, 0.2582)', androidActiveTint: 'rgba(255, 146, 166, 0.1191)', border: 'transparent', activeBorder: 'rgba(255, 74, 117, 0.88)', shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.12)' },
  sheet: { topRadius: 36, bottomRadius: 48, tint: 'rgba(248, 248, 248, 0.64)', rim: 'rgba(255, 255, 255, 0.60)', highlightOpacity: 0.12, shadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.10)' },
  navigation: { tint: 'rgba(255, 255, 255, 0.36)', selectedTint: 'rgba(228, 228, 229, 0.64)', pressedTint: 'rgba(228, 228, 229, 0.82)', rim: 'rgba(255, 255, 255, 0.64)', highlightOpacity: 0.16, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06)' },
  fallbackSurface: 'rgba(255, 255, 255, 0.92)', nativeTint: 'rgba(255, 255, 255, 0.18)', highlight: '#FFFFFF', shadowFill: 'rgba(255, 255, 255, 0.01)',
} as const;

export type LiquidGlassTheme = {
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
export const darkLiquidGlass = {
  header: { radius: 30, tint: 'rgba(28, 28, 33, 0.82)', rim: 'rgba(255, 255, 255, 0.18)', highlightOpacity: 0.08, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.42)' },
  search: { radius: 26, tint: 'rgba(38, 38, 44, 0.86)', rim: 'rgba(255, 255, 255, 0.14)', highlightOpacity: 0.07, shadow: 'inset 0px 4px 20px 0px rgba(0, 0, 0, 0.28)' },
  category: { tint: 'rgba(30, 30, 35, 0.88)', activeTint: 'rgba(82, 33, 49, 0.90)', androidTint: 'rgba(27, 27, 32, 0.92)', androidActiveTint: 'rgba(75, 31, 45, 0.94)', border: 'rgba(255, 255, 255, 0.16)', activeBorder: 'rgba(255, 134, 165, 0.92)', shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.38)' },
  sheet: { topRadius: 36, bottomRadius: 48, tint: 'rgba(25, 25, 30, 0.94)', rim: 'rgba(255, 255, 255, 0.16)', highlightOpacity: 0.06, shadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.38)' },
  navigation: { tint: 'rgba(28, 28, 33, 0.90)', selectedTint: 'rgba(74, 74, 84, 0.88)', pressedTint: 'rgba(92, 92, 102, 0.92)', rim: 'rgba(255, 255, 255, 0.18)', highlightOpacity: 0.07, shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.38)' },
  fallbackSurface: 'rgba(27, 27, 32, 0.96)', nativeTint: 'rgba(27, 27, 32, 0.72)', highlight: '#FFFFFF', shadowFill: 'rgba(0, 0, 0, 0.01)',
} as const satisfies LiquidGlassTheme;

export const liquidGlass = lightLiquidGlass;
