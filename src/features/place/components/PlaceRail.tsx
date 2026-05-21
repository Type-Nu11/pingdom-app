import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PlaceCard from './PlaceCard';

const PlaceRail = () => {
  return (
    <View style={styles.placeRail}>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.placeScroller}
        contentContainerStyle={styles.placeList}
      >
        <PlaceCard />
        <PlaceCard />
        <PlaceCard />
        <PlaceCard />
        <PlaceCard dimmed />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  placeRail: {
    borderColor: '#e5e6eb',
    borderRadius: 18,
    borderWidth: 1,
    height: 94,
    justifyContent: 'center',
    marginHorizontal: 22,
    overflow: 'hidden',
  },
  placeScroller: {
    flexGrow: 0,
  },
  placeList: {
    alignItems: 'center',
    minHeight: 72,
    paddingHorizontal: 12,
  },
});

export default PlaceRail;
