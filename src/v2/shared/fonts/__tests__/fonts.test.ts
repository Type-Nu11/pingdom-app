import * as fonts from '..';

describe('platform font fallback', () => {
  test('Android와 iOS의 native system family를 명시적으로 선택한다', () => {
    expect(fonts.getSystemFontFamily).toBeDefined();
    if (!fonts.getSystemFontFamily) return;

    expect(fonts.getSystemFontFamily('android')).toBe('sans-serif');
    expect(fonts.getSystemFontFamily('ios')).toBe('System');
    expect(fonts.getSystemFontFamily('web')).toBe('system-ui');
  });
});
