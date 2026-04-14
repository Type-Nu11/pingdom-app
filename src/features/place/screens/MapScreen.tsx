// screens/MapScreen.tsx
import React,{useState} from 'react';

import { Alert,StyleSheet, View } from 'react-native';
import KakaoMapView from '../components/KakaoMapView';
import LanguageGateModal from '../../app-init/components/LanguageGateModal';
import { i18n } from '../../../shared/i18n';

export default function MapScreen() {
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(true); //모달 상태

  const handleCloseLanguageModal = (selected: 'en' | 'ko') => {
    i18n.locale = selected;
    setIsLanguageModalVisible(false);
    Alert.alert(i18n.t('languageSelectedTitle'), i18n.t('languageSelectedBody'));
  };

  return (
    <View style={styles.container}>
      <LanguageGateModal
        visible={isLanguageModalVisible} //모달 가시성 여부
        onSelectLanguage={handleCloseLanguageModal} //언어 선택 시 함수 호출
      />
      <KakaoMapView style={styles.map} centerLat={37.402001} centerLng={127.108678} zoomLevel={7} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
