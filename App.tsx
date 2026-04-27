// App.tsx
import React from 'react';
import MapScreen from './src/features/place/screens/MapScreen';
import LanguageGateCard from './src/features/app-init/components/LanguageGateCard';
import { useLanguageGate } from './src/features/app-init/hooks/useLanguageGate';

export default function App() {
  const { language, isLanguageModalVisible, isBootstrapping, selectLanguage } = useLanguageGate();
  if (isBootstrapping) return null;

  return (
    <>
      <MapScreen />
      <LanguageGateCard visible={isLanguageModalVisible} onSelectLanguage={selectLanguage} />
    </>
  );
}
