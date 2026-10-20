import { isReservationSubmissionRequest } from '../reservationSubmission';

test.each(['확정해줘', '예약 신청해 주세요', '네, 이대로 예약해줘', '확인했어요. 예약 확정해주세요', '지금 예약을 신청해주세요', '예약할게요', 'Please confirm this reservation'])('recognizes explicit final user submission: %s', text => {
  expect(isReservationSubmissionRequest(text)).toBe(true);
});
test.each(['', '예약 가능한지 확인해줘', '확정하지 마', '예약하지 말아줘', '예약 신청해줘라고 말하면 돼?', '3명으로 변경하고 예약해줘', '내일 2명 예약해줘', '예약을 취소해줘', '확인해줘', '예약 확정됐나요?', '예약 신청하지 않을게요', '확정해줘'.repeat(100)])('does not infer consent from questions, changes, negation or quoted requests: %s', text => {
  expect(isReservationSubmissionRequest(text)).toBe(false);
});
