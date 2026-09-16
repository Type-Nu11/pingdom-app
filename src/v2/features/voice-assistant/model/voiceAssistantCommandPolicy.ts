import type { VoiceCommandName } from './voiceAssistantCommand.types';

/** 실행 전제조건입니다. 이 타입/표를 읽는 것만으로 검사되는 것은 아니며 executor가 강제해야 합니다. */
type CommonPolicy = Readonly<{
  // 예약 준비를 포함한 모든 AI 명령에서 서버 쓰기를 금지합니다.
  allowsMutation: false;
  requiresActiveSession: true;
  // 같은 세션의 동일 command ID를 원자적으로 점유하여 중복 실행을 막아야 합니다.
  requiresReplayCheck: true;
  // 새 사용자 요청/세션 종료 이후 도착한 이전 응답을 실행하거나 UI에 반영하지 않습니다.
  requiresCurrentGeneration: true;
  // ID가 최근 서버 검색·사용자 선택 또는 해당 장소의 availability 조회에서 나온 것인지 확인합니다.
  provenance: 'none' | 'recentSearchOrUserSelection' | 'recentAvailabilityForPlace';
}>;
// PREPARE_WRITE의 requiresUserConfirmation은 실제 예약 제출에 적용됩니다. 초안 준비 자체는 자동 허용합니다.
export type VoiceCommandPolicy = CommonPolicy & (
  | Readonly<{ classification: 'READ'; automaticAction: 'query'; requiresUserConfirmation: false; requiresRuntimeLocation: boolean }>
  | Readonly<{ classification: 'PREPARE_WRITE'; automaticAction: 'draft'; requiresUserConfirmation: true; requiresFreshAvailability: true; allowedProductType: 'GENERAL' }>
  | Readonly<{ classification: 'SESSION_CONTROL'; automaticAction: 'stopSession'; requiresUserConfirmation: false }>
);
const common = {
  allowsMutation: false, requiresActiveSession: true, requiresReplayCheck: true, requiresCurrentGeneration: true,
} as const;

/**
 * 명령별 권한의 단일 기준입니다. #348/#349는 parser 통과 후 이 표의 전제조건을 검사합니다.
 * satisfies Record는 명령 추가 시 정책 누락을 컴파일 오류로 만들고, 중첩 freeze는 런타임 변경을 막습니다.
 * 예약 확정은 이 표에 추가하지 않고 앱 확인 화면의 사용자 이벤트로만 수행합니다.
 */
export const VOICE_COMMAND_POLICIES = Object.freeze({
  searchNearbyReservablePlaces: Object.freeze({ ...common, classification: 'READ', automaticAction: 'query', requiresUserConfirmation: false, requiresRuntimeLocation: true, provenance: 'none' } as const),
  getPlaceDetails: Object.freeze({ ...common, classification: 'READ', automaticAction: 'query', requiresUserConfirmation: false, requiresRuntimeLocation: false, provenance: 'recentSearchOrUserSelection' } as const),
  getAvailabilities: Object.freeze({ ...common, classification: 'READ', automaticAction: 'query', requiresUserConfirmation: false, requiresRuntimeLocation: false, provenance: 'recentSearchOrUserSelection' } as const),
  prepareReservation: Object.freeze({ ...common, classification: 'PREPARE_WRITE', automaticAction: 'draft', requiresUserConfirmation: true, requiresFreshAvailability: true, allowedProductType: 'GENERAL', provenance: 'recentAvailabilityForPlace' } as const),
  cancelVoiceSession: Object.freeze({ ...common, classification: 'SESSION_CONTROL', automaticAction: 'stopSession', requiresUserConfirmation: false, provenance: 'none' } as const),
} satisfies Record<VoiceCommandName, VoiceCommandPolicy>);
