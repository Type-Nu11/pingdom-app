import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDownloadUserDataExport } from '../../../modules/user/account';
import { SettingsList, SettingsRow, SettingsScreenLayout, SettingsSection, SettingsTopBar } from '../components/SettingsLayout';

export default function DataExportScreen({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const download = useDownloadUserDataExport();
  const locked = useRef(false);
  const [state, setState] = useState<'idle' | 'loading' | 'prepared' | 'cancelled' | 'error'>('idle');
  const start = async () => {
    setState('loading');
    try { await download.mutateAsync(); setState('prepared'); }
    catch { setState('error'); }
    finally { locked.current = false; }
  };
  const confirm = () => {
    if (locked.current) return;
    locked.current = true;
    const cancel = () => { locked.current = false; setState('cancelled'); };
    Alert.alert(t('settings.export.title'), t('settings.export.confirm'), [
      { text: t('settings.export.cancel'), style: 'cancel', onPress: cancel },
      { text: t('settings.export.download'), onPress: () => { void start(); } },
    ], { cancelable: true, onDismiss: cancel });
  };
  return <SettingsScreenLayout testID="v2-data-export-screen">
    <SettingsTopBar backLabel={t('settings.back')} onBack={onBack} title={t('settings.export.title')} />
    <SettingsList>
      <SettingsSection>
        <SettingsRow label={t('settings.export.download')} subtitle={t('settings.export.description')}
          disabled={state === 'loading'} busy={state === 'loading'} onPress={confirm} />
        {state !== 'idle' ? <SettingsRow label={t(`settings.export.${state}`)} /> : null}
        <SettingsRow disabled label={t('settings.deleteAccount')} subtitle={t('settings.details.deleteAccount.description')} />
      </SettingsSection>
    </SettingsList>
  </SettingsScreenLayout>;
}
