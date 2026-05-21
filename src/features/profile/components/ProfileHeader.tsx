import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LikeIcon from '../../../assets/icons/actions/Like.svg';
import SavedIcon from '../../../assets/icons/actions/Saved.svg';
import { PROFILE_USERNAME, profileImageSource } from '../constants/profileMock';

type ProfileHeaderProps = {
  isArchive: boolean;
  onOpenArchive: () => void;
  onOpenEdit: () => void;
  showTabs: boolean;
};

const ProfileHeader = ({
  isArchive,
  onOpenArchive,
  onOpenEdit,
  showTabs,
}: ProfileHeaderProps) => (
  <>
    <View style={[styles.header, isArchive && styles.archiveHeader]}>
      <Image source={profileImageSource} resizeMode="cover" style={styles.avatar} />
      <Text style={styles.username}>{PROFILE_USERNAME}</Text>

      {!isArchive && (
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={onOpenEdit}>
            <Text style={styles.actionText}>프로필 편집</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={onOpenArchive}>
            <Text style={styles.actionText}>보관함 보기</Text>
          </Pressable>
        </View>
      )}
    </View>

    {showTabs && (
      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <LikeIcon color="#ff1956" fill="#ff1956" width={40} height={36} />
          <View style={styles.activeTabLine} />
        </View>
        <View style={styles.tabItem}>
          <SavedIcon color="#c7c8cc" fill="none" width={34} height={40} />
        </View>
      </View>
    )}
  </>
);

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f6f6f7',
    borderColor: '#e5e5e7',
    borderRadius: 16,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  actionText: {
    color: '#3b3b40',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: 36,
    marginTop: 24,
  },
  activeTabLine: {
    backgroundColor: '#ff1956',
    borderRadius: 1,
    bottom: 0,
    height: 2,
    position: 'absolute',
    width: 100,
  },
  archiveHeader: {
    paddingBottom: 28,
    paddingTop: 96,
  },
  avatar: {
    borderRadius: 48,
    height: 96,
    width: 96,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#d8d8dc',
    borderBottomWidth: 1,
    paddingBottom: 32,
    paddingTop: 118,
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

export default ProfileHeader;
