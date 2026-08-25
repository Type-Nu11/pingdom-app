import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

import ArtIcon from '../../../../assets/v2/icons/place/art_svg.svg';
import BeautyIcon from '../../../../assets/v2/icons/place/beati_svg.svg';
import CafeIcon from '../../../../assets/v2/icons/place/cafe_svg.svg';
import CameraIcon from '../../../../assets/v2/icons/place/Camera.svg';
import CleanIcon from '../../../../assets/v2/icons/place/Clean.svg';
import DeliciousIcon from '../../../../assets/v2/icons/place/Delicious.svg';
import EtcIcon from '../../../../assets/v2/icons/place/etc_svg.svg';
import FashionIcon from '../../../../assets/v2/icons/place/fashion_svg.svg';
import FoodIcon from '../../../../assets/v2/icons/place/food_svg.svg';
import HeritageIcon from '../../../../assets/v2/icons/place/heritage.svg';
import MultilingualIcon from '../../../../assets/v2/icons/place/Group.svg';
import KindIcon from '../../../../assets/v2/icons/place/Kind.svg';
import MusicIcon from '../../../../assets/v2/icons/place/music_svg.svg';
import ParkingIcon from '../../../../assets/v2/icons/place/Park.svg';
import EasyToFindIcon from '../../../../assets/v2/icons/place/Pin.svg';
import PopupIcon from '../../../../assets/v2/icons/place/popup_svg.svg';
import ReportPinIcon from '../../../../assets/v2/icons/place/report_pin.svg';
import SearchBackIcon from '../../../../assets/v2/icons/place/search_back.svg';
import UploaderCameraIcon from '../../../../assets/v2/icons/place/uploader_camera.svg';
import SuccessPlaceIcon from '../../../../assets/v2/icons/place/sucessplace.svg';
import Button from '../../../shared/components/Button';
import KakaoMapAdapter from '../../map/components/KakaoMapAdapter';
import { useCurrentLocation } from '../../map/hooks/useCurrentLocation';
import { FALLBACK_COORDINATE } from '../../map/model/mapFixtures';
import type { Coordinate, MapMarker } from '../../map/model/map.types';
import ReportField from '../components/ReportField';
import ReportStepHeader from '../components/ReportStepHeader';
import {
  hasValidationErrors,
  initialPlaceReportDraft,
  PLACE_REPORT_CATEGORIES,
  PLACE_REPORT_FEATURES,
  type PlaceReportCategoryId,
  type PlaceReportDraft,
  type PlaceReportFeatureId,
  type PlaceReportStep,
  type PlaceReportValidationErrors,
  validatePlaceReportStep,
} from '../model/placeReport';

type Props = {
  navigation: {
    goBack: () => void;
  };
};
type CategoryIcon = React.ComponentType<SvgProps>;

const CATEGORY_ICONS: Partial<Record<PlaceReportCategoryId, CategoryIcon>> = {
  beauty: BeautyIcon,
  cafe: CafeIcon,
  exhibition: ArtIcon,
  fashion: FashionIcon,
  heritage: HeritageIcon,
  music: MusicIcon,
  other: EtcIcon,
  popup: PopupIcon,
  restaurant: FoodIcon,
};
const FEATURE_ICONS: Record<PlaceReportFeatureId, CategoryIcon> = {
  clean: CleanIcon,
  delicious: DeliciousIcon,
  easyToFind: EasyToFindIcon,
  kind: KindIcon,
  multilingual: MultilingualIcon,
  parking: ParkingIcon,
  photoSpot: CameraIcon,
};
const CATEGORY_ROWS: PlaceReportCategoryId[][] = [
  ['restaurant', 'music', 'popup'],
  ['beauty', 'exhibition', 'cafe', 'fashion'],
  ['heritage', 'other'],
];

export default function PlaceReportFlowScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<PlaceReportDraft>(initialPlaceReportDraft);
  const [errors, setErrors] = useState<PlaceReportValidationErrors>({});
  const [step, setStep] = useState<PlaceReportStep>(1);

  const updateDraft = useCallback((patch: Partial<PlaceReportDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const handleBack = useCallback(() => {
    setErrors({});
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else navigation.goBack();
  }, [navigation, step]);

  useEffect(() => {
    if (Platform.OS !== 'android' || step === 'complete') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack, step]);

  const continueFrom = (currentStep: 1 | 2) => {
    const nextErrors = validatePlaceReportStep(draft, currentStep);
    setErrors(nextErrors);
    if (!hasValidationErrors(nextErrors)) setStep(currentStep === 1 ? 2 : 3);
  };

  const submit = () => {
    const nextErrors = validatePlaceReportStep(draft, 3);
    setErrors(nextErrors);
    if (!hasValidationErrors(nextErrors)) setStep('complete');
  };

  const showPreparedState = () => {
    Alert.alert(t('placeReport.prepared.title'), t('placeReport.prepared.body'));
  };

  if (step === 'complete') {
    return (
      <CompleteStep
        onInterestPress={showPreparedState}
        onPlaceCardPress={showPreparedState}
        placeName={draft.placeName}
      />
    );
  }

  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-place-report-flow">
      <KeyboardFrame behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {step === 1 ? (
          <SelectSpotStep
            draft={draft}
            errors={errors}
            onBack={handleBack}
            onContinue={() => continueFrom(1)}
            onUpdate={updateDraft}
          />
        ) : step === 2 ? (
          <PlaceInfoStep
            draft={draft}
            errors={errors}
            onBack={handleBack}
            onContinue={() => continueFrom(2)}
            onUpdate={updateDraft}
          />
        ) : (
          <FirstRecordStep
            draft={draft}
            errors={errors}
            onBack={handleBack}
            onSubmit={submit}
            onUpdate={updateDraft}
          />
        )}
      </KeyboardFrame>
    </Screen>
  );
}

type SharedStepProps = Readonly<{
  draft: PlaceReportDraft;
  onBack: () => void;
  onUpdate: (patch: Partial<PlaceReportDraft>) => void;
}>;

function StepHeader({ currentStep, onBack }: { currentStep: 1 | 2 | 3; onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <ReportStepHeader
      backLabel={t('placeReport.back')}
      currentStep={currentStep}
      onBack={onBack}
      progressLabel={t('placeReport.progress')}
      progressValueText={t('placeReport.progressValue', { current: currentStep, total: 3 })}
    />
  );
}

function SelectSpotStep({
  draft,
  errors,
  onBack,
  onContinue,
  onUpdate,
}: SharedStepProps & Readonly<{
  errors: PlaceReportValidationErrors;
  onContinue: () => void;
}>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const location = useCurrentLocation();
  const [center, setCenter] = useState<Coordinate>(
    draft.coordinate ?? location.coordinate ?? FALLBACK_COORDINATE,
  );
  const didResolveInitialCamera = useRef(false);

  useEffect(() => {
    if (location.status === 'granted' && !draft.coordinate) setCenter(location.coordinate);
  }, [draft.coordinate, location.coordinate, location.status]);

  const selectCoordinate = (coordinate: Coordinate) => {
    if (!didResolveInitialCamera.current) {
      const isNearRequestedCenter = Math.abs(coordinate.lat - center.lat) < 0.5
        && Math.abs(coordinate.lng - center.lng) < 0.5;
      if (!isNearRequestedCenter) return;
      didResolveInitialCamera.current = true;
    }
    onUpdate({ coordinate });
  };
  const markers: MapMarker[] = draft.coordinate ? [{
    ...draft.coordinate,
    category: 'etc',
    id: 'place-report-selection',
    markerType: 'search',
    name: t('placeReport.selectSpot.locationReady'),
  }] : [];

  return (
    <StepRoot>
      <TopSection>
        <StepHeader currentStep={1} onBack={onBack} />
        <Headline accessibilityRole="header">{t('placeReport.selectSpot.title')}</Headline>
        <SearchShell>
          <SearchControl>
            <SearchBackIcon aria-hidden height={18} width={10} />
            <SearchInput
              accessibilityLabel={t('placeReport.selectSpot.searchAccessibility')}
              onChangeText={(locationQuery) => onUpdate({ locationQuery })}
              onSubmitEditing={Keyboard.dismiss}
              placeholder={t('placeReport.selectSpot.search')}
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="search"
              testID="v2-place-report-location-search"
              value={draft.locationQuery}
            />
          </SearchControl>
        </SearchShell>
      </TopSection>
      <MapArea accessibilityLabel={t('placeReport.selectSpot.searchAccessibility')}>
        <KakaoMapAdapter
          center={center}
          followUser={false}
          markers={markers}
          onCameraIdle={selectCoordinate}
          userCoordinate={location.coordinate ?? undefined}
          zoomLevel={16}
        />
        <ReportPin pointerEvents="none">
          <ReportPinIcon aria-hidden height={49} width={43} />
        </ReportPin>
        {location.status === 'loading' ? (
          <MapLoading accessibilityLiveRegion="polite">
            <ActivityIndicator color={theme.colors.primary} />
          </MapLoading>
        ) : null}
        {errors.location ? (
          <MapMessage accessibilityLiveRegion="polite" $error>
            {t('placeReport.selectSpot.locationError')}
          </MapMessage>
        ) : location.status === 'denied' ? (
          <MapMessage accessibilityLiveRegion="polite" $error>
            {t('map.location.deniedTitle')}
          </MapMessage>
        ) : location.status === 'failed' ? (
          <MapMessage accessibilityLiveRegion="polite" $error>
            {t('map.location.failedTitle')}
          </MapMessage>
        ) : null}
      </MapArea>
      <BottomSection>
        <ReportField
          accessibilityLabel={t('placeReport.field.detailAddress')}
          error={errors.detailAddress ? t('placeReport.validation.detailAddress') : undefined}
          label={t('placeReport.field.detailAddress')}
          maxLength={120}
          onChangeText={(detailAddress) => onUpdate({ detailAddress })}
          placeholder={t('placeReport.field.detailAddressPlaceholder')}
          returnKeyType="done"
          testID="v2-place-report-address"
          value={draft.detailAddress}
        />
        <Button
          fullWidth
          label={t('placeReport.selectSpot.choose')}
          onPress={onContinue}
          shape="pill"
          size="onboarding"
          testID="v2-place-report-step1-next"
        />
      </BottomSection>
    </StepRoot>
  );
}

function PlaceInfoStep({
  draft,
  errors,
  onBack,
  onContinue,
  onUpdate,
}: SharedStepProps & Readonly<{
  errors: PlaceReportValidationErrors;
  onContinue: () => void;
}>) {
  const { t } = useTranslation();
  return (
    <StepRoot>
      <StepScroll keyboardShouldPersistTaps="handled">
        <ScrollBody>
          <StepHeader currentStep={2} onBack={onBack} />
          <Headline accessibilityRole="header">{t('placeReport.placeInfo.title')}</Headline>
          <ReportField
            error={errors.placeName ? t('placeReport.validation.placeName') : undefined}
            label={t('placeReport.field.placeName')}
            maxLength={80}
            onChangeText={(placeName) => onUpdate({ placeName })}
            placeholder={t('placeReport.field.placeNamePlaceholder')}
            testID="v2-place-report-name"
            value={draft.placeName}
          />
          <FieldGroup>
            <FieldLabel>{t('placeReport.field.category')}</FieldLabel>
            <CategoryRows>
              {CATEGORY_ROWS.map((row) => (
                <CategoryRow key={row.join('-')}>
                  {row.map((categoryId) => {
                    const category = PLACE_REPORT_CATEGORIES.find(({ id }) => id === categoryId)!;
                    const selected = draft.category === category.id;
                    const Icon = CATEGORY_ICONS[category.id];
                    const label = t(`placeReport.category.${category.id}`);
                    return (
                      <ChoiceChip
                        key={category.id}
                        $selected={selected}
                        accessibilityLabel={label}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => onUpdate({ category: category.id })}
                        testID={`v2-place-report-category-${category.id}`}
                      >
                        {Icon ? <Icon aria-hidden color={selected ? '#FF1956' : '#767680'} height={18} width={20} /> : null}
                        <ChoiceLabel $selected={selected}>{label}</ChoiceLabel>
                      </ChoiceChip>
                    );
                  })}
                </CategoryRow>
              ))}
            </CategoryRows>
            {errors.category ? (
              <ValidationText accessibilityLiveRegion="polite">
                {t('placeReport.validation.category')}
              </ValidationText>
            ) : null}
          </FieldGroup>
          <ReportField
            error={errors.operationHours ? t('placeReport.validation.operationHours') : undefined}
            label={t('placeReport.field.operationHours')}
            maxLength={80}
            onChangeText={(operationHours) => onUpdate({ operationHours })}
            placeholder={t('placeReport.field.operationHoursPlaceholder')}
            testID="v2-place-report-hours"
            value={draft.operationHours}
          />
        </ScrollBody>
      </StepScroll>
      <Footer>
        <Button
          fullWidth
          label={t('placeReport.placeInfo.next')}
          onPress={onContinue}
          shape="pill"
          size="onboarding"
          testID="v2-place-report-step2-next"
        />
      </Footer>
    </StepRoot>
  );
}

function FirstRecordStep({ draft, errors, onBack, onSubmit, onUpdate }: SharedStepProps & {
  errors: PlaceReportValidationErrors;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();

  const pickPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('placeReport.photo.permissionTitle'), t('placeReport.photo.permissionBody'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ['images'],
        quality: 0.85,
        selectionLimit: 1,
      });
      if (!result.canceled && result.assets[0]) onUpdate({ photoUri: result.assets[0].uri });
    } catch {
      Alert.alert(t('placeReport.photo.errorTitle'), t('placeReport.photo.errorBody'));
    }
  };

  const toggleFeature = (feature: PlaceReportFeatureId) => {
    onUpdate({
      features: draft.features.includes(feature)
        ? draft.features.filter((item) => item !== feature)
        : [...draft.features, feature],
    });
  };

  return (
    <StepRoot>
      <StepScroll keyboardShouldPersistTaps="handled">
        <ScrollBody>
          <StepHeader currentStep={3} onBack={onBack} />
          <Headline accessibilityRole="header">{t('placeReport.firstRecord.title')}</Headline>
          {draft.photoUri ? (
            <PhotoPreviewButton
              accessibilityLabel={t('placeReport.photo.delete')}
              accessibilityRole="button"
              onPress={() => onUpdate({ photoUri: null })}
            >
              <PhotoPreview
                accessibilityLabel={t('placeReport.photo.selected')}
                source={{ uri: draft.photoUri }}
              />
              <PhotoRemoveText>{t('placeReport.photo.delete')}</PhotoRemoveText>
            </PhotoPreviewButton>
          ) : (
            <PhotoPicker
              accessibilityLabel={t('placeReport.photo.add')}
              accessibilityRole="button"
              onPress={() => void pickPhoto()}
              testID="v2-place-report-photo-picker"
            >
              <UploaderCameraIcon aria-hidden height={28} width={28} />
              <PhotoLabel>{t('placeReport.field.photo')}</PhotoLabel>
            </PhotoPicker>
          )}
          {errors.photo ? (
            <ValidationText accessibilityLiveRegion="polite">
              {t('placeReport.validation.photo')}
            </ValidationText>
          ) : null}
          <ReportField
            label={t('placeReport.field.caption')}
            maxLength={160}
            onChangeText={(caption) => onUpdate({ caption })}
            placeholder={t('placeReport.field.captionPlaceholder')}
            testID="v2-place-report-caption"
            value={draft.caption}
          />
          <FieldGroup>
            <FieldLabel>{t('placeReport.field.features')}</FieldLabel>
            <ChipWrap>
              {PLACE_REPORT_FEATURES.map((feature) => {
                const selected = draft.features.includes(feature.id);
                const label = t(`placeReport.feature.${feature.id}`);
                const Icon = FEATURE_ICONS[feature.id];
                return (
                  <ChoiceChip
                    key={feature.id}
                    $selected={selected}
                    accessibilityLabel={label}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggleFeature(feature.id)}
                  >
                    <Icon aria-hidden height={16} width={19} />
                    <ChoiceLabel $selected={selected}>{label}</ChoiceLabel>
                  </ChoiceChip>
                );
              })}
            </ChipWrap>
          </FieldGroup>
        </ScrollBody>
      </StepScroll>
      <Footer>
        <Button
          fullWidth
          label={t('placeReport.firstRecord.submit')}
          onPress={onSubmit}
          shape="pill"
          size="onboarding"
          testID="v2-place-report-submit"
        />
      </Footer>
    </StepRoot>
  );
}

function CompleteStep({
  onInterestPress,
  onPlaceCardPress,
  placeName,
}: Readonly<{
  onInterestPress: () => void;
  onPlaceCardPress: () => void;
  placeName: string;
}>) {
  const { t } = useTranslation();
  return (
    <Screen edges={['top', 'right', 'bottom', 'left']} testID="v2-place-report-complete">
      <CompleteScroll
        contentContainerStyle={{ gap: 16, paddingBottom: 24, paddingHorizontal: 16, paddingTop: 60 }}
      >
        <SuccessPlaceIcon aria-hidden height={76} width={64} />
        <Headline accessibilityRole="header">{t('placeReport.complete.title')}</Headline>
        <FirstRecorderCard>
          <Badge><BadgeText>{t('placeReport.card.badge')}</BadgeText></Badge>
          <CompletePlaceName>{placeName}</CompletePlaceName>
          <CardDescription>{t('placeReport.card.description')}</CardDescription>
        </FirstRecorderCard>
        <Notice>{t('placeReport.complete.notice')}</Notice>
      </CompleteScroll>
      <CompleteFooter>
        <Button
          accessibilityHint={t('placeReport.prepared.body')}
          fullWidth
          label={t('placeReport.complete.cardAction')}
          onPress={onPlaceCardPress}
          shape="pill"
          size="onboarding"
          testID="v2-place-report-card-action"
        />
        <InterestAction
          accessibilityHint={t('placeReport.prepared.body')}
          accessibilityRole="button"
          onPress={onInterestPress}
          testID="v2-place-report-interest-action"
        >
          <InterestText>{t('placeReport.complete.interestAction')}</InterestText>
        </InterestAction>
      </CompleteFooter>
    </Screen>
  );
}

const Screen = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;
const KeyboardFrame = styled(KeyboardAvoidingView)`flex: 1;`;
const StepRoot = styled.View`flex: 1;`;
const TopSection = styled.View`
  gap: 16px;
  padding: 0 16px 16px;
`;
const Headline = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 24px;
  font-weight: 700;
  line-height: 31px;
`;
const SearchShell = styled.View`
  padding: 8px;
  border-radius: 30px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;
const SearchControl = styled.View`
  height: 46px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  border-radius: 26px;
  background-color: ${({ theme }) => theme.colors.border};
`;
const SearchInput = styled.TextInput`
  flex: 1;
  height: 46px;
  padding: 0;
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 500;
`;
const MapArea = styled.View`
  min-height: 220px;
  flex: 1;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const ReportPin = styled.View`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 43px;
  height: 49px;
  margin-top: -39px;
  margin-left: -22px;
`;
const MapLoading = styled.View`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;
const MapMessage = styled.Text<{ $error: boolean }>`
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: 16px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ $error, theme }) =>
    $error ? theme.colors.dangerSoft : theme.colors.surface};
  color: ${({ $error, theme }) => $error ? theme.colors.danger : theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  text-align: center;
`;
const BottomSection = styled.View`
  gap: 24px;
  padding: 20px 16px 24px;
  background-color: ${({ theme }) => theme.colors.surface};
`;
const StepScroll = styled.ScrollView`flex: 1;`;
const ScrollBody = styled.View`
  gap: 16px;
  padding: 0 16px 24px;
`;
const Footer = styled.View`
  padding: 8px 16px 24px;
  background-color: ${({ theme }) => theme.colors.surface};
`;
const FieldGroup = styled.View`gap: 8px;`;
const FieldLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
`;
const ChipWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;
const CategoryRows = styled.View`gap: 8px;`;
const CategoryRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;
const ChoiceChip = styled.Pressable<{ $selected: boolean }>`
  min-height: 34px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border-width: 1px;
  border-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.focus : theme.colors.inputBackground};
  border-radius: 16px;
  background-color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primarySoft : theme.colors.inputBackground};
`;
const ChoiceLabel = styled.Text<{ $selected: boolean }>`
  color: ${({ $selected, theme }) => $selected ? theme.colors.primary : theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
`;
const ValidationText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const PhotoPicker = styled.Pressable`
  width: 100%;
  height: 180px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-width: 1px;
  border-style: dashed;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const PhotoLabel = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  font-weight: 500;
`;
const PhotoPreviewButton = styled.Pressable`
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.md}px;
`;
const PhotoPreview = styled.Image`width: 100%; height: 100%;`;
const PhotoRemoveText = styled.Text`
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;
const CompleteScroll = styled.ScrollView`flex: 1;`;
const FirstRecorderCard = styled.View`
  gap: 8px;
  padding: 20px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.surfaceMuted};
`;
const Badge = styled.View`
  align-self: flex-start;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radius.full}px;
  background-color: ${({ theme }) => theme.colors.primary};
`;
const BadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
`;
const CompletePlaceName = styled.Text`
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: 18px;
  font-weight: 700;
  line-height: 23px;
`;
const CardDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 18px;
`;
const Notice = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 12px;
  line-height: 16px;
`;
const CompleteFooter = styled.View`
  align-items: center;
  gap: 8px;
  padding: 8px 16px 24px;
`;
const InterestAction = styled.Pressable`
  min-height: 32px;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
`;
const InterestText = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
  font-weight: 500;
  line-height: 21px;
`;
