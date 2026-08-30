import React from 'react';
import { useTranslation } from 'react-i18next';
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
import OnboardingProgressHeader from '../components/OnboardingProgressHeader';
import {
  TRAVEL_PURPOSE_OPTIONS,
  type OnboardingPreferenceIconId,
  type TravelPurpose,
  type TravelPurposeSelection,
} from '../model/onboardingPreference';

const DEFAULT_CURRENT_STEP = 6;
const DEFAULT_TOTAL_STEPS = 7;

const contentScrollContainer = { flexGrow: 1, paddingBottom: 16 } as const;

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

      <ContentScroll
        contentContainerStyle={contentScrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID="travel-purpose-scroll-view"
      >
        <Content>
          <Heading>
            <Title>{t('onboarding.travelPurposeScreen.title')}</Title>
            <Description>{t('onboarding.travelPurposeScreen.description')}</Description>
          </Heading>

          <Options accessibilityRole="list">
            {TRAVEL_PURPOSE_OPTIONS.map((option) => {
              const Icon = ICON_COMPONENTS[option.iconId];
              const label = t(option.labelKey);
              const selected = selectedPurposeSet.has(option.value);

              return (
                <Option
                  key={option.value}
                  $selected={selected}
                  accessibilityLabel={label}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => togglePurpose(option.value)}
                  testID={`travel-purpose-option-${option.value}`}
                >
                  <OptionIcon
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    testID={`travel-purpose-icon-${option.value}`}
                  >
                    <Icon
                      accessible={false}
                      color={selected ? '#FF1956' : '#3B3B40'}
                      height={24}
                      width={24}
                    />
                  </OptionIcon>
                  <OptionLabel>{label}</OptionLabel>
                  {selected ? (
                    <CheckCircle aria-hidden>
                      <CheckMark>✓</CheckMark>
                    </CheckCircle>
                  ) : null}
                </Option>
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
        <Button
          disabled={selectedPurposes.length === 0}
          fullWidth
          label={t('onboarding.travelPurposeScreen.continue')}
          loading={isContinuing}
          onPress={onContinue}
          shape="pill"
          size="onboarding"
        />
      </Footer>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;

const ContentScroll = styled.ScrollView`
  flex: 1;
`;

const Content = styled.View`
  gap: 18px;
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
  gap: 12px;
`;

const ErrorMessage = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.caption.fontWeight};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight}px;
`;

const Option = styled.Pressable<{ $selected: boolean }>`
  min-height: 56px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 15px ${({ theme }) => theme.spacing.md}px;
  border-radius: 16px;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primarySelected : 'transparent'};
`;

const OptionIcon = styled.View`
  width: ${({ theme }) => theme.spacing.lg}px;
  height: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
  justify-content: center;
`;

const OptionLabel = styled.Text`
  flex: 1;
  flex-shrink: 1;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.onboardingAction.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.onboardingAction.fontWeight};
  line-height: ${({ theme }) => theme.typography.onboardingAction.lineHeight}px;
`;

const CheckCircle = styled.View`
  width: 30px;
  height: 30px;
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
    ${({ theme }) => theme.spacing.xl + theme.spacing.xs}px;
  background-color: ${({ theme }) => theme.colors.backgroundAssistive};
`;
