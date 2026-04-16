// App.tsx
import React,{useEffect} from 'react';
import MapScreen from './src/features/place/screens/MapScreen';
import LanguageGateModal from './src/features/app-init/components/LanguageGateModal';
import { useLanguageGate } from './src/features/app-init/hooks/useLanguageGate';
import { hydrateAccessToken } from './src/shared/api/authTokens';

export default function App() {
  const { language, isLanguageModalVisible, isBootstrapping, selectLanguage } = useLanguageGate();
  if (isBootstrapping) return null;
  useEffect(() => {
    // 앱이 처음 실행 될때 키체인에서 accessToken을 읽어와서
    // 메모리 캐시에 채워주는 초기화 작업,
    // 간단하게 로그인 저장 상태 유지 용도
    void hydrateAccessToken();
  })

  return (
    <>
      <MapScreen />
      <LanguageGateModal visible={isLanguageModalVisible} onSelectLanguage={selectLanguage} />
    </>
  );
}
