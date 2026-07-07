import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import CaptionStep from '../components/create-flow/CaptionStep';
import PlaceCreateHeader from '../components/create-flow/PlaceCreateHeader';
import LocationStep from '../components/create-flow/LocationStep';
import PhotoSelectStep from '../components/create-flow/PhotoSelectStep';
import { getApiErrorMessage } from '../../../shared/api/getApiErrorMessage';
import useProfile from '../../profile/hooks/useProfile';
import { useCreatePlaceCoordinateToken } from '../hooks/useCreatePlaceCoordinateToken';
import {
  PLACE_POST_ALREADY_EXISTS_ERROR,
  useCreatePlaceRecord,
} from '../hooks/useCreatePlaceRecord';
import type { PlaceCategory, PlaceCreateDraft, PlaceUploadPhoto } from '../model/place.types';
import { PlaceCreateStep } from '../components/create-flow/types';
import { clamp } from '../constants/mapLayout';

type PlaceCreateFlowScreenProps = {
  onClose: () => void;
};

const PlaceCreateFlowScreen = ({ onClose }: PlaceCreateFlowScreenProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<PlaceCreateStep>(1);
  const [selectedPlaceDraft, setSelectedPlaceDraft] = useState<PlaceCreateDraft | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PlaceUploadPhoto | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('food');
  const [caption, setCaption] = useState('');
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const {
    createCoordinateToken,
    isCreatingCoordinateToken,
  } = useCreatePlaceCoordinateToken();
  const { createPlaceRecord, isUploading } = useCreatePlaceRecord();
  const { profile } = useProfile();
  const { width, height } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 560);
  const mapHeight = Math.round(clamp(height * 0.34, 240, 360));

  const goBack = () => {
    if (step === 1) {
      onClose();
      return;
    }

    setStep((currentStep) => (currentStep - 1) as PlaceCreateStep);
  };

  const goNext = () => {
    if (step === 2 && !selectedPhoto) {
      Alert.alert(
        t('placeCreate.alerts.photoRequiredTitle'),
        t('placeCreate.alerts.photoRequiredBody')
      );
      return;
    }

    if (step === 3) {
      return;
    }

    setStep((currentStep) => (currentStep + 1) as PlaceCreateStep);
  };

  const handleSelectLocation = async (draft: PlaceCreateDraft) => {
    try {
      const coordinate = await createCoordinateToken({
        baseLatitude: draft.latitude,
        baseLongitude: draft.longitude,
        kakaoPlaceId: draft.kakaoPlaceId,
      });

      setSelectedPlaceDraft({
        ...draft,
        coordinateToken: coordinate.coordinateToken,
        kakaoPlaceId: coordinate.kakaoPlaceId ?? draft.kakaoPlaceId,
      });
      setStep(2);
    } catch (error) {
      Alert.alert(
        t('placeCreate.alerts.coordinateFailedTitle'),
        getApiErrorMessage(error, t('placeCreate.alerts.coordinateFailedFallback'))
      );
    }
  };

  const handlePickPhoto = async () => {
    if (isPickingPhoto) {
      return;
    }

    setIsPickingPhoto(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        if (!permission.canAskAgain) {
          Alert.alert(
            t('placeCreate.alerts.photoPermissionBlockedTitle'),
            t('placeCreate.alerts.photoPermissionBlockedBody'),
            [
              { text: t('placeCreate.alerts.cancel'), style: 'cancel' },
              { text: t('placeCreate.alerts.openSettings'), onPress: () => void Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            t('placeCreate.alerts.photoPermissionTitle'),
            t('placeCreate.alerts.photoPermissionBody')
          );
        }

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.uri) {
        Alert.alert(
          t('placeCreate.alerts.photoSelectFailedTitle'),
          t('placeCreate.alerts.photoSelectFailedBody')
        );
        return;
      }

      setSelectedPhoto({
        name: asset.fileName ?? undefined,
        type: asset.mimeType ?? undefined,
        uri: asset.uri,
      });
    } catch {
      Alert.alert(
        t('placeCreate.alerts.photoLibraryFailedTitle'),
        t('placeCreate.alerts.photoLibraryFailedBody')
      );
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedPlaceDraft || !selectedPhoto || isUploading) {
      return;
    }

    try {
      const result = await createPlaceRecord({
        caption,
        category: selectedCategory,
        draft: selectedPlaceDraft,
        photo: selectedPhoto,
      });

      Alert.alert(t('placeCreate.alerts.uploadSuccessTitle'), t('placeCreate.alerts.uploadSuccessBody', {
        message: result.record.message,
        placeName: selectedPlaceDraft.name,
      }), [
        { text: t('placeCreate.alerts.confirm'), onPress: onClose },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error && error.message === PLACE_POST_ALREADY_EXISTS_ERROR
        ? t('placeCreate.alerts.uploadAlreadyExists')
        : getApiErrorMessage(error, t('placeCreate.alerts.uploadFailedFallback'));

      Alert.alert(t('placeCreate.alerts.uploadFailedTitle'), errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.screen, { maxWidth: maxContentWidth }]}>
          <PlaceCreateHeader
            nextDisabled={step === 2 && !selectedPhoto}
            step={step}
            onBack={goBack}
            onNext={step === 2 ? goNext : undefined}
          />

          {step === 1 ? (
            <LocationStep
              initialValue={selectedPlaceDraft}
              isSubmitting={isCreatingCoordinateToken}
              mapHeight={mapHeight}
              onNext={handleSelectLocation}
            />
          ) : step === 2 ? (
            <PhotoSelectStep
              isPickingPhoto={isPickingPhoto}
              selectedPhoto={selectedPhoto}
              onPickPhoto={handlePickPhoto}
            />
          ) : (
            <CaptionStep
              caption={caption}
              isUploading={isUploading}
              placeName={selectedPlaceDraft?.name ?? ''}
              selectedCategory={selectedCategory}
              selectedPhoto={selectedPhoto}
              username={profile?.username ?? ''}
              onChangeCaption={setCaption}
              onChangeCategory={setSelectedCategory}
              onUpload={handleUpload}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fafafa',
    flex: 1,
  },
  keyboardAvoidingView: {
    alignItems: 'center',
    flex: 1,
  },
  screen: {
    backgroundColor: '#fafafa',
    flex: 1,
    width: '100%',
  },
});

export default PlaceCreateFlowScreen;
