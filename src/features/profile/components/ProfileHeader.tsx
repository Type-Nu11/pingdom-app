import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import SavedIcon from '../../../assets/v2/icons/actions/Saved.svg';
import type { ProfileResponse } from '../api/profileApi';

type ProfileHeaderProps = {
  isArchive: boolean;
  isLoading?: boolean;
  onOpenApiCheck: () => void;
  onOpenArchive: () => void;
  onOpenSettings: () => void;
  profile: ProfileResponse | null;
  showTabs: boolean;
};

function getDisplayName(profile: ProfileResponse | null) {
  if (profile?.username?.trim()) {
    return profile.username.trim();
  }

  if (profile?.id) {
    return `user-${profile.id}`;
  }

  return '내 프로필';
}

function getAvatarInitial(displayName: string) {
  return displayName.trim().charAt(0).toUpperCase() || 'P';
}

const ProfileHeader = ({
  isArchive,
  isLoading = false,
  onOpenApiCheck,
  onOpenArchive,
  onOpenSettings,
  profile,
  showTabs,
}: ProfileHeaderProps) => {
  const displayName = isLoading ? '불러오는 중...' : getDisplayName(profile);
  const avatarInitial = getAvatarInitial(displayName);
  const profileImageUrl = profile?.profileImageUrl?.trim();

  return (
    <>
      <View style={[styles.header, isArchive && styles.archiveHeader]}>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            resizeMode="cover"
            style={[styles.avatar, isArchive && styles.archiveAvatar]}
          />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar, isArchive && styles.archiveAvatar]}>
            <Text style={[styles.avatarInitial, isArchive && styles.archiveAvatarInitial]}>
              {avatarInitial}
            </Text>
          </View>
        )}
        <Text style={[styles.username, isArchive && styles.archiveUsername]}>{displayName}</Text>

        {!isArchive && (
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={onOpenSettings}>
              <Text style={styles.actionText}>프로필 설정</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onOpenArchive}>
              <Text style={styles.actionText}>보관함 보기</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onOpenApiCheck}>
              <Text style={styles.actionText}>API 확인하기</Text>
            </Pressable>
          </View>
        )}
      </View>

      {showTabs && (
        <View style={styles.tabBar}>
          <View style={styles.tabItem}>
            <SavedIcon
              color="#ff1956"
              fill="#ff1956"
              width={29}
              height={34}
            />
            <View style={styles.activeTabLine} />
          </View>
        </View>
      )}
    </>
  );
};

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
  avatarInitial: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 44,
  },
  archiveAvatarInitial: {
    fontSize: 28,
    lineHeight: 34,
  },
  defaultAvatar: {
    alignItems: 'center',
    backgroundColor: '#ff4a75',
    justifyContent: 'center',
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
