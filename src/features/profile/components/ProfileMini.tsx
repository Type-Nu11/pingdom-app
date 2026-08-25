import { StyleSheet, Text, View } from 'react-native';

type ProfileMiniProps = {
  place?: string;
  username?: string;
};

const ProfileMini = ({
  place = '장소 정보 없음',
  username = '사용자',
}: ProfileMiniProps) => (
  <View style={styles.profile}>
    <View style={styles.icon}>
      <View style={styles.head} />
      <View style={styles.body} />
    </View>
    <View>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.place}>{place}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#5e5e66',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 10,
    marginTop: 1,
    width: 18,
  },
  head: {
    backgroundColor: '#5e5e66',
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  icon: {
    alignItems: 'center',
    borderColor: '#5e5e66',
    borderRadius: 15,
    borderWidth: 3,
    height: 30,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 30,
  },
  place: {
    color: '#0c0c0d',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  username: {
    color: '#3b3b40',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
});

export default ProfileMini;
