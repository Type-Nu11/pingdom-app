import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import styled from 'styled-components/native';

import OnboardingCtaButton from '../../components/OnboardingCtaButton';
import OnboardingHeading from '../../components/OnboardingHeading';
import OnboardingProgressHeader from '../../preferences/components/OnboardingProgressHeader';

const CURRENT_STEP = 4;
const TOTAL_STEPS = 7;
const ITEM_HEIGHT = 60;
const VISIBLE = 5;
const PAD = 2;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE;

// Figma lays the rows out with a wider gap around the highlighted year.
const ROW_SHIFT: Record<number, number> = { 0: 0, 1: 5, 2: 3 };

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, index) => 1940 + index);
// Android truncates snapToInterval to integer physical pixels. At densities
// such as 2.8125, repeating the truncated interval drifts away from Yoga's
// actual row positions. Convert each absolute row offset independently.
const YEAR_OFFSETS = YEARS.map((_, index) => index * ITEM_HEIGHT);
const DEFAULT_YEAR = 2000;
const DEFAULT_INDEX = YEARS.indexOf(DEFAULT_YEAR);
const WHEEL_PADDING = { paddingVertical: PAD * ITEM_HEIGHT };
const SETTLE_DELAY_MS = 120;
function indexAtOffset(offset: number) {
  return Math.max(0, Math.min(Math.round(offset / ITEM_HEIGHT), YEARS.length - 1));
}

export type BirthYearSelectionScreenProps = Readonly<{
  onBack: () => void;
  onNext: (birthYear: number) => void;
  initialYear?: number;
}>;

export default function BirthYearSelectionScreen({ onBack, onNext, initialYear = DEFAULT_YEAR }: BirthYearSelectionScreenProps) {
  const { t } = useTranslation();
  const initialIndex = useRef(Number.isInteger(initialYear) ? indexAtOffset((initialYear - YEARS[0]) * ITEM_HEIGHT) : DEFAULT_INDEX);
  const initialOffset = useRef({ x: 0, y: initialIndex.current * ITEM_HEIGHT });
  const wheel = useRef<ScrollView>(null);
  const offset = useRef(initialOffset.current.y);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex.current);
  const [scrolling, setScrolling] = useState(false);
  const progressText = t('selectLanguage.progress', { current: CURRENT_STEP, total: TOTAL_STEPS });

  const clearSettleTimer = useCallback(() => {
    if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    settleTimer.current = null;
  }, []);
  useEffect(() => clearSettleTimer, [clearSettleTimer]);
  const settle = useCallback((finalOffset = offset.current) => {
    clearSettleTimer();
    if (!Number.isFinite(finalOffset)) return;
    const index = indexAtOffset(finalOffset);
    offset.current = index * ITEM_HEIGHT;
    // The highlight and submitted year must use the same settled row. Native
    // snapping can end between rows, especially when a fling is interrupted.
    wheel.current?.scrollTo({ y: offset.current, animated: false });
    setSelectedIndex(index);
    setScrolling(false);
  }, [clearSettleTimer]);
  const scheduleSettle = useCallback(() => {
    clearSettleTimer();
    // A drag without momentum does not reliably emit onMomentumScrollEnd.
    settleTimer.current = setTimeout(() => settle(), SETTLE_DELAY_MS);
  }, [clearSettleTimer, settle]);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextOffset = event.nativeEvent.contentOffset.y;
    if (!Number.isFinite(nextOffset)) return;
    offset.current = nextOffset;
    setSelectedIndex(indexAtOffset(nextOffset));
    if (settleTimer.current !== null) scheduleSettle();
  };
  const beginScroll = () => { clearSettleTimer(); setScrolling(true); };

  return (
    <Screen testID="birth-year-screen">
      <OnboardingProgressHeader
        backLabel={t('common.navigation.back')}
        currentStep={CURRENT_STEP}
        onBack={onBack}
        progressLabel={progressText}
        progressValueText={progressText}
        totalSteps={TOTAL_STEPS}
      />
      <Body>
        <OnboardingHeading subtitle={t('selectAge.subtitle')} title={t('selectAge.title')} />
        <WheelOuter>
          <WheelInner>
            <SelectionBox pointerEvents="none" />
            <Wheel
              ref={wheel}
              contentContainerStyle={WHEEL_PADDING}
              contentOffset={initialOffset.current}
              contentInsetAdjustmentBehavior="never"
              automaticallyAdjustContentInsets={false}
              bounces={false}
              overScrollMode="never"
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onScrollBeginDrag={beginScroll}
              onMomentumScrollBegin={beginScroll}
              onMomentumScrollEnd={event => settle(event.nativeEvent.contentOffset.y)}
              onScrollEndDrag={event => { handleScroll(event); scheduleSettle(); }}
              showsVerticalScrollIndicator={false}
              snapToOffsets={YEAR_OFFSETS}
              snapToAlignment="start"
              testID="birth-year-wheel"
            >
              {YEARS.map((year, index) => (
                <Item key={year}>
                  <Year
                    $above={index < selectedIndex}
                    $distance={Math.abs(index - selectedIndex)}
                    $shift={(ROW_SHIFT[Math.abs(index - selectedIndex)] ?? 0) * Math.sign(index - selectedIndex)}
                  >
                    {year}
                  </Year>
                </Item>
              ))}
            </Wheel>
          </WheelInner>
        </WheelOuter>
        <Spacer />
        <OnboardingCtaButton
          disabled={scrolling}
          label={t('selectAge.button')}
          onPress={() => onNext(YEARS[selectedIndex])}
          testID="birth-year-continue"
        />
      </Body>
    </Screen>
  );
}

const Screen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;

const Body = styled.View`
  flex: 1;
  gap: 0;
  padding: ${({ theme }) => theme.spacing.md}px ${({ theme }) => theme.spacing.md}px
    51px;
`;

const Spacer = styled.View`
  flex: 1;
`;

const WheelOuter = styled.View`
  height: ${WHEEL_HEIGHT + 20}px;
  justify-content: center;
  padding: 0 18px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.backgroundNeutral};
`;

const WheelInner = styled.View`
  height: ${WHEEL_HEIGHT}px;
  overflow: hidden;
`;

const SelectionBox = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: ${(WHEEL_HEIGHT - ITEM_HEIGHT) / 2}px;
  height: ${ITEM_HEIGHT}px;
  z-index: 1;
  border-width: 2px;
  border-radius: 16px;
  border-color: ${({ theme }) => theme.colors.primaryAlternative};
`;

const Wheel = styled(ScrollView)`
  height: ${WHEEL_HEIGHT}px;
`;

const Item = styled.View`
  height: ${ITEM_HEIGHT}px;
  align-items: center;
  justify-content: center;
`;

// Figma fades the years above the selection (50%, 25%) and keeps the ones
// below at the full label color.
function yearOpacity(above: boolean, distance: number): number {
  if (distance === 0) return 1;
  if (above) return distance === 1 ? 0.5 : 0.25;
  return distance <= 2 ? 1 : 0.5;
}

const Year = styled.Text<{ $above: boolean; $distance: number; $shift: number }>`
  font-size: ${({ $distance }) => ($distance === 0 ? 32 : 28)}px;
  line-height: ${({ $distance }) => ($distance === 0 ? 38 : 34)}px;
  font-weight: 700;
  text-align: center;
  transform: translateY(${({ $shift }) => $shift}px);
  color: ${({ $distance, theme }) => ($distance === 0 ? theme.colors.primary : theme.colors.labelAssistive)};
  opacity: ${({ $above, $distance }) => yearOpacity($above, $distance)};
`;
