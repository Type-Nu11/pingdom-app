import { createTheme, darkTheme, lightTheme } from '../theme';

const luminance = (hex: string) => {
  const values = hex.slice(1).match(/.{2}/g)?.map((value) => Number.parseInt(value, 16) / 255) ?? [];
  const [r, g, b] = values.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (foreground: string, background: string) => {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

describe('semantic themes', () => {
  test('light and dark schemes expose the exact same semantic color keys', () => {
    expect(Object.keys(darkTheme.colors).sort()).toEqual(Object.keys(lightTheme.colors).sort());
    expect(Object.keys(darkTheme.liquidGlass).sort()).toEqual(Object.keys(lightTheme.liquidGlass).sort());
  });

  test('creates the requested scheme without losing the active font family', () => {
    expect(createTheme('System Test', 'dark')).toMatchObject({
      colorScheme: 'dark',
      colors: { background: '#111114' },
      typography: { body: { fontFamily: 'System Test' } },
    });
  });

  test.each([
    ['light body', lightTheme.colors.text, lightTheme.colors.background, 4.5],
    ['light strong', lightTheme.colors.textStrong, lightTheme.colors.surface, 4.5],
    ['light muted', lightTheme.colors.textMuted, lightTheme.colors.background, 4.5],
    ['light on primary', lightTheme.colors.onPrimary, lightTheme.colors.primary, 4.5],
    ['dark body', darkTheme.colors.text, darkTheme.colors.background, 4.5],
    ['dark strong', darkTheme.colors.textStrong, darkTheme.colors.surface, 4.5],
    ['dark on primary', darkTheme.colors.onPrimary, darkTheme.colors.primary, 4.5],
    ['dark border', darkTheme.colors.borderEmphasis, darkTheme.colors.surface, 3],
  ] as const)('%s contrast is at least %s:1', (_name, foreground, background, minimum) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });
});
