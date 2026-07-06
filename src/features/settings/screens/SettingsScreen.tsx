import { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileApi } from '../../profile/api/profileApi';
import { useProfile } from '../../profile/hooks/useProfile';
import AccountEditView from '../components/AccountEditView';
import BlockedUsersView from '../components/BlockedUsersView';
import ContactUsView from '../components/ContactUsView';
import DeleteAccountView from '../components/DeleteAccountView';
import LegalTextPage from '../components/LegalTextPage';
import LicensesView from '../components/LicensesView';
import PasswordChangeView from '../components/PasswordChangeView';
import ReportHistoryView from '../components/ReportHistoryView';
import SettingsNavBar from '../components/SettingsNavBar';
import SettingsRootView from '../components/SettingsRootView';
import {
  BLOCK_POLICY_CONTENT,
  LOCATION_TERMS_CONTENT,
  PRIVACY_CONTENT,
  TERMS_CONTENT,
} from '../constants/legalContent';

export type SettingsPage =
  | 'root'
  | 'profile'
  | 'password'
  | 'blocked'
  | 'delete-account'
  | 'report-history'
  | 'block-policy'
  | 'contact-us'
  | 'terms'
  | 'privacy'
  | 'location-terms'
  | 'licenses';

type SettingsScreenProps = {
  onBack: () => void;
  onLogout: () => Promise<void>;
};

const SettingsScreen = ({ onBack, onLogout }: SettingsScreenProps) => {
  const [pageStack, setPageStack] = useState<SettingsPage[]>(['root']);
  const { profile } = useProfile();
  const currentPage = pageStack[pageStack.length - 1];

  const goTo = (page: SettingsPage) => setPageStack((prev) => [...prev, page]);

  const goBack = () => {
    if (pageStack.length > 1) {
      setPageStack((prev) => prev.slice(0, -1));
      return;
    }

    onBack();
  };

  const handleAccountDeleted = async () => {
    await profileApi.deleteProfile();
    await onLogout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.screen}>
        {currentPage === 'root' && (
          <>
            <SettingsNavBar title="설정" onBack={goBack} />
            <SettingsRootView onNavigate={goTo} />
          </>
        )}
        {currentPage === 'profile' && <AccountEditView onBack={goBack} />}
        {currentPage === 'password' && <PasswordChangeView onBack={goBack} />}
        {currentPage === 'blocked' && <BlockedUsersView onBack={goBack} />}
        {currentPage === 'delete-account' && (
          <DeleteAccountView onBack={goBack} onDeleted={handleAccountDeleted} />
        )}
        {currentPage === 'report-history' && <ReportHistoryView onBack={goBack} />}
        {currentPage === 'block-policy' && (
          <LegalTextPage
            meta={BLOCK_POLICY_CONTENT.meta}
            sections={BLOCK_POLICY_CONTENT.sections}
            title={BLOCK_POLICY_CONTENT.title}
            onBack={goBack}
          />
        )}
        {currentPage === 'contact-us' && (
          <ContactUsView defaultEmail={profile?.email ?? ''} onBack={goBack} />
        )}
        {currentPage === 'terms' && (
          <LegalTextPage
            meta={TERMS_CONTENT.meta}
            sections={TERMS_CONTENT.sections}
            title={TERMS_CONTENT.title}
            onBack={goBack}
          />
        )}
        {currentPage === 'privacy' && (
          <LegalTextPage
            meta={PRIVACY_CONTENT.meta}
            sections={PRIVACY_CONTENT.sections}
            title={PRIVACY_CONTENT.title}
            onBack={goBack}
          />
        )}
        {currentPage === 'location-terms' && (
          <LegalTextPage
            meta={LOCATION_TERMS_CONTENT.meta}
            sections={LOCATION_TERMS_CONTENT.sections}
            title={LOCATION_TERMS_CONTENT.title}
            onBack={goBack}
          />
        )}
        {currentPage === 'licenses' && <LicensesView onBack={goBack} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});

export default SettingsScreen;
