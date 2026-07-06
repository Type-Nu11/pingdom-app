import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import ImageIcon from '../../../assets/icons/edit/image.svg';
import PencilIcon from '../../../assets/icons/edit/peril.svg';
import type { ProfileResponse } from '../api/profileApi';

type ProfileEditViewProps = {
  profile: ProfileResponse | null;
};

function getDisplayName(profile: ProfileResponse | null) {
  if (profile?.username?.trim()) {
    return profile.username.trim();
  }

  if (profile?.id) {
    return `user-${profile.id}`;
  }

  return '';
}

const ProfileEditView = ({ profile }: ProfileEditViewProps) => {
  const displayName = getDisplayName(profile);
  const profileImageUrl = profile?.profileImageUrl?.trim();
  const avatarInitial = (displayName || 'P').charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={styles.avatarWrap}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} resizeMode="cover" style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.defaultAvatar]}>
            <Text style={styles.avatarInitial}>{avatarInitial}</Text>
          </View>
        )}
        <View style={styles.cameraBadge}>
          <ImageIcon width={18} height={18} />
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>아이디</Text>
        <View style={styles.inputWrap}>
          <TextInput
            editable={false}
            placeholder="아이디를 불러오는 중"
            placeholderTextColor="#767680"
            style={styles.input}
            value={displayName}
          />
          <PencilIcon width={22} height={22} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 54,
    height: 108,
    width: 108,
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 50,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginTop: 132,
    position: 'relative',
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: '#d9d9de',
    borderColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 3,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 28,
  },
  defaultAvatar: {
    alignItems: 'center',
    backgroundColor: '#ff4a75',
    justifyContent: 'center',
  },
  form: {
    gap: 14,
    marginTop: 72,
    paddingHorizontal: 24,
  },
  input: {
    color: '#3b3b40',
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 29,
    padding: 0,
  },
  inputWrap: {
    alignItems: 'center',
    borderColor: '#767680',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 14,
  },
  label: {
    color: '#3b3b40',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  screen: {
    flex: 1,
  },
});

export default ProfileEditView;
