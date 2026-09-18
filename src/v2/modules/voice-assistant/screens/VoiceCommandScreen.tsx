import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVoiceCommands, type VoiceCommandContext } from '../hooks/useVoiceCommands';
import VoiceAssistantScreen from './VoiceAssistantScreen';

/** Composition for the existing input UI, #347 transport and #348 read consumer. */
export default function VoiceCommandScreen({ context, onClose }: { context: VoiceCommandContext; onClose: () => void }) {
  const { t } = useTranslation();
  const commands = useVoiceCommands(context);
  return <VoiceAssistantScreen onClose={onClose} onFinalInput={commands.onFinalInput}
    submissionNotice={t('voiceAssistant.command.submission')} commandState={commands.commandState}
    timezone={context.timezone} onCommandCancel={commands.cancel}
    onCommandRetry={commands.retryAvailable ? commands.retry : undefined}
    commandRetryDisabled={commands.retryAvailable && !commands.retryReady} />;
}
