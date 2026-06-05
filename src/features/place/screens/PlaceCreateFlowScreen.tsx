import { useEffect, useState } from 'react';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
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
  placeApi,
  type CreatePlaceResponse,
} from '../api/placeApi';
import { pictureApi, type UploadErrorResponse } from '../api/pictureApi';
import type { PlaceCreateDraft, PlaceLibraryPhoto, PlaceUploadPhoto } from '../model/place.types';
import { PlaceCreateStep } from '../components/create-flow/types';
import { clamp } from '../constants/mapLayout';

type PlaceCreateFlowScreenProps = {
  onClose: () => void;
};

const PHOTO_PAGE_SIZE = 60;

const PlaceCreateFlowScreen = ({ onClose }: PlaceCreateFlowScreenProps) => {
  const [step, setStep] = useState<PlaceCreateStep>(1);
  const [selectedPlaceDraft, setSelectedPlaceDraft] = useState<PlaceCreateDraft | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<PlaceUploadPhoto | null>(null);
  const [createdPlace, setCreatedPlace] = useState<CreatePlaceResponse | null>(null);
  const [photoLibraryPermission, setPhotoLibraryPermission] = useState<MediaLibrary.PermissionResponse | null>(null);
  const [photoLibraryAssets, setPhotoLibraryAssets] = useState<PlaceLibraryPhoto[]>([]);
  const [isLoadingPhotoLibrary, setIsLoadingPhotoLibrary] = useState(false);
  const [isLoadingMorePhotoLibrary, setIsLoadingMorePhotoLibrary] = useState(false);
  const [isPreparingSelectedPhoto, setIsPreparingSelectedPhoto] = useState(false);
  const [photoLibraryCursor, setPhotoLibraryCursor] = useState<string | null>(null);
  const [photoLibraryHasNextPage, setPhotoLibraryHasNextPage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
    setCreatedPlace(null);
    setStep(2);
  };

  const loadPhotoLibrary = async (after?: string) => {
    const result = await MediaLibrary.getAssetsAsync({
      after,
      first: PHOTO_PAGE_SIZE,
      mediaType: MediaLibrary.MediaType.photo,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    const mappedAssets = result.assets.map<PlaceLibraryPhoto>((asset) => ({
      filename: asset.filename,
      id: asset.id,
      uri: asset.uri,
    }));

    setPhotoLibraryAssets((currentAssets) => (after ? [...currentAssets, ...mappedAssets] : mappedAssets));
    setPhotoLibraryCursor(result.endCursor || null);
    setPhotoLibraryHasNextPage(result.hasNextPage);
  };

  const requestPhotoPermissionAndLoad = async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
      setPhotoLibraryPermission(permission);

      if (!permission.granted) {
        setPhotoLibraryAssets([]);
        setPhotoLibraryCursor(null);
        setPhotoLibraryHasNextPage(false);

        if (!permission.canAskAgain) {
          Alert.alert(
            '사진 권한이 꺼져 있어요',
            '이 화면에서 사진을 바로 보려면 설정에서 사진 접근 권한을 허용해 주세요.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정 열기', onPress: () => void Linking.openSettings() },
            ]
          );
        }

        return false;
      }

      setIsLoadingPhotoLibrary(true);
      await loadPhotoLibrary();
      return true;
    } catch {
      Alert.alert('사진을 불러오지 못했어요', '잠시 후 다시 시도해 주세요.');
      return false;
    } finally {
      setIsLoadingPhotoLibrary(false);
    }
  };

  const refreshPhotoLibrary = async () => {
    try {
      const permission = await MediaLibrary.getPermissionsAsync(false, ['photo']);
      setPhotoLibraryPermission(permission);

      if (!permission.granted) {
        await requestPhotoPermissionAndLoad();
        return;
      }

      setIsLoadingPhotoLibrary(true);
      await loadPhotoLibrary();
    } catch {
      Alert.alert('사진을 불러오지 못했어요', '잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoadingPhotoLibrary(false);
    }
  };

  const handleLoadMorePhotos = async () => {
    if (!photoLibraryHasNextPage || !photoLibraryCursor || isLoadingMorePhotoLibrary) {
      return;
    }

    setIsLoadingMorePhotoLibrary(true);

    try {
      await loadPhotoLibrary(photoLibraryCursor);
    } catch {
      Alert.alert('사진을 더 불러오지 못했어요', '잠시 후 다시 시도해 주세요.');
    } finally {
      setIsLoadingMorePhotoLibrary(false);
    }
  };

  const handleSelectPhoto = async (asset: PlaceLibraryPhoto) => {
    if (isPreparingSelectedPhoto) {
      return;
    }

    setIsPreparingSelectedPhoto(true);

    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
      const resolvedUri = assetInfo.localUri ?? asset.uri;

      if (!resolvedUri) {
        Alert.alert('사진 선택에 실패했어요', '선택한 사진 정보를 읽지 못했습니다. 다시 시도해 주세요.');
        return;
      }

      setSelectedPhoto({
        assetId: asset.id,
        name: asset.filename,
        uri: resolvedUri,
      });
    } catch {
      Alert.alert('사진 선택에 실패했어요', '선택한 사진 정보를 읽지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setIsPreparingSelectedPhoto(false);
    }
  };

  const handleOpenPhotoSettings = () => {
    void Linking.openSettings();
  };

  const handleShowLimitedLibraryPicker = async () => {
    try {
      await MediaLibrary.presentPermissionsPickerAsync(['photo']);
      await refreshPhotoLibrary();
    } catch {
      Alert.alert('권한 화면을 열지 못했어요', '설정에서 사진 접근 범위를 다시 선택해 주세요.');
    }
  };

  useEffect(() => {
    if (step !== 2) {
      return;
    }

    void refreshPhotoLibrary();
  }, [step]);

  const handleUpload = async () => {
    if (!selectedPlaceDraft || !selectedPhoto || isUploading) {
      return;
    }

    setIsUploading(true);

    try {
      const place = createdPlace ?? (await placeApi.createPlace(selectedPlaceDraft));

      if (!createdPlace) {
        setCreatedPlace(place);
      }

      const picture = await pictureApi.createPicture(selectedPhoto);
      Alert.alert('업로드 완료', `${place.name} 장소를 등록하고 사진 업로드까지 완료했어요.\n${picture.message}`, [
        { text: '확인', onPress: onClose },
      ]);
    } catch (error) {
      if (axios.isAxiosError<ApiFieldErrorResponse | ApiTokenErrorResponse | UploadErrorResponse>(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        const fieldErrorMessage = responseData && typeof responseData === 'object' && 'errors' in responseData && responseData.errors
          ? Object.values(responseData.errors)[0]
          : undefined;

        if (status === 400) {
          Alert.alert('입력값을 확인해 주세요', fieldErrorMessage ?? responseData?.message ?? '입력값이 올바르지 않습니다.');
        } else if (status === 401) {
          Alert.alert('로그인이 필요해요', responseData?.message ?? '토큰이 유효하지 않아 다시 로그인해야 합니다.');
        } else if (status === 500) {
          Alert.alert('사진 업로드에 실패했어요', responseData?.message ?? '업로드 과정에서 오류가 발생했습니다.');
        } else {
          Alert.alert('업로드에 실패했어요', responseData?.message ?? '네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
        }
      } else {
        Alert.alert('업로드에 실패했어요', '네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
      }
    } finally {
      setIsUploading(false);
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
              hasNextPage={photoLibraryHasNextPage}
              isLoadingMorePhotos={isLoadingMorePhotoLibrary}
              isLoadingPhotos={isLoadingPhotoLibrary || isPreparingSelectedPhoto}
              onLoadMorePhotos={handleLoadMorePhotos}
              onOpenSettings={handleOpenPhotoSettings}
              onRequestPermission={() => {
                void requestPhotoPermissionAndLoad();
              }}
              onSelectPhoto={handleSelectPhoto}
              onShowLimitedLibraryPicker={() => {
                void handleShowLimitedLibraryPicker();
              }}
              permissionCanAskAgain={photoLibraryPermission?.canAskAgain ?? true}
              permissionGranted={photoLibraryPermission?.granted ?? false}
              photoAccessPrivileges={photoLibraryPermission?.accessPrivileges}
              photos={photoLibraryAssets}
              selectedPhoto={selectedPhoto}
            />
          ) : (
            <CaptionStep
              isUploading={isUploading}
              placeName={selectedPlaceDraft?.name ?? ''}
              selectedPhoto={selectedPhoto}
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
