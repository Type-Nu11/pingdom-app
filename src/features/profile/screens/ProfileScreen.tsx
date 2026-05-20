import { Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const profileImageSource = require('../../../assets/Home/spki.webp');

type ProfileScreenProps = {
  onBack: () => void;
};

const galleryItems = Array.from({ length: 18 }, (_, index) => `profile-post-${index}`);

const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  const { width } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 560);
  const gridItemSize = Math.floor(maxContentWidth / 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      <View style={[styles.screen, { maxWidth: maxContentWidth }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.header}>
          <Image source={profileImageSource} resizeMode="cover" style={styles.avatar} />
          <Text style={styles.username}>woo._sm</Text>

          <View style={styles.profileActions}>
            <Pressable style={styles.profileActionButton}>
              <Text style={styles.profileActionText}>프로필 편집</Text>
            </Pressable>
            <Pressable style={styles.profileActionButton}>
              <Text style={styles.profileActionText}>보관함 보기</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tabBar}>
          <View style={styles.tabItem}>
            <Text style={styles.activeTabIcon}>♥</Text>
            <View style={styles.activeTabLine} />
          </View>
          <View style={styles.tabItem}>
            <Text style={styles.inactiveTabIcon}>♡</Text>
          </View>
        </View>

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <View style={styles.gallery}>
            {galleryItems.map((item) => (
              <Image
                key={item}
                source={profileImageSource}
                resizeMode="cover"
                style={{
                  height: gridItemSize,
                  width: gridItemSize,
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeTabIcon: {
    color: '#ff1956',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  activeTabLine: {
    backgroundColor: '#ff1956',
    borderRadius: 1,
    bottom: 0,
    height: 2,
    position: 'absolute',
    width: 100,
  },
  avatar: {
    borderRadius: 48,
    height: 96,
    width: 96,
  },
  backButton: {
    left: 24,
    position: 'absolute',
    top: 54,
    zIndex: 2,
  },
  backText: {
    color: '#0c0c0d',
    fontSize: 50,
    fontWeight: '300',
    lineHeight: 50,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#d8d8dc',
    borderBottomWidth: 1,
    paddingBottom: 32,
    paddingTop: 118,
  },
  inactiveTabIcon: {
    color: '#c7c8cc',
    fontSize: 36,
    fontWeight: '300',
    lineHeight: 42,
  },
  profileActionButton: {
    alignItems: 'center',
    backgroundColor: '#f6f6f7',
    borderColor: '#e5e5e7',
    borderRadius: 16,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  profileActionText: {
    color: '#3b3b40',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 36,
    marginTop: 24,
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
  tabBar: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderBottomColor: '#d8d8dc',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 72,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  username: {
    color: '#3b3b40',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 20,
  },
});

export default ProfileScreen;
