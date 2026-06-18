import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../../../shared/components/Button';
import type { PlaceLibraryPhoto, PlaceUploadPhoto } from '../../model/place.types';

type PhotoSelectStepProps = {
  hasNextPage: boolean;
  isLoadingMorePhotos: boolean;
  isLoadingPhotos: boolean;
  onLoadMorePhotos: () => void;
  onOpenSettings: () => void;
  onRequestPermission: () => void;
  onSelectPhoto: (photo: PlaceLibraryPhoto) => void;
  onShowLimitedLibraryPicker: () => void;
  permissionCanAskAgain: boolean;
  permissionGranted: boolean;
  photoAccessPrivileges?: 'all' | 'limited' | 'none';
  photos: PlaceLibraryPhoto[];
  selectedPhotos: PlaceUploadPhoto[];
};

const PhotoSelectStep = ({
  hasNextPage,
  isLoadingMorePhotos,
  isLoadingPhotos,
  onLoadMorePhotos,
  onOpenSettings,
  onRequestPermission,
  onSelectPhoto,
  onShowLimitedLibraryPicker,
  permissionCanAskAgain,
  permissionGranted,
  photoAccessPrivileges,
  photos,
  selectedPhotos,
}: PhotoSelectStepProps) => {
  const actionLabel = permissionCanAskAgain ? '사진 접근 허용하기' : '설정 열기';
  const actionPress = permissionCanAskAgain ? onRequestPermission : onOpenSettings;
  const isLimitedAccess = photoAccessPrivileges === 'limited';

  if (!permissionGranted && isLoadingPhotos) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.title}>새로 게시할 장소의{'\n'}사진을 선택해 주세요.</Text>
        <View style={styles.loadingState}>
          <ActivityIndicator color="#ff1956" size="small" />
          <Text style={styles.loadingText}>사진 접근 상태를 확인하는 중이에요.</Text>
        </View>
      </View>
    );
  }

  if (!permissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.title}>새로 게시할 장소의{'\n'}사진을 선택해 주세요.</Text>
        <Text style={styles.permissionDescription}>
          사진함 권한을 허용하면 이 화면에서 최근 사진을 바로 보여드릴 수 있어요.
        </Text>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionCardTitle}>사진 권한이 필요해요</Text>
          <Text style={styles.permissionCardBody}>
            권한을 허용하면 시스템 팝업을 거치지 않고, 이 화면에서 바로 사진을 고를 수 있어요.
          </Text>
          <Button label={actionLabel} style={styles.permissionButton} onPress={actionPress} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.photoContent}
      data={photos}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        isLoadingPhotos ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#ff1956" size="small" />
            <Text style={styles.loadingText}>사진을 불러오는 중이에요.</Text>
          </View>
        ) : (
          <View style={styles.loadingState}>
            <Text style={styles.emptyTitle}>표시할 사진이 없어요</Text>
            <Text style={styles.emptyBody}>사진이 저장된 뒤 다시 이 화면으로 오면 최근 사진부터 보여드릴게요.</Text>
          </View>
        )
      }
      ListFooterComponent={
        hasNextPage ? (
          <Button
            disabled={isLoadingMorePhotos}
            label={isLoadingMorePhotos ? '불러오는 중...' : '사진 더 불러오기'}
            loading={isLoadingMorePhotos}
            style={styles.loadMoreButton}
            onPress={onLoadMorePhotos}
          />
        ) : null
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>새로 게시할 장소의{'\n'}사진을 선택해 주세요.</Text>
          <Text style={styles.helperText}>최근 사진부터 바로 보여드릴게요. 원하는 사진을 한 번 눌러 선택하면 됩니다.</Text>

          {isLimitedAccess ? (
            <Pressable
              accessibilityRole="button"
              onPress={onShowLimitedLibraryPicker}
              style={({ pressed }) => [styles.limitedAccessChip, pressed && styles.limitedAccessChipPressed]}
            >
              <Text style={styles.limitedAccessChipText}>허용한 사진 범위 다시 선택</Text>
            </Pressable>
          ) : null}
        </View>
      }
      numColumns={3}
      onEndReached={() => {
        if (!isLoadingMorePhotos && hasNextPage) {
          onLoadMorePhotos();
        }
      }}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => {
        const selectedIndex = selectedPhotos.findIndex((photo) => photo.assetId === item.id || photo.uri === item.uri);
        const isSelected = selectedIndex >= 0;

        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelectPhoto(item)}
            style={({ pressed }) => [
              styles.photoTile,
              isSelected && styles.photoTileSelected,
              pressed && styles.photoTilePressed,
            ]}
          >
            <Image source={{ uri: item.uri }} style={styles.photoImage} />
            {isSelected ? (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{selectedIndex + 1}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  emptyBody: {
    color: '#666b78',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#3e414b',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  header: {
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  helperText: {
    color: '#666b78',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  limitedAccessChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffe6ed',
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  limitedAccessChipPressed: {
    opacity: 0.82,
  },
  limitedAccessChipText: {
    color: '#ff1956',
    fontSize: 13,
    fontWeight: '700',
  },
  loadMoreButton: {
    alignSelf: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 16,
    marginBottom: 10,
    marginTop: 18,
    minHeight: 54,
    width: '86%',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  loadingText: {
    color: '#666b78',
    fontSize: 14,
    marginTop: 12,
  },
  permissionButton: {
    marginTop: 20,
    width: '100%',
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderColor: '#ececf1',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 22,
    marginTop: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  permissionCardBody: {
    color: '#666b78',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  permissionCardTitle: {
    color: '#3e414b',
    fontSize: 20,
    fontWeight: '800',
  },
  permissionContainer: {
    flex: 1,
    paddingTop: 18,
  },
  permissionDescription: {
    color: '#666b78',
    fontSize: 16,
    lineHeight: 23,
    paddingHorizontal: 34,
    paddingTop: 14,
  },
  photoContent: {
    paddingBottom: 30,
  },
  photoImage: {
    height: '100%',
    width: '100%',
  },
  photoTile: {
    aspectRatio: 1,
    borderColor: '#fafafa',
    borderWidth: 1,
    position: 'relative',
    width: '33.3333%',
  },
  photoTilePressed: {
    opacity: 0.9,
  },
  photoTileSelected: {
    borderColor: '#ff1956',
    borderWidth: 3,
  },
  selectedBadge: {
    backgroundColor: '#ff1956',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: '#3e414b',
    fontSize: 26,
    fontWeight: '500',
    lineHeight: 34,
  },
});

export default PhotoSelectStep;
