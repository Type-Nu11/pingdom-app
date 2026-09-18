import type {
  AppCommandResult, CommandRequest, ProviderEnvelope, ReservationDraft,
  VoiceAssistantCommand, VoiceCommandName, VoiceCommandOutput,
} from '../../index';
import type { AvailabilityList } from '../../../../modules/booking/reservations/__tests__';

type AssertNever<T extends never> = T;
export type ContractCoverage = [
  AssertNever<Exclude<VoiceCommandName, keyof VoiceCommandOutput>>,
  AssertNever<Exclude<keyof VoiceCommandOutput, VoiceCommandName>>,
  AssertNever<Extract<ProviderEnvelope, { kind: 'command_result' }>>,
  AssertNever<Exclude<ReservationDraft['availability']['productType'], AvailabilityList[number]['productType']>>,
];

// Compiled by npm run typecheck; these functions are never executed.
function typeBoundary(command: CommandRequest, result: AppCommandResult) {
  if (command.command === 'prepareReservation') {
    const selectedId: number = command.args.availabilityId;
    void selectedId;
    // @ts-expect-error A prepared command never carries confirmation authority.
    command.args.confirmed;
    // @ts-expect-error Credentials and booker data cannot be supplied by AI.
    command.args.bookerPhone;
  }
  if (result.command === 'prepareReservation' && result.outcome.status === 'succeeded') {
    const state: 'awaiting_user_confirmation' = result.outcome.data.draft.status;
    void state;
    // @ts-expect-error A prepared draft is not a reservation success.
    result.outcome.data.reservationId;
  }
  // @ts-expect-error App results cannot enter the provider stream.
  const provider: ProviderEnvelope = result;
  // @ts-expect-error Provider commands cannot masquerade as app results.
  const app: AppCommandResult = command;
  // @ts-expect-error Discriminator and args cannot be mismatched.
  const mismatch: VoiceAssistantCommand = { command: 'getPlaceDetails', args: { availabilityId: 77 } };
  // @ts-expect-error There is no reservation completion command.
  const confirm: VoiceAssistantCommand = { command: 'confirmReservation', args: {} };
  void [provider, app, mismatch, confirm];
}
void typeBoundary;
