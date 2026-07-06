import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useMapSettingsStore } from '../../../app/store/mapSettingsStore';
import { useDevicePermissions } from '../hooks/useDevicePermissions';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { APP_VERSION } from '../constants/legalContent';
import type { SettingsPage } from '../screens/SettingsScreen';
import SettingsDivider from './SettingsDivider';
import SettingsRow from './SettingsRow';
import SettingsSection from './SettingsSection';

type SettingsRootViewProps = {
  onNavigate: (page: SettingsPage) => void;
};

const CACHE_KEY_PREFIXES = ['@pingdom/record-likes', '@pingdom/hidden-posts'];

const SettingsRootView = ({ onNavigate }: SettingsRootViewProps) => {
  const { preferences, setPreference } = useNotificationPreferences();
  const { permissions } = useDevicePermissions();
  const recommendationRadiusKm = useMapSettingsStore((state) => state.recommendationRadiusKm);
  const queryClient = useQueryClient();

  const handleClearCache = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => CACHE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)));

    await AsyncStorage.multiRemove(cacheKeys);
    queryClient.clear();
    Alert.alert('캐시를 삭제했습니다');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SettingsSection title="계정">
        <SettingsRow
          chevron
          subtitle="로그인에 사용하는 아이디를 변경합니다."
          title="아이디 변경"
          onPress={() => onNavigate('username')}
        />
        <SettingsDivider />
        <SettingsRow
          chevron
          subtitle="계정 보안을 위해 비밀번호를 변경합니다."
          title="비밀번호 변경"
          onPress={() => onNavigate('password')}
        />
        <SettingsDivider />
        <SettingsRow
          chevron
          destructive
          subtitle="계정과 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다."
          title="계정 삭제"
          onPress={() => onNavigate('delete-account')}
        />
      </SettingsSection>

      <SettingsSection title="지도">
        <SettingsRow
          chevron
          subtitle="현재 위치 기준 장소 추천을 받을 반경을 설정합니다."
          title="추천 반경 설정"
          value={`${recommendationRadiusKm}km`}
          onPress={() => onNavigate('map-radius')}
        />
      </SettingsSection>

      <SettingsSection title="알림">
        <SettingsRow
          subtitle="모바일 앱에서 전송하는 푸시 알림을 받습니다."
          title="모바일 푸시 알림"
          toggled={preferences.pushEnabled}
          onToggle={(next) => setPreference('pushEnabled', next)}
        />
        <SettingsDivider />
        <SettingsRow
          subtitle="내 게시물의 좋아요, 댓글, 신고 처리 결과와 추천 장소 알림을 받습니다."
          title="내 활동"
          toggled={preferences.activityEnabled}
          onToggle={(next) => setPreference('activityEnabled', next)}
        />
        <SettingsDivider />
        <SettingsRow
          subtitle="이벤트, 혜택 등 마케팅 정보를 받습니다."
          title="마케팅/이벤트 알림"
          toggled={preferences.marketingEnabled}
          onToggle={(next) => setPreference('marketingEnabled', next)}
        />
        <SettingsDivider />
        <SettingsRow
          subtitle="오후 10시부터 오전 8시까지 알림을 받지 않습니다."
          title="야간 알림 끄기"
          toggled={preferences.nightModeEnabled}
          onToggle={(next) => setPreference('nightModeEnabled', next)}
        />
      </SettingsSection>

      <SettingsSection title="권한">
        <SettingsRow subtitle="내 주변 장소 추천을 위해 위치 정보에 접근합니다." title="위치 권한" value={permissions.location} />
        <SettingsDivider />
        <SettingsRow subtitle="사진 촬영 및 본인 인증을 위해 카메라에 접근합니다." title="카메라 권한" value={permissions.camera} />
        <SettingsDivider />
        <SettingsRow subtitle="프로필 및 게시물 등록을 위해 사진첩에 접근합니다." title="사진 접근 권한" value={permissions.photoLibrary} />
        <SettingsDivider />
        <SettingsRow subtitle="푸시 알림 전송을 위해 알림 권한이 필요합니다." title="알림 권한" value={permissions.notification} />
        <Pressable style={styles.gotoSettingsButton} onPress={() => void Linking.openSettings()}>
          <Text style={styles.gotoSettingsText}>설정 앱으로 이동</Text>
        </Pressable>
      </SettingsSection>

      <SettingsSection title="신고">
        <SettingsRow
          chevron
          subtitle="내가 신고한 내역과 처리 결과를 확인합니다."
          title="신고 내역"
          onPress={() => onNavigate('report-history')}
        />
        <SettingsDivider />
        <SettingsRow
          chevron
          subtitle="차단 및 신고 처리에 대한 정책을 확인합니다."
          title="차단/신고 정책"
          onPress={() => onNavigate('block-policy')}
        />
      </SettingsSection>

      <SettingsSection title="정보">
        <SettingsRow subtitle="현재 설치된 앱의 버전 정보입니다." title="앱 버전" value={APP_VERSION} />
        <SettingsDivider />
        <SettingsRow
          chevron
          subtitle="서비스 이용약관을 확인합니다."
          title="이용약관"
          onPress={() => onNavigate('terms')}
        />
        <SettingsDivider />
        <SettingsRow
          chevron
          subtitle="개인정보 수집 및 이용에 대한 방침을 확인합니다."
          title="개인정보 처리방침"
          onPress={() => onNavigate('privacy')}
        />
        <SettingsDivider />
        <SettingsRow
          chevron
          subtitle="위치기반서비스 이용약관을 확인합니다."
          title="위치정보 이용약관"
          onPress={() => onNavigate('location-terms')}
        />
        <SettingsDivider />
        <SettingsRow
          chevron
          subtitle="앱에 사용된 오픈소스 라이선스 정보를 확인합니다."
          title="오픈소스 라이선스"
          onPress={() => onNavigate('licenses')}
        />
      </SettingsSection>

      <SettingsSection title="다운로드">
        <SettingsRow
          subtitle="임시 저장된 이미지 및 데이터를 삭제해 저장 공간을 확보합니다."
          title="캐시 삭제"
          onPress={() => void handleClearCache()}
        />
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  gotoSettingsButton: {
    alignItems: 'center',
    backgroundColor: '#ff1956',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  gotoSettingsText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});

export default SettingsRootView;
