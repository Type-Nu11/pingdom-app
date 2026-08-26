import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import SavedIcon from '../../../assets/v2/icons/actions/Saved.svg';
import type { ProfileResponse } from '../api/profileApi';

type ProfileHeaderProps = {
  isLoading?: boolean;
  onOpenApiCheck: () => void;
  onOpenSettings: () => void;
  profile: ProfileResponse | null;
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
  isLoading = false,
  onOpenApiCheck,
  onOpenSettings,
  profile,
}: ProfileHeaderProps) => {
  const displayName = isLoading ? '불러오는 중...' : getDisplayName(profile);
  const avatarInitial = getAvatarInitial(displayName);
  const profileImageUrl = profile?.profileImageUrl?.trim();

  return (
    <>
      <View style={styles.header}>
        {profileImageUrl ? (
          <Image
            source={{ uri: profileImageUrl }}
            resizeMode="cover"
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.avatarInitial}>
              {avatarInitial}
            </Text>
          </View>
        )}
        <Text style={styles.username}>{displayName}</Text>

        <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={onOpenSettings}>
              <Text style={styles.actionText}>프로필 설정</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onOpenApiCheck}>
              <Text style={styles.actionText}>API 확인하기</Text>
            </Pressable>
        </View>
      </View>

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
  avatarInitial: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 44,
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
