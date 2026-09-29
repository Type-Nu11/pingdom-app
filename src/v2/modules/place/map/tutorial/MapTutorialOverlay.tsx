import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { useTheme } from 'styled-components/native';

import Pingdi from '../../../../../assets/v2/icons/tutorial/pingdi.svg';
import Close from '../../../../../assets/v2/icons/tutorial/close.svg';
import Next from '../../../../../assets/v2/icons/tutorial/next.svg';
import * as S from './styles';
import { getTutorialCardTop, MAP_TUTORIAL_STEPS, type TutorialRect } from './model';

type Props = {
  index: number;
  width: number;
  height: number;
  target: TutorialRect | null;
  username?: string;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function MapTutorialOverlay({ index, width, height, target, username, onClose, onNext, onPrevious }: Props) {
  const { t } = useTranslation();
  const { colors, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const step = MAP_TUTORIAL_STEPS[index];
  const last = index === MAP_TUTORIAL_STEPS.length - 1;
  const [cardHeight, setCardHeight] = useState(339);
  const values = { username: username?.trim() || t('mapTutorial.guest') };
  const foreground = { color: colors.textStrong };
  const accent = <S.Accent style={{ color: colors.primary }} />;
  const top = getTutorialCardTop({ step, target, height, cardHeight,
    topInset: insets.top, bottomInset: insets.bottom });
  const line = (key: string) => <S.Body style={foreground}>
    <Trans i18nKey={key} values={values} components={{ accent }} />
  </S.Body>;
  const body = (key: string) => <S.Lines>
    {t(key, values).split('\n').map((text, i) => <S.Body key={i} style={foreground}>{text}</S.Body>)}
  </S.Lines>;

  return (
    <S.Overlay accessibilityViewIsModal onAccessibilityEscape={onClose} testID="map-tutorial">
      <S.TouchBlocker accessible={false} onPress={() => {}} testID="map-tutorial-backdrop" />
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
        <Defs>
          <Mask id="tutorial-spotlight" x="0" y="0" width={width} height={height} maskUnits="userSpaceOnUse">
            <Rect width={width} height={height} fill="white" />
            {target ? <Rect {...target} rx={step === 'categories' ? 16 : 36} fill="black" /> : null}
          </Mask>
        </Defs>
        <Rect width={width} height={height} fill="rgba(0,0,0,0.3)" mask="url(#tutorial-spotlight)" />
      </Svg>
      {target ? <Pressable
        accessibilityLabel={t(last ? 'mapTutorial.finish' : 'mapTutorial.next')}
        accessibilityRole="button"
        onPress={onNext}
        style={{ position: 'absolute', left: target.x, top: target.y, width: target.width, height: target.height }}
        testID="map-tutorial-highlight"
      /> : null}
      <S.CardShadow
        onLayout={event => setCardHeight(event.nativeEvent.layout.height)}
        style={{ top, width: Math.min(360, width - insets.left - insets.right - 42),
          left: (width - Math.min(360, width - insets.left - insets.right - 42)) / 2 }}
        testID="map-tutorial-card"
      >
        <S.Card intensity={32} tintColor={colorScheme === 'dark' ? 'rgba(38,38,43,0.94)' : 'rgba(255,255,255,0.88)'}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}
            style={{ maxHeight: Math.max(160, height - insets.top - insets.bottom - 24) }}
            contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 20, gap: 6 }}>
            <S.Progress accessibilityRole="progressbar"
              accessibilityLabel={t('mapTutorial.progress', { current: index + 1, total: MAP_TUTORIAL_STEPS.length })}
              accessibilityValue={{ min: 1, max: MAP_TUTORIAL_STEPS.length, now: index + 1 }}
              testID="map-tutorial-progress">
              {MAP_TUTORIAL_STEPS.map((id, i) => <S.Dot key={id} style={{
                backgroundColor: i <= index ? colors.primary : colors.border, width: i === index ? 26 : 7,
              }} />)}
            </S.Progress>
            <S.Content>
              <S.Header>
                <S.Identity><Pingdi /><S.Title style={foreground}>{t('mapTutorial.name')}</S.Title></S.Identity>
                <S.CloseButton accessibilityLabel={t('mapTutorial.close')} accessibilityRole="button" hitSlop={6}
                  onPress={onClose} testID="map-tutorial-close"><Close /></S.CloseButton>
              </S.Header>
              <View accessibilityLiveRegion="polite" key={step} testID={`map-tutorial-step-${step}`}>
                {step === 'welcome' ? <S.Welcome>
                  <S.Lines>
                    {line('mapTutorial.welcome.greeting')}
                    {line('mapTutorial.welcome.introduction')}
                    {line('mapTutorial.welcome.agent')}
                  </S.Lines>
                  {body('mapTutorial.welcome.help')}
                  {line('mapTutorial.welcome.start')}
                </S.Welcome> : <S.Lines>
                  {line(`mapTutorial.${step}.prompt`)}
                  {body(`mapTutorial.${step}.body`)}
                </S.Lines>}
              </View>
              <S.Actions>
                {index > 0 ? <S.Arrow accessibilityLabel={t('mapTutorial.previous')} accessibilityRole="button"
                  hitSlop={6} onPress={onPrevious} testID="map-tutorial-previous">
                  <S.ArrowAsset pointerEvents="none" style={{ transform: [{ scaleX: -1 }] }}><Next /></S.ArrowAsset>
                </S.Arrow> : <S.ArrowSpace />}
                {!last ? <S.Arrow accessibilityLabel={t('mapTutorial.next')} accessibilityRole="button"
                  hitSlop={6} onPress={onNext} testID="map-tutorial-next">
                  <S.ArrowAsset pointerEvents="none"><Next /></S.ArrowAsset>
                </S.Arrow> : <S.ArrowSpace />}
              </S.Actions>
            </S.Content>
          </ScrollView>
        </S.Card>
      </S.CardShadow>
    </S.Overlay>
  );
}
