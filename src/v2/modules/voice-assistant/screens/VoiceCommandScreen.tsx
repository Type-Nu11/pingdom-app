import React from 'react';
import { useVoiceCommands, type VoiceCommandContext } from '../hooks/useVoiceCommands';
import VoiceAssistantScreen from './VoiceAssistantScreen';

/** Composition for the existing input UI, #347 transport and #348 read consumer. */
export default function VoiceCommandScreen({ context, onClose }: { context: VoiceCommandContext; onClose: () => void }) {
  const commands = useVoiceCommands(context);
  return <VoiceAssistantScreen onClose={onClose} autoStart onFinalInput={commands.onFinalInput}
    serverSubmission commandState={commands.commandState}
    timezone={context.timezone} onCommandCancel={commands.cancel}
    onCommandFeedbackDismiss={commands.dismissFeedback}
    onCommandRetry={commands.retryAvailable ? commands.retry : undefined}
    commandRetryDisabled={commands.retryAvailable && !commands.retryReady} />;
}
