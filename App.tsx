// App.tsx
import React from 'react';
import MapScreen from './src/features/place/screens/MapScreen';
import LanguageGateModal from './src/features/app-init/components/LanguageGateModal';
import { useLanguagGate } from './src/features/app-init/hooks/useLanguageGate';

export default function App() {
  const { language, isLanguageModalVisible, isBootstrapping, selectLanguage } = useLanguagGate();
  if (isBootstrapping) return null;

  return (
    <>
      <MapScreen language={language} />
      <LanguageGateModal visible={isLanguageModalVisible} onSelectLanguage={selectLanguage} />
    </>
  );
}
