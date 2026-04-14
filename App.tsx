// App.tsx
import React from 'react';
import MapScreen from './src/features/place/screens/MapScreen';
import LanguageGateModal from './src/features/app-init/components/LanguageGateModal';
import { useLanguageGate } from './src/features/app-init/hooks/useLanguageGate';

export default function App() {
  const { language, isLanguageModalVisible, isBootstrapping, selectLanguage } = useLanguageGate();
  if (isBootstrapping) return null;

  return (
    <>
      <MapScreen />
      <LanguageGateModal visible={isLanguageModalVisible} onSelectLanguage={selectLanguage} />
    </>
  );
}
