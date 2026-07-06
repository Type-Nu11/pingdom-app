import { useRef } from 'react';
import { Animated, Image, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { likeUsers, profileImageSource } from '../constants/profileMock';

type LikesBottomSheetProps = {
  onClose: () => void;
};

const LikesBottomSheet = ({ onClose }: LikesBottomSheetProps) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.8) {
          Animated.timing(translateY, {
            duration: 180,
            toValue: 390,
            useNativeDriver: true,
          }).start(onClose);
          return;
        }

        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.title}>좋아요</Text>
        </View>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.list}>
          {likeUsers.map((item) => (
            <View key={item} style={styles.userRow}>
              <Image source={profileImageSource} resizeMode="cover" style={styles.userAvatar} />
              <Text style={styles.userName}>{item}</Text>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  handle: {
    backgroundColor: '#b8b8b8',
    borderRadius: 7,
    height: 4,
    width: 64,
  },
  header: {
    alignItems: 'center',
    gap: 16,
    height: 58,
    paddingTop: 8,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    height: 390,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { height: -2, width: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    color: '#000',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  userAvatar: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  userName: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 23,
  },
  userRow: {
    alignItems: 'center',
    borderBottomColor: '#e5e5ea',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    height: 70,
    paddingHorizontal: 16,
  },
});

export default LikesBottomSheet;
