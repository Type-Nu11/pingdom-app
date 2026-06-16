import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import CaptionStep from '../components/create-flow/CaptionStep';
import PlaceCreateHeader from '../components/create-flow/PlaceCreateHeader';
import LocationStep from '../components/create-flow/LocationStep';
import PhotoSelectStep from '../components/create-flow/PhotoSelectStep';
import {
  type ApiFieldErrorResponse,
  type ApiTokenErrorResponse,
} from '../api/placeApi';
import {
  type RecordApiErrorResponse,
  type RecordValidationErrorResponse,
} from '../../record/api/recordApi';
import { useCreateRecord } from '../../record/hooks/useCreateRecord';
import type { PlaceCreateDraft, PlaceUploadPhoto } from '../model/place.types';
import { PlaceCreateStep } from '../components/create-flow/types';
import { clamp } from '../constants/mapLayout';

type PlaceCreateFlowScreenProps = {
  onClose: () => void;
};

const PlaceCreateFlowScreen = ({ onClose }: PlaceCreateFlowScreenProps) => {
  const [step, setStep] = useState<PlaceCreateStep>(1);
  const [selectedPlaceDraft, setSelectedPlaceDraft] = useState<PlaceCreateDraft | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PlaceUploadPhoto | null>(null);
  const [caption, setCaption] = useState('');
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const { createRecord, isUploading } = useCreateRecord();
  const { width, height } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 560);
  const mapHeight = Math.round(clamp(height * 0.46, 310, 430));

  const goBack = () => {
    if (step === 1) {
      onClose();
      return;
    }

    setStep((currentStep) => (currentStep - 1) as PlaceCreateStep);
  };

  const goNext = () => {
    if (step === 2 && !selectedPhoto) {
      Alert.alert('사진을 먼저 선택해 주세요', '사진함에서 사진을 골라야 다음 단계로 이동할 수 있어요.');
      return;
    }

    if (step === 3) {
      return;
    }

    setStep((currentStep) => (currentStep + 1) as PlaceCreateStep);
  };

  const handleSelectLocation = (draft: PlaceCreateDraft) => {
    setSelectedPlaceDraft(draft);
    setStep(2);
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
            '사진 권한이 꺼져 있어요',
            '내 사진을 올리려면 설정에서 사진 접근 권한을 허용해 주세요.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정 열기', onPress: () => void Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert('사진 권한이 필요해요', '사진함에서 사진을 불러오려면 접근 권한을 허용해 주세요.');
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
        Alert.alert('사진 선택에 실패했어요', '선택한 사진 정보를 읽지 못했습니다. 다시 시도해 주세요.');
        return;
      }

      setSelectedPhoto({
        name: asset.fileName ?? undefined,
        type: asset.mimeType ?? undefined,
        uri: asset.uri,
      });
    } catch {
      Alert.alert('사진함을 열지 못했어요', '잠시 후 다시 시도해 주세요.');
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const getUploadErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (!axios.isAxiosError<
      | ApiFieldErrorResponse
      | ApiTokenErrorResponse
      | RecordApiErrorResponse
      | RecordValidationErrorResponse
    >(error)) {
      return fallbackMessage;
    }

    const status = error.response?.status;
    const responseData = error.response?.data;
    const fieldErrorMessage = responseData && typeof responseData === 'object' && 'errors' in responseData && responseData.errors
      ? Object.values(responseData.errors)[0]
      : undefined;
    const serverMessage = responseData && typeof responseData === 'object' && 'message' in responseData
      ? responseData.message
      : undefined;

    if (!status) {
      return '서버에 연결하지 못했어요. API 서버가 켜져 있는지 확인해 주세요.';
    }

    return fieldErrorMessage ?? serverMessage ?? fallbackMessage;
  };

  const handleUpload = async () => {
    if (!selectedPlaceDraft || !selectedPhoto || isUploading) {
      return;
    }

    try {
      if (!selectedPlaceDraft.kakaoPlaceId) {
        Alert.alert('장소를 다시 선택해 주세요', '카카오 검색 결과에서 장소를 선택해야 게시글을 업로드할 수 있어요.');
        return;
      }

      const description = caption.trim();
      const record = await createRecord({
        description: description || undefined,
        file: selectedPhoto,
        kakaoPlaceId: selectedPlaceDraft.kakaoPlaceId,
        title: selectedPlaceDraft.name,
        validPlace: true,
      });

      Alert.alert('업로드 완료', `${selectedPlaceDraft.name} 게시물 업로드를 완료했어요.\n${record.message}`, [
        { text: '확인', onPress: onClose },
      ]);
    } catch (error) {
      Alert.alert('사진 업로드에 실패했어요', getUploadErrorMessage(error, '사진을 서버에 저장하지 못했습니다.'));
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
              selectedPhoto={selectedPhoto}
              onChangeCaption={setCaption}
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
