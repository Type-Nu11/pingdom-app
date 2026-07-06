import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FirstPlaceIcon from '../../../assets/icons/FirstPlace.svg';
import HotPlaceIcon from '../../../assets/icons/hotplace.svg';
import SecondPlaceIcon from '../../../assets/icons/SecondPlace.svg';
import ThirdPlaceIcon from '../../../assets/icons/ThirdPlace.svg';
import { usePlaceRegistrantIds } from '../hooks/usePlaceRegistrantIds';
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
  const { isLoadingByPlaceId, registrantIdsByPlaceId } = usePlaceRegistrantIds(places);
  const stateText = isLoading
    ? '추천 장소를 불러오고 있어요'
    : isError
      ? '추천 장소를 불러오지 못했어요'
      : places.length === 0
        ? '주변 추천 장소가 아직 없어요'
        : null;

  const formatRegistrantId = (userId: number | undefined, isLoading = false) => {
    if (userId === undefined) {
      return isLoading ? '등록자 ID 확인 중' : '등록자 ID 없음';
    }

    return `등록자 ID ${userId}`;
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
              {rank === 1 ? (
                <FirstPlaceIcon height={36} width={25} />
              ) : rank === 2 ? (
                <SecondPlaceIcon height={36} width={25} />
              ) : rank === 3 ? (
                <ThirdPlaceIcon height={36} width={25} />
              ) : (
                <Text
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  numberOfLines={1}
                  style={styles.rankNumber}
                >
                  {rank}.
                </Text>
              )}
            </View>
            <View style={styles.profileIcon}>
              <View style={styles.profileHead} />
              <View style={styles.profileBody} />
            </View>
            <View style={styles.hotTextGroup}>
              <Text numberOfLines={1} style={styles.hotLocation}>{place.name}</Text>
              <Text numberOfLines={1} style={styles.hotUsername}>
                {formatRegistrantId(
                  registrantIdsByPlaceId[String(place.id)] ?? place.userId,
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
    paddingTop: 28,
  },
  hotTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 18,
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
    minHeight: 84,
    paddingHorizontal: 18,
  },
  hotTextGroup: {
    flex: 1,
  },
  rankColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    width: 32,
  },
  rankNumber: {
    color: '#767680',
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 36,
    textAlign: 'center',
    width: '100%',
  },
  profileIcon: {
    alignItems: 'center',
    borderColor: '#676873',
    borderRadius: 19,
    borderWidth: 4,
    height: 38,
    justifyContent: 'center',
    marginRight: 13,
    overflow: 'hidden',
    width: 38,
  },
  profileHead: {
    backgroundColor: '#676873',
    borderRadius: 6,
    height: 12,
    marginTop: 2,
    width: 12,
  },
  profileBody: {
    backgroundColor: '#676873',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    height: 14,
    marginTop: 2,
    width: 24,
  },
  hotLocation: {
    color: '#74767f',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  hotUsername: {
    color: '#111217',
    fontSize: 13,
    fontWeight: '800',
  },
  stateRow: {
    borderTopColor: '#ececf0',
    borderTopWidth: 1,
    justifyContent: 'center',
    minHeight: 84,
    paddingHorizontal: 18,
  },
  stateText: {
    color: '#747681',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default HotPlaceList;
