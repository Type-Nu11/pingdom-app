import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LikeIcon from '../../../assets/icons/actions/Like.svg';
import SavedIcon from '../../../assets/icons/actions/Saved.svg';
import { PROFILE_USERNAME, profileImageSource } from '../constants/profileMock';

type ProfileHeaderProps = {
  activeTab: 'liked' | 'saved';
  isArchive: boolean;
  onChangeTab: (tab: 'liked' | 'saved') => void;
  onLogout: () => void;
  onOpenArchive: () => void;
  onOpenEdit: () => void;
  showTabs: boolean;
};

const ProfileHeader = ({
  activeTab,
  isArchive,
  onChangeTab,
  onLogout,
  onOpenArchive,
  onOpenEdit,
  showTabs,
}: ProfileHeaderProps) => (
  <>
    <View style={[styles.header, isArchive && styles.archiveHeader]}>
      <Image
        source={profileImageSource}
        resizeMode="cover"
        style={[styles.avatar, isArchive && styles.archiveAvatar]}
      />
      <Text style={[styles.username, isArchive && styles.archiveUsername]}>{PROFILE_USERNAME}</Text>

      {!isArchive && (
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={onOpenEdit}>
            <Text style={styles.actionText}>프로필 편집</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={onOpenArchive}>
            <Text style={styles.actionText}>보관함 보기</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.logoutButton]} onPress={onLogout}>
            <Text style={[styles.actionText, styles.logoutText]}>로그아웃</Text>
          </Pressable>
        </View>
      )}
    </View>

    {showTabs && (
      <View style={styles.tabBar}>
        <Pressable style={styles.tabItem} onPress={() => onChangeTab('liked')}>
          <LikeIcon
            color={activeTab === 'liked' ? '#ff1956' : '#c7c8cc'}
            fill={activeTab === 'liked' ? '#ff1956' : 'none'}
            width={40}
            height={36}
          />
          {activeTab === 'liked' && <View style={styles.activeTabLine} />}
        </Pressable>
        <Pressable style={styles.tabItem} onPress={() => onChangeTab('saved')}>
          <SavedIcon
            color={activeTab === 'saved' ? '#ff1956' : '#c7c8cc'}
            fill={activeTab === 'saved' ? '#ff1956' : 'none'}
            width={34}
            height={40}
          />
          {activeTab === 'saved' && <View style={styles.activeTabLine} />}
        </Pressable>
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
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
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
    height: 235,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingBottom: 0,
    paddingTop: 68,
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
  archiveAvatar: {
    borderRadius: 38,
    height: 76,
    width: 76,
  },
  archiveUsername: {
    fontSize: 22,
    lineHeight: 29,
    marginTop: 12,
  },
  logoutButton: {
    backgroundColor: '#fff1f4',
    borderColor: '#ffd0dc',
  },
  logoutText: {
    color: '#ff1956',
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
