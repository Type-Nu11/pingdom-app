import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import ImageIcon from '../../../assets/icons/edit/image.svg';
import PencilIcon from '../../../assets/icons/edit/peril.svg';
import { profileImageSource } from '../constants/profileMock';

const ProfileEditView = () => (
  <View style={styles.screen}>
    <View style={styles.avatarWrap}>
      <Image source={profileImageSource} resizeMode="cover" style={styles.avatar} />
      <View style={styles.cameraBadge}>
        <ImageIcon width={18} height={18} />
      </View>
    </View>

    <View style={styles.form}>
      <Text style={styles.label}>이름</Text>
      <View style={styles.inputWrap}>
        <TextInput
          placeholder="이름 입력하세요."
          placeholderTextColor="#767680"
          style={styles.input}
        />
        <PencilIcon width={22} height={22} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 54,
    height: 108,
    width: 108,
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
