import { createTheme, darkTheme, lightTheme } from '../theme';
import { textStyleCss } from '../typography';

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
      colors: { background: '#0F0F11' },
      typography: { body: { fontFamily: 'System Test' } },
    });
  });

  test.each([
    ['light body', lightTheme.colors.text, lightTheme.colors.background, 4.5],
    ['light strong', lightTheme.colors.textStrong, lightTheme.colors.surface, 4.5],
    ['light muted', lightTheme.colors.textMuted, lightTheme.colors.background, 4.5],
    ['light on primary', lightTheme.colors.onPrimary, lightTheme.colors.primaryAction, 4.5],
    ['dark body', darkTheme.colors.text, darkTheme.colors.background, 4.5],
    ['dark strong', darkTheme.colors.textStrong, darkTheme.colors.surface, 4.5],
    ['dark on primary', darkTheme.colors.onPrimary, darkTheme.colors.primaryAction, 4.5],
    ['light pressed primary', lightTheme.colors.onPrimary, lightTheme.colors.primaryActionPressed, 4.5],
    ['dark pressed primary', darkTheme.colors.onPrimary, darkTheme.colors.primaryActionPressed, 4.5],
    ['dark border', darkTheme.colors.borderEmphasis, darkTheme.colors.surface, 3],
  ] as const)('%s contrast is at least %s:1', (_name, foreground, background, minimum) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });
});

describe('Figma text styles', () => {
  test('every Figma style uses the library 1.3 line-height multiplier rounded to whole pixels', () => {
    const figmaKeys = [
      'headline1Bold', 'headline2Bold', 'headline2Medium', 'bodyRegular', 'bodyMedium',
      'labelBold', 'labelMedium', 'labelRegular', 'captionBold', 'captionMedium', 'captionRegular',
    ] as const;
    for (const key of figmaKeys) {
      const style = lightTheme.typography[key];
      expect(style.lineHeight).toBe(Math.round(style.fontSize * 1.3));
    }
  });

  test('textStyleCss renders size, weight and line height declarations', () => {
    expect(textStyleCss(lightTheme.typography.labelMedium)).toBe('font-size: 14px; font-weight: 500; line-height: 18px;');
  });
});

test.each([
  ['header', darkTheme.liquidGlass.header.tint],
  ['category', darkTheme.liquidGlass.category.tint],
  ['Android category', darkTheme.liquidGlass.category.androidTint],
  ['navigation', darkTheme.liquidGlass.navigation.tint],
  ['floating navigation', darkTheme.liquidGlass.navigation.softTint],
])('dark %s glass is visibly raised above the app background', (_name, tint) => {
  const [r, g, b, alpha] = tint.match(/[\d.]+/g)!.map(Number);
  const base = darkTheme.colors.background.match(/[a-f\d]{2}/gi)!.map(value => parseInt(value, 16));
  const composite = '#' + [r, g, b].map((channel, i) => Math.round(channel * alpha + base[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('');
  expect(contrast(composite, darkTheme.colors.background)).toBeGreaterThanOrEqual(1.5);
});

test('dark selected glass controls use white foreground on the brighter pink tint', () => {
  expect(darkTheme.liquidGlass.category).toMatchObject({ activeForeground: '#FFFFFF' });
});

test.each([
  ['statusSuccess', '#20C831', '#3FD957'],
  ['statusError', '#EE2B2B', '#FF5A5A'],
  ['staticWhite', '#FFFFFF', '#FFFFFF'],
  ['staticBlack', '#000000', '#000000'],
  ['shadowFloat', 'rgba(0, 0, 0, 0.12)', 'rgba(0, 0, 0, 0.40)'],
  ['shadowKnob', 'rgba(0, 0, 0, 0.16)', 'rgba(0, 0, 0, 0.40)'],
] as const)('%s follows the Figma Light/Dark variable values', (key, light, dark) => {
  expect(lightTheme.colors[key]).toBe(light);
  expect(darkTheme.colors[key]).toBe(dark);
});
