import { useCallback } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SavedPlacesGallery from '../components/SavedPlacesGallery';
import ProfileHeader from '../components/ProfileHeader';
import { useBookmarkedPlaces } from '../../place/hooks/useBookmarkedPlaces';
import { useProfile } from '../hooks/useProfile';
import BackIcon from '../../../assets/v2/icons/header/back.svg';

type ProfileScreenProps = {
  onBack: () => void;
  onOpenBookmarkedPlace: (placeId: number) => void;
  onOpenApiCheck: () => void;
  onOpenSettings: () => void;
};

const ProfileScreen = ({
  onBack,
  onOpenBookmarkedPlace,
  onOpenApiCheck,
  onOpenSettings,
}: ProfileScreenProps) => {
  const { width } = useWindowDimensions();
  const {
    isLoading: isProfileLoading,
    profile,
  } = useProfile();
  const {
    isError: isBookmarkedPlacesError,
    isLoading: isBookmarkedPlacesLoading,
    places: bookmarkedPlaces,
    refetch: refetchBookmarkedPlaces,
  } = useBookmarkedPlaces();
  const maxContentWidth = Math.min(width, 560);
  const gridItemSize = Math.floor(maxContentWidth / 3);
  const handleBack = useCallback(onBack, [onBack]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <View style={[styles.screen, { maxWidth: maxContentWidth }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          style={styles.backButton}
          onPress={handleBack}
        >
          <BackIcon width={44} height={44} />
        </Pressable>

        <ProfileHeader
          isLoading={isProfileLoading}
          onOpenApiCheck={onOpenApiCheck}
          onOpenSettings={onOpenSettings}
          profile={profile}
        />
        <SavedPlacesGallery
          isError={isBookmarkedPlacesError}
          isLoading={isBookmarkedPlacesLoading}
          itemSize={gridItemSize}
          onPlacePress={(place) => onOpenBookmarkedPlace(place.id)}
          onRetry={() => void refetchBookmarkedPlaces()}
          places={bookmarkedPlaces}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    left: 24,
    position: 'absolute',
    top: 54,
    zIndex: 8,
  },
  safeArea: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    flex: 1,
  },
  screen: {
    backgroundColor: '#fafafa',
    flex: 1,
    width: '100%',
  },
});

export default ProfileScreen;
