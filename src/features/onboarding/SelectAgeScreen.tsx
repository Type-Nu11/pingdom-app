import React, { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import EscapeIcon from '../../assets/icons/escape.svg';
import ProgressBar from './components/ProgressBar';
import { useTranslation } from 'react-i18next';
import { colors } from '../../styles/colors';

const PINK = colors.primaryNormal;
const PINK_ALT = colors.primaryLight;
const BG = colors.bgAssistive;
const WHEEL_BG = colors.fillNeutral;

const ITEM_HEIGHT = 60;
const VISIBLE = 5;
const PAD = 2;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, i) => 1940 + i);
const DEFAULT_YEAR = 2000;
const DEFAULT_INDEX = YEARS.indexOf(DEFAULT_YEAR);

type Props = {
  onBack: () => void;
  onNext: (birthYear: number) => void;
};

export default function SelectAgeScreen({ onBack, onNext }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_INDEX);
  const scrollRef = useRef<ScrollView>(null);
  const { t } = useTranslation();
  const tr = { title: t('selectAge.title'), subtitle: t('selectAge.subtitle'), button: t('selectAge.button') };

  const handleScrollEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedIndex(Math.max(0, Math.min(index, YEARS.length - 1)));
  }, []);

  const getTextStyle = (diff: number) => {
    if (diff === 0) return { fontSize: 32, lineHeight: 38, color: PINK };
    if (diff === 1) return { fontSize: 28, lineHeight: 34, color: colors.labelAssistive };
    if (diff === -1) return { fontSize: 28, lineHeight: 34, color: 'rgba(118,118,128,0.5)' };
    if (diff === 2) return { fontSize: 28, lineHeight: 34, color: colors.labelAssistive };
    return { fontSize: 28, lineHeight: 34, color: 'rgba(118,118,128,0.25)' };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.headerSide}>
          <EscapeIcon width={12} height={21} />
        </Pressable>
        <ProgressBar current={3} />
        <View style={styles.headerSide} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{tr.title}</Text>
          <Text style={styles.subtitle}>{tr.subtitle}</Text>
        </View>

        <View style={styles.wheelOuter}>
          <View style={styles.wheelInner}>
            {/* selection border overlay */}
            <View style={styles.selectionBox} pointerEvents="none" />

            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleScrollEnd}
              onScrollEndDrag={handleScrollEnd}
              contentOffset={{ x: 0, y: DEFAULT_INDEX * ITEM_HEIGHT }}
              contentContainerStyle={{ paddingVertical: PAD * ITEM_HEIGHT }}
            >
              {YEARS.map((year, i) => {
                const diff = i - selectedIndex;
                const textStyle = getTextStyle(diff);
                const isCenter = diff === 0;
                return (
                  <View key={year} style={styles.item}>
                    <Text style={[styles.yearBase, textStyle, isCenter && styles.yearCenter]}>
                      {year}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => onNext(YEARS[selectedIndex])}>
          <Text style={styles.buttonText}>{tr.button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE;
const SELECTION_TOP = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    height: 105,
    paddingTop: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-start',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 52,
    gap: 18,
  },
  titleGroup: {
    gap: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.labelBlack,
    lineHeight: 41.6,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.labelAlternative,
    lineHeight: 20.8,
  },
  wheelOuter: {
    flex: 1,
    backgroundColor: WHEEL_BG,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 13,
    justifyContent: 'center',
  },
  wheelInner: {
    height: WHEEL_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionBox: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SELECTION_TOP,
    height: ITEM_HEIGHT,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: PINK_ALT,
    zIndex: 1,
    pointerEvents: 'none',
  },
  scroll: {
    height: WHEEL_HEIGHT,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearBase: {
    fontWeight: '700',
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  yearCenter: {
    color: PINK,
  },
  button: {
    height: 64,
    backgroundColor: PINK,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
});
