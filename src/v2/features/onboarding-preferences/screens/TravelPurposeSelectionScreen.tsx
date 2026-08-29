import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import ArtIcon from '../../../../assets/v2/icons/place/art_svg.svg';
import BeautyIcon from '../../../../assets/v2/icons/place/beati_svg.svg';
import CafeIcon from '../../../../assets/v2/icons/place/cafe_svg.svg';
import EtcIcon from '../../../../assets/v2/icons/place/etc_svg.svg';
import FashionIcon from '../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodIcon from '../../../../assets/v2/icons/place/food_svg.svg';
import HotPlaceIcon from '../../../../assets/v2/icons/place/hotplace.svg';
import MapIcon from '../../../../assets/v2/icons/place/maping_svg.svg';
import MusicIcon from '../../../../assets/v2/icons/place/music_svg.svg';
import PopupIcon from '../../../../assets/v2/icons/place/popup_svg.svg';
import Button from '../../../shared/components/Button';
import {
  MOTION_DURATION,
  runTimingMotion,
  useReducedMotion,
} from '../../../shared/motion';
import OnboardingProgressHeader from '../components/OnboardingProgressHeader';
import {
  TRAVEL_PURPOSE_OPTIONS,
  type OnboardingPreferenceIconId,
  type TravelPurpose,
  type TravelPurposeSelection,
} from '../model/onboardingPreference';

const DEFAULT_CURRENT_STEP = 6;
const DEFAULT_TOTAL_STEPS = 7;

const ICON_COMPONENTS = {
  art_svg: ArtIcon,
  beati_svg: BeautyIcon,
  cafe_svg: CafeIcon,
  etc_svg: EtcIcon,
  fashion_svg: FashionIcon,
  food_svg: FoodIcon,
  hotplace: HotPlaceIcon,
  maping_svg: MapIcon,
  music_svg: MusicIcon,
  popup_svg: PopupIcon,
} as const satisfies Record<OnboardingPreferenceIconId, React.ComponentType<SvgProps>>;

type TravelPurposeOptionProps = Readonly<{
  label: string;
  onPress: () => void;
  option: (typeof TRAVEL_PURPOSE_OPTIONS)[number];
  reduceMotion: boolean;
  selected: boolean;
}>;

function TravelPurposeOption({
  label,
  onPress,
  option,
  reduceMotion,
  selected,
}: TravelPurposeOptionProps) {
  const Icon = ICON_COMPONENTS[option.iconId];
  const colorProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const iconProgress = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    const colorAnimation = runTimingMotion(colorProgress, selected ? 1 : 0, {
      reduceMotion,
      useNativeDriver: false,
    });
    const iconAnimation = runTimingMotion(iconProgress, selected ? 1 : 0, {
      duration: MOTION_DURATION.press,
      reduceMotion,
      useNativeDriver: true,
    });

    return () => {
      colorAnimation?.stop();
      iconAnimation?.stop();
    };
  }, [colorProgress, iconProgress, reduceMotion, selected]);

  const iconScale = iconProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <OptionSurface style={{
      backgroundColor: colorProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF', '#FFF0F4'],
      }),
      borderColor: colorProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF', '#FFF0F4'],
      }),
    }}>
      <Option
        accessibilityLabel={label}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        onPress={onPress}
        testID={`travel-purpose-option-${option.value}`}
      >
        <Animated.View style={{
          opacity: iconProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.78, 1],
          }),
          transform: [{ scale: iconScale }],
        }}>
          <OptionIcon
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            testID={`travel-purpose-icon-${option.value}`}
          >
            <Icon
              accessible={false}
              color={selected ? '#FF1956' : '#5E5E66'}
              height={24}
              width={24}
            />
          </OptionIcon>
        </Animated.View>
        <OptionLabel>{label}</OptionLabel>
        {selected ? (
          <CheckCircle aria-hidden>
            <CheckMark>✓</CheckMark>
          </CheckCircle>
        ) : null}
      </Option>
    </OptionSurface>
  );
}

function ContinueButtonTransition({
  enabled,
  isContinuing,
  label,
  onContinue,
  reduceMotion,
}: Readonly<{
  enabled: boolean;
  isContinuing: boolean;
  label: string;
  onContinue: () => void;
  reduceMotion: boolean;
}>) {
  const progress = useRef(new Animated.Value(enabled ? 1 : 0)).current;

  useEffect(() => {
    const animation = runTimingMotion(progress, enabled ? 1 : 0, {
      reduceMotion,
      useNativeDriver: true,
    });
    return () => animation?.stop();
  }, [enabled, progress, reduceMotion]);

  return (
    <Animated.View style={{
      opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
      transform: [{
        scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.99, 1] }),
      }],
    }}>
      <Button
        disabled={!enabled}
        fullWidth
        label={label}
        loading={isContinuing}
        onPress={onContinue}
        shape="rounded"
        size="onboarding"
      />
    </Animated.View>
  );
}

export type TravelPurposeSelectionScreenProps = Readonly<{
  currentStep?: number;
  errorMessage?: string | null;
  isContinuing?: boolean;
  onBack: () => void;
  onChange: (selectedPurposes: TravelPurposeSelection) => void;
  onContinue: () => void;
  selectedPurposes: TravelPurposeSelection;
  totalSteps?: number;
}>;

export default function TravelPurposeSelectionScreen({
  currentStep = DEFAULT_CURRENT_STEP,
  errorMessage = null,
  isContinuing = false,
  onBack,
  onChange,
  onContinue,
  selectedPurposes,
  totalSteps = DEFAULT_TOTAL_STEPS,
}: TravelPurposeSelectionScreenProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const selectedPurposeSet = new Set(selectedPurposes);

  const togglePurpose = (purpose: TravelPurpose) => {
    const nextSelection = selectedPurposeSet.has(purpose)
      ? selectedPurposes.filter((selectedPurpose) => selectedPurpose !== purpose)
      : [...selectedPurposes, purpose];

    onChange(nextSelection);
  };

  return (
    <Screen edges={['right', 'left']} testID="travel-purpose-screen">
      <OnboardingProgressHeader
        backLabel={t('onboarding.travelPurposeScreen.back')}
        currentStep={currentStep}
        onBack={onBack}
        progressLabel={t('onboarding.travelPurposeScreen.progress')}
        progressValueText={t('onboarding.travelPurposeScreen.progressValue', {
          current: currentStep,
          total: totalSteps,
        })}
        totalSteps={totalSteps}
      />

      <ContentScroll testID="travel-purpose-scroll-view">
        <Content>
          <Heading>
            <Title>{t('onboarding.travelPurposeScreen.title')}</Title>
            <Description>{t('onboarding.travelPurposeScreen.description')}</Description>
          </Heading>

          <Options accessibilityRole="list">
            {TRAVEL_PURPOSE_OPTIONS.map((option) => {
              const label = t(option.labelKey);
              const selected = selectedPurposeSet.has(option.value);

              return (
                <TravelPurposeOption
                  key={option.value}
                  label={label}
                  onPress={() => togglePurpose(option.value)}
                  option={option}
                  reduceMotion={reduceMotion}
                  selected={selected}
                />
              );
            })}
          </Options>

          {errorMessage ? (
            <ErrorMessage accessibilityLiveRegion="polite" testID="travel-purpose-error">
              {errorMessage}
            </ErrorMessage>
          ) : null}
        </Content>
      </ContentScroll>

      <Footer>
        <ContinueButtonTransition
          enabled={selectedPurposes.length > 0 && !isContinuing}
          isContinuing={isContinuing}
          label={t('onboarding.travelPurposeScreen.continue')}
          onContinue={onContinue}
          reduceMotion={reduceMotion}
        />
      </Footer>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
`;

const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Heading = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => theme.typography.display.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.display.fontWeight};
  line-height: ${({ theme }) => theme.typography.display.lineHeight}px;
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Options = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ErrorMessage = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const OptionSurface = styled(Animated.View)`
  min-height: ${({ theme }) => theme.spacing.xxl + theme.spacing.md}px;
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  overflow: hidden;
`;

const Option = styled.Pressable`
  min-height: ${({ theme }) => theme.spacing.xxl + theme.spacing.md}px;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

const OptionIcon = styled.View`
  width: ${({ theme }) => theme.spacing.xl}px;
  height: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
  justify-content: center;
`;

const OptionLabel = styled.Text`
  flex: 1;
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.title.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.title.lineHeight}px;
`;

const CheckCircle = styled.View`
  width: ${({ theme }) => theme.spacing.xl}px;
  height: ${({ theme }) => theme.spacing.xl}px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const CheckMark = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.title.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
`;

const Footer = styled.View`
  padding: ${({ theme }) => theme.spacing.sm}px ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.xxl + theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.background};
`;
