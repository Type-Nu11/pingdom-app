import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type HotPlaceItem = {
  id: string;
  location: string;
  rank: number;
  username: string;
};

type HotPlaceListProps = {
  places: HotPlaceItem[];
};

const HotPlaceList = ({ places }: HotPlaceListProps) => {
  return (
    <View style={styles.hotSection}>
      <View style={styles.hotTitleRow}>
        <View style={styles.hotIcon} />
        <Text style={styles.hotTitle}>Hot Place</Text>
      </View>

      {places.map((place) => (
        <View key={place.id} style={styles.hotRow}>
          <View style={[styles.rankBadge, place.rank !== 1 && styles.rankBadgeMuted]}>
            <Text style={[styles.rankText, place.rank !== 1 && styles.rankTextMuted]}>
              {place.rank}
            </Text>
          </View>
          <View style={styles.avatar}>
            <View style={styles.avatarHead} />
            <View style={styles.avatarBody} />
          </View>
          <View>
            <Text style={styles.hotLocation}>{place.location}</Text>
            <Text style={styles.hotUsername}>{place.username}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  hotSection: {
    paddingTop: 22,
  },
  hotTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 13,
    paddingHorizontal: 42,
  },
  hotIcon: {
    backgroundColor: '#ff1956',
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  hotTitle: {
    color: '#3a3b43',
    fontSize: 25,
    fontWeight: '900',
  },
  hotRow: {
    alignItems: 'center',
    borderTopColor: '#ececf0',
    borderTopWidth: 1,
    flexDirection: 'row',
    height: 73,
    paddingHorizontal: 43,
  },
  rankBadge: {
    alignItems: 'center',
    borderColor: '#ff9f1a',
    borderRadius: 13,
    borderWidth: 3,
    height: 27,
    justifyContent: 'center',
    marginRight: 17,
    width: 27,
  },
  rankBadgeMuted: {
    borderColor: '#7d7f8a',
  },
  rankText: {
    color: '#df8600',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  rankTextMuted: {
    color: '#747681',
  },
  avatar: {
    alignItems: 'center',
    borderColor: '#737580',
    borderRadius: 17,
    borderWidth: 4,
    height: 34,
    justifyContent: 'center',
    marginRight: 11,
    overflow: 'hidden',
    width: 34,
  },
  avatarHead: {
    backgroundColor: '#737580',
    borderRadius: 6,
    height: 11,
    marginTop: 2,
    width: 11,
  },
  avatarBody: {
    backgroundColor: '#737580',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    height: 14,
    marginTop: 2,
    width: 24,
  },
  hotLocation: {
    color: '#6e7079',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  hotUsername: {
    color: '#111217',
    fontSize: 12,
    fontWeight: '800',
  },
});

export default HotPlaceList;
