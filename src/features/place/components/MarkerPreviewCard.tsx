import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const previewImageSource = require('../../../assets/Home/spki.webp');

type MarkerPreviewCardProps = {
  onClose: () => void;
  width: number;
};

const MarkerPreviewCard = ({ onClose, width }: MarkerPreviewCardProps) => (
  <View style={[styles.card, { width }]}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="닫기"
      hitSlop={10}
      style={styles.closeButton}
      onPress={onClose}
    >
      <Text style={styles.closeText}>×</Text>
    </Pressable>

    <View style={styles.profileRow}>
      <View style={styles.profileIcon}>
        <View style={styles.profileHead} />
        <View style={styles.profileBody} />
      </View>
      <View style={styles.profileTextGroup}>
        <Text style={styles.username}>woo._sm</Text>
        <Text style={styles.placeName}>고양종합운동장</Text>
      </View>
      <Text style={styles.moreText}>...</Text>
    </View>

    <Image source={previewImageSource} resizeMode="cover" style={styles.feedImage} />

    <View style={styles.indicatorRow}>
      <View style={styles.indicatorActive} />
      <View style={styles.indicator} />
    </View>

    <View style={styles.actionRow}>
      <View style={styles.leftActions}>
        <View style={styles.likeShape} />
        <Text style={styles.likeCount}>1.2K</Text>
        <Text style={styles.shareIcon}>↗</Text>
      </View>
      <View style={styles.saveShape} />
    </View>

    <Text style={styles.caption}>
      <Text style={styles.captionAuthor}>woo._sm </Text>
      You ain’t ever gonna burn my heart out So Sally can wait she knows it’s too late as we’re walkin’ on by
    </Text>
    <Text style={styles.timeText}>1시간 전 • 번역 보기</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 14,
    overflow: 'hidden',
    paddingBottom: 24,
    paddingTop: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 38 },
    shadowOpacity: 0.14,
    shadowRadius: 38,
  },
  closeButton: {
    position: 'absolute',
    right: 17,
    top: 13,
    zIndex: 2,
  },
  closeText: {
    color: '#5e5e66',
    fontSize: 39,
    fontWeight: '300',
    lineHeight: 39,
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    height: 60,
    paddingHorizontal: 16,
  },
  profileIcon: {
    alignItems: 'center',
    borderColor: '#5e5e66',
    borderRadius: 16,
    borderWidth: 3,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  profileHead: {
    backgroundColor: '#5e5e66',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  profileBody: {
    backgroundColor: '#5e5e66',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    height: 12,
    marginTop: 1,
    width: 21,
  },
  profileTextGroup: {
    flex: 1,
  },
  username: {
    color: '#3b3b40',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  placeName: {
    color: '#0c0c0d',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  moreText: {
    color: '#3b3b40',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },
  feedImage: {
    aspectRatio: 1,
    backgroundColor: '#05070d',
    width: '100%',
  },
  indicatorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    height: 26,
    justifyContent: 'center',
  },
  indicatorActive: {
    backgroundColor: '#ff1956',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  indicator: {
    backgroundColor: '#bfc1c1',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  likeShape: {
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    borderColor: '#5e5e66',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    borderWidth: 1.5,
    height: 16,
    transform: [{ rotate: '-45deg' }],
    width: 16,
  },
  likeCount: {
    color: '#5e5e66',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginRight: 7,
  },
  shareIcon: {
    color: '#5e5e66',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
    transform: [{ rotate: '-20deg' }],
  },
  saveShape: {
    borderColor: '#5e5e66',
    borderRadius: 2,
    borderWidth: 1.5,
    height: 22,
    width: 17,
  },
  caption: {
    color: '#3b3b40',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingTop: 9,
  },
  captionAuthor: {
    fontWeight: '700',
  },
  timeText: {
    color: '#767680',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});

export default MarkerPreviewCard;
