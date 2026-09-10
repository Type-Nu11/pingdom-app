// Figma Map (HotPlace), node 4455:13418. Keep these tints translucent so the
// shared glass renderer can show the map underneath on both iOS and Android.
// Pass shadows through the native style prop: styled-components/native neither
// parses box-shadow nor preserves attrs.style in the installed version.
export const liquidGlass = {
  header: {
    radius: 30,
    tint: 'rgba(248, 248, 248, 0.56)',
    rim: 'rgba(255, 255, 255, 0.64)',
    highlightOpacity: 0.16,
    shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.15)',
  },
  search: {
    radius: 26,
    tint: 'rgba(228, 228, 229, 0.60)',
    rim: 'rgba(255, 255, 255, 0.24)',
    highlightOpacity: 0.12,
    shadow: 'inset 0px 4px 20px 0px rgba(0, 0, 0, 0.10)',
  },
  category: {
    tint: 'rgba(255, 255, 255, 0.36)',
    activeTint: 'rgba(255, 201, 211, 0.24)',
    // Expo 55 Android's default blur at intensity 32 already adds white 35/255.
    // These overlays composite to the Figma tints above; no extra highlight layer.
    androidTint: 'rgba(255, 255, 255, 0.2582)',
    androidActiveTint: 'rgba(255, 146, 166, 0.1191)',
    border: 'transparent',
    activeBorder: 'rgba(255, 74, 117, 0.88)',
    shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.12)',
  },
  sheet: {
    topRadius: 36,
    bottomRadius: 48,
    tint: 'rgba(248, 248, 248, 0.64)',
    rim: 'rgba(255, 255, 255, 0.60)',
    highlightOpacity: 0.12,
    shadow: '0px 4px 16px 0px rgba(0, 0, 0, 0.10)',
  },
  navigation: {
    tint: 'rgba(255, 255, 255, 0.36)',
    selectedTint: 'rgba(228, 228, 229, 0.64)',
    pressedTint: 'rgba(228, 228, 229, 0.82)',
    rim: 'rgba(255, 255, 255, 0.64)',
    highlightOpacity: 0.16,
    shadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06)',
  },
  // Explicit box shadows preserve Figma alpha on Android; elevation does not.
  shadowFill: 'rgba(255, 255, 255, 0.01)',
} as const;
