import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, View } from 'react-native';
import { useReducedMotion } from '../../../../shared/motion';
import { Trans, useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { useTheme } from 'styled-components/native';

import Pingdi from '../../../../../assets/v2/icons/tutorial/pingdi.svg';
import Close from '../../../../../assets/v2/icons/tutorial/close.svg';
import Next from '../../../../../assets/v2/icons/tutorial/next.svg';
import * as S from './styles';
import { getTutorialCardPlacement, MAP_TUTORIAL_STEPS, type TutorialRect } from './model';

type Props = {
  busy: boolean;
  onTransitionEnd: () => void;
  index: number;
  width: number;
  height: number;
  target: TutorialRect | null;
  username?: string;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function MapTutorialOverlay({ index, width, height, target, username, onClose, onNext, onPrevious, busy, onTransitionEnd }: Props) {
  const reduceMotion = useReducedMotion();
  const reducedMotion = useRef(reduceMotion);
  reducedMotion.current = reduceMotion;
  const opacity = useRef(new Animated.Value(1)).current;
  const previousIndex = useRef(index);
  useEffect(() => {
    if (previousIndex.current === index) return;
    previousIndex.current = index;
    opacity.setValue(reducedMotion.current ? 1 : 0.65);
    const animation = Animated.timing(opacity, {
      toValue: 1, duration: reducedMotion.current ? 0 : 750,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    });
    animation.start(({ finished }) => { if (finished) onTransitionEnd(); });
    return () => animation.stop();
  }, [index, onTransitionEnd, opacity]);

  const { t } = useTranslation();
  const { colors, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const step = MAP_TUTORIAL_STEPS[index];
  const last = index === MAP_TUTORIAL_STEPS.length - 1;
  const values = { username: username?.trim() || t('mapTutorial.guest') };
  const foreground = { color: colors.textStrong };
  const accent = <S.Accent style={{ color: colors.primary }} />;
  const { top, bottom, maxHeight } = getTutorialCardPlacement({ step, target, height,
    topInset: insets.top, bottomInset: insets.bottom });
  const cardWidth = Math.min(360, width - insets.left - insets.right - 42);
  const cardLeft = (width - cardWidth) / 2;
  const verificationTarget = step === 'verification' && target;
  const cardBelowTarget = top !== undefined && bottom === undefined;
  const line = (key: string) => <S.Body style={foreground}>
    <Trans i18nKey={key} values={values} components={{ accent }} />
  </S.Body>;
  const body = (key: string) => <S.Lines>
    {t(key, values).split('\n').map((text, i) => <S.Body key={i} style={foreground}>{text}</S.Body>)}
  </S.Lines>;

  const actions = (
    <S.Actions style={step === 'welcome' ? { justifyContent: 'flex-end' } : { gap: 12 }}>
                {index > 0 ? <S.Arrow accessibilityLabel={t('mapTutorial.previous')} accessibilityRole="button"
                  disabled={busy} hitSlop={6} onPress={onPrevious} testID="map-tutorial-previous">
                  <S.ArrowAsset pointerEvents="none" style={{ transform: [{ scaleX: -1 }] }}><Next /></S.ArrowAsset>
                </S.Arrow>  : null}
                {!last ? <S.Arrow accessibilityLabel={t('mapTutorial.next')} accessibilityRole="button"
                  disabled={busy} hitSlop={6} onPress={onNext} testID="map-tutorial-next">
                  <S.ArrowAsset pointerEvents="none"><Next /></S.ArrowAsset>
                </S.Arrow>  : null}
              </S.Actions>
  );

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
        <Rect width={width} height={height}
          fill={colorScheme === 'dark' ? 'rgba(0,0,0,0.48)' : 'rgba(0,0,0,0.3)'}
          mask="url(#tutorial-spotlight)" />
        {verificationTarget ? <Rect
          x={target.x - 3} y={target.y - 3} width={target.width + 6} height={target.height + 6}
          rx={Math.min(30, target.height / 2 + 3)} fill="transparent"
          stroke="white" strokeWidth={7}
        /> : null}
        {verificationTarget ? <Rect
          x={target.x - 3} y={target.y - 3} width={target.width + 6} height={target.height + 6}
          rx={Math.min(30, target.height / 2 + 3)} fill="transparent"
          stroke={colors.primary} strokeWidth={3}
        /> : null}
        {target && colorScheme === 'dark' ? <Rect
          x={target.x + 1} y={target.y + 1}
          width={Math.max(0, target.width - 2)} height={Math.max(0, target.height - 2)}
          rx={step === 'categories' ? 15 : 35}
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.85)" strokeWidth={1.5}
        /> : null}
      </Svg>
      {target ? <Pressable
        accessibilityLabel={t(verificationTarget ? 'visitVerification.title' : last ? 'mapTutorial.finish' : 'mapTutorial.next')}
        accessibilityRole="button"
        disabled={busy}
        onPress={onNext}
        style={{ position: 'absolute', left: target.x, top: target.y, width: target.width, height: target.height }}
        testID="map-tutorial-highlight"
      /> : null}
      <S.CardPositioner
        pointerEvents={busy ? "none" : "box-none"}
        style={{ top, bottom, justifyContent: top !== undefined && bottom !== undefined ? 'center' : top !== undefined ? 'flex-start' : 'flex-end', width: cardWidth,
          left: cardLeft }}
        testID="map-tutorial-card-position"
      >
        <S.CardShadow testID="map-tutorial-card" style={{ maxHeight }}>
        {verificationTarget ? <S.Pointer pointerEvents="none" testID="map-tutorial-pointer" style={{
          left: Math.max(24, Math.min(cardWidth - 44, target.x + target.width / 2 - cardLeft - 10)),
          ...(cardBelowTarget
            ? { top: -10, borderBottomWidth: 10, borderBottomColor: colors.surface }
            : { bottom: -10, borderTopWidth: 10, borderTopColor: colors.surface }),
        }} /> : null}
        <S.Card style={{ maxHeight }}>
          <ScrollView bounces={false} showsVerticalScrollIndicator
            key={step}
            style={{ maxHeight }}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24, paddingHorizontal: 20, gap: 6 }}>
            <S.Progress accessibilityRole="progressbar"
              accessibilityLabel={t('mapTutorial.progress', { current: index + 1, total: MAP_TUTORIAL_STEPS.length })}
              accessibilityValue={{ min: 1, max: MAP_TUTORIAL_STEPS.length, now: index + 1 }}
              testID="map-tutorial-progress">
              {MAP_TUTORIAL_STEPS.map((id, i) => <S.Dot key={id} style={{
                backgroundColor: i <= index ? colors.primary : colors.border, width: i === index ? 26 : 7,
              }} />)}
            </S.Progress>
            <Animated.View style={{ opacity }}><S.Content style={step === 'welcome' ? undefined : { gap: 12 }}>
              <S.Header>
                <S.Identity><Pingdi /><S.Title style={foreground}>{t('mapTutorial.name')}</S.Title></S.Identity>
                <S.HeaderControls>
                {step !== 'welcome' ? actions : null}
                <S.CloseButton accessibilityLabel={t('mapTutorial.close')} accessibilityRole="button" hitSlop={6}
                  disabled={busy} onPress={onClose} testID="map-tutorial-close"><Close /></S.CloseButton>
                </S.HeaderControls>
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
                  {line(verificationTarget
                    ? `mapTutorial.verification.${cardBelowTarget ? 'promptAbove' : 'promptBelow'}`
                    : `mapTutorial.${step}.prompt`)}
                  {body(`mapTutorial.${step}.body`)}
                </S.Lines>}
              </View>
              {step === 'welcome' ? actions : null}
            </S.Content></Animated.View>
          </ScrollView>
        </S.Card>
        </S.CardShadow>
      </S.CardPositioner>
    </S.Overlay>
  );
}
