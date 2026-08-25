import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import HotPlaceIcon from '../../../assets/v2/icons/hotplace.svg';
import { usePlaceRegistrantUsernames } from '../hooks/usePlaceRegistrantUsernames';
import type { RecommendedPlace } from '../model/place.types';

type HotPlaceListProps = {
  isError?: boolean;
  isLoading?: boolean;
  onPlacePress?: (place: RecommendedPlace) => void;
  places: RecommendedPlace[];
};

const HotPlaceList = ({
  isError = false,
  isLoading = false,
  onPlacePress,
  places,
}: HotPlaceListProps) => {
  const { isLoadingByPlaceId, usernamesByPlaceId } = usePlaceRegistrantUsernames(places);
  const stateText = isLoading
    ? '추천 장소를 불러오고 있어요'
    : isError
      ? '추천 장소를 불러오지 못했어요'
      : places.length === 0
        ? '주변 추천 장소가 아직 없어요'
        : null;

  const formatRegistrantUsername = (username: string | undefined, isLoading = false) => {
    if (!username) {
      return isLoading ? '등록자 확인 중' : '등록자 없음';
    }

    return `${username}`;
  };

  return (
    <View style={styles.hotSection}>
      <View style={styles.hotTitleRow}>
        <HotPlaceIcon height={24} width={20} />
        <Text style={styles.hotTitle}>우리 지역 핫플!</Text>
      </View>

      {stateText ? (
        <View style={styles.stateRow}>
          <Text style={styles.stateText}>{stateText}</Text>
        </View>
      ) : places.map((place, index) => {
        const rank = index + 1;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${place.name} 추천 장소 보기`}
            key={place.id}
            style={styles.hotRow}
            onPress={() => onPlacePress?.(place)}
          >
            <View style={styles.rankColumn}>
              <Text
                adjustsFontSizeToFit
                minimumFontScale={0.78}
                numberOfLines={1}
                style={styles.rankNumber}
              >
                {rank}.
              </Text>
            </View>
            <View style={styles.profileIcon}>
              <View style={styles.profileHead} />
              <View style={styles.profileBody} />
            </View>
            <View style={styles.hotTextGroup}>
              <Text numberOfLines={1} style={styles.hotLocation}>{place.name}</Text>
              <Text numberOfLines={1} style={styles.hotUsername}>
                {formatRegistrantUsername(
                  usernamesByPlaceId[String(place.id)] ?? place.username,
                  isLoadingByPlaceId[String(place.id)]
                )}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  hotSection: {
    paddingTop: 24,
  },
  hotTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 5,
    paddingHorizontal: 16,
  },
  hotTitle: {
    color: '#3f4149',
    fontSize: 27,
    fontWeight: '900',
  },
  hotRow: {
    alignItems: 'center',
    borderTopColor: '#ececf0',
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 72,
    paddingHorizontal: 16,
  },
  hotTextGroup: {
    flex: 1,
  },
  rankColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    width: 25,
  },
  rankNumber: {
    color: '#767680',
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
    width: '100%',
  },
  profileIcon: {
    alignItems: 'center',
    borderColor: '#676873',
    borderRadius: 16,
    borderWidth: 3.5,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
    width: 32,
  },
  profileHead: {
    backgroundColor: '#676873',
    borderRadius: 5,
    height: 10,
    marginTop: 2,
    width: 10,
  },
  profileBody: {
    backgroundColor: '#676873',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    height: 12,
    marginTop: 2,
    width: 20,
  },
  hotLocation: {
    color: '#74767f',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  hotUsername: {
    color: '#111217',
    fontSize: 12,
    fontWeight: '800',
  },
  stateRow: {
    borderTopColor: '#ececf0',
    borderTopWidth: 1,
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 18,
  },
  stateText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default HotPlaceList;
