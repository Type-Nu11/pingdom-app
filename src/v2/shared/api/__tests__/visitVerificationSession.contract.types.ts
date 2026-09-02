import type {
  VisitVerificationOperationRequestBody,
  VisitVerificationOperationResponse,
  VisitVerificationSchema,
} from '../visitVerificationContract';

export type StartBody = VisitVerificationOperationRequestBody<'start'>;
export type ObservationBody = VisitVerificationOperationRequestBody<'submitObservation'>;
export type StartResponse = VisitVerificationOperationResponse<'start', 201>;
export type ObservationResponse = VisitVerificationOperationResponse<'submitObservation', 200>;
export type ServerError = VisitVerificationSchema<'ErrorResponse'>;
export type ServerValidationError = VisitVerificationSchema<'ValidationErrorResponse'>;

const start: StartBody = {
  accuracyMeters: 3,
  latitude: 35,
  longitude: 128,
  observedAt: '2026-09-02T01:00:00Z',
  placeId: 17,
};
const observation: ObservationBody = {
  accuracyMeters: 4,
  latitude: 35,
  longitude: 128,
  observedAt: '2026-09-02T01:00:15Z',
};

void start;
void observation;
