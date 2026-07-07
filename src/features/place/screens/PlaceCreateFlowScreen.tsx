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
      Alert.alert('사진을 먼저 선택해 주세요', '사진함에서 사진을 골라야 다음 단계로 이동할 수 있어요.');
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
        '장소 좌표 확인에 실패했어요',
        getApiErrorMessage(error, '장소 좌표 토큰을 발급받지 못했습니다.')
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

      Alert.alert('업로드 완료', `${selectedPlaceDraft.name} 게시물 업로드를 완료했어요.\n${result.record.message}`, [
        { text: '확인', onPress: onClose },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error && error.message === PLACE_POST_ALREADY_EXISTS_ERROR
        ? '이미 이 장소에 게시글을 올렸어요.'
        : getApiErrorMessage(error, '사진을 서버에 저장하지 못했습니다.');

      Alert.alert('사진 업로드에 실패했어요', errorMessage);
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
