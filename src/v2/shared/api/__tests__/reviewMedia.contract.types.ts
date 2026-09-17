import type { PlaceExplorationOperationRequestBody, PlaceExplorationOperationResponse } from '../placeExplorationContract';

type ReviewBody = Pick<PlaceExplorationOperationRequestBody<'create_3'>, 'content' | 'recommendReasons' | 'reviewMediaIds'>;
const body: ReviewBody = { content: 'Review', recommendReasons: ['FRIENDLY', 'CLEAN'], reviewMediaIds: [1] };
// @ts-expect-error New review writes must not include the deprecated singular field.
const legacy: ReviewBody = { content: 'Review', recommendReason: 'Friendly' };
// @ts-expect-error Localized labels are not server enum values.
const localized: ReviewBody = { content: 'Review', recommendReasons: ['친절해요'] };
const upload: PlaceExplorationOperationResponse<'upload_1', 201> = { reviewMediaId: 1, imageUrl: 'https://cdn.test/photo.jpg', contentType: 'image/jpeg', fileSize: 123, expiresAt: '2026-09-17T00:00:00Z' };
const cancelled: PlaceExplorationOperationResponse<'cancel_4', 204> = undefined;
void [body, legacy, localized, upload, cancelled];
