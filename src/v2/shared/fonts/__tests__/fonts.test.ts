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

describe('Pretendard weight resolution', () => {
  test.each([
    [undefined, 'PretendardStdVariable-Regular'],
    ['400', 'PretendardStdVariable-Regular'],
    ['500', 'PretendardStdVariable-Medium'],
    ['600', 'PretendardStdVariable-SemiBold'],
    ['700', 'PretendardStdVariable-Bold'],
    ['bold', 'PretendardStdVariable-Bold'],
    [800, 'PretendardStdVariable-ExtraBold'],
  ] as const)('iOS maps weight %s to the named instance %s', (weight, family) => {
    expect(fonts.resolveFontFace(fonts.PRETENDARD_FONT_FAMILY, weight, 'ios')).toEqual({ fontFamily: family });
  });

  test('keeps family and weight untouched on Android and for system fonts', () => {
    expect(fonts.resolveFontFace(fonts.PRETENDARD_FONT_FAMILY, '700', 'android'))
      .toEqual({ fontFamily: fonts.PRETENDARD_FONT_FAMILY, fontWeight: '700' });
    expect(fonts.resolveFontFace('System', '700', 'ios')).toEqual({ fontFamily: 'System', fontWeight: '700' });
  });
});
