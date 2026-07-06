import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { APP_VERSION } from '../constants/legalContent';
import type { SettingsPage } from '../screens/SettingsScreen';
import SettingsDivider from './SettingsDivider';
import SettingsRow from './SettingsRow';
import SettingsSection from './SettingsSection';

type SettingsRootViewProps = {
  onNavigate: (page: SettingsPage) => void;
};

const SettingsRootView = ({ onNavigate }: SettingsRootViewProps) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [activityEnabled, setActivityEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [cacheSize, setCacheSize] = useState('128.4MB');

  const handleClearCache = () => {
    setCacheSize('0MB');
    Alert.alert('캐시를 삭제했습니다');
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SettingsSection title="계정">
        <SettingsRow
          chevron
          subtitle="닉네임, 프로필 사진 등 내 프로필 정보를 수정합니다."
          title="프로필 수정"
          onPress={() => onNavigate('profile')}
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
          subtitle="내가 차단한 사용자 목록을 확인하고 해제합니다."
          title="차단한 사용자 관리"
          onPress={() => onNavigate('blocked')}
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

      <SettingsSection title="알림">
        <SettingsRow
          subtitle="모바일 앱에서 전송하는 푸시 알림을 받습니다."
          title="모바일 푸시 알림"
          toggled={pushEnabled}
          onToggle={setPushEnabled}
        />
        <SettingsDivider />
        <SettingsRow
          subtitle="내 게시물의 좋아요, 댓글, 신고 처리 결과와 추천 장소 알림을 받습니다."
          title="내 활동"
          toggled={activityEnabled}
          onToggle={setActivityEnabled}
        />
        <SettingsDivider />
        <SettingsRow
          subtitle="이벤트, 혜택 등 마케팅 정보를 받습니다."
          title="마케팅/이벤트 알림"
          toggled={marketingEnabled}
          onToggle={setMarketingEnabled}
        />
        <SettingsDivider />
        <SettingsRow
          subtitle="오후 10시부터 오전 8시까지 알림을 받지 않습니다."
          title="야간 알림 끄기"
          toggled={nightModeEnabled}
          onToggle={setNightModeEnabled}
        />
      </SettingsSection>

      <SettingsSection title="권한">
        <SettingsRow subtitle="내 주변 장소 추천을 위해 위치 정보에 접근합니다." title="위치 권한" value="허용됨" />
        <SettingsDivider />
        <SettingsRow subtitle="사진 촬영 및 본인 인증을 위해 카메라에 접근합니다." title="카메라 권한" value="허용됨" />
        <SettingsDivider />
        <SettingsRow subtitle="프로필 및 게시물 등록을 위해 사진첩에 접근합니다." title="사진 접근 권한" value="일부 허용" />
        <SettingsDivider />
        <SettingsRow subtitle="푸시 알림 전송을 위해 알림 권한이 필요합니다." title="알림 권한" value="허용됨" />
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
        <SettingsDivider />
        <SettingsRow
          chevron
          subtitle="불편한 점이나 궁금한 점을 문의합니다."
          title="문의하기"
          onPress={() => onNavigate('contact-us')}
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
          value={cacheSize}
          onPress={handleClearCache}
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
