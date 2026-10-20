/** Only the user's finalized input can authorize submission of the currently displayed review.
 * Never run this on provider prose, original requests, or accumulated conversation context.
 */
export function isReservationSubmissionRequest(text: string): boolean {
  if (text.length > 120) return false;
  const value = text.trim().replace(/[.!?。！？,，]/g, '').replace(/\s+/g, '');
  return /^(?:(?:네|예|응|좋아|좋아요|알겠어|알겠습니다|확인했어|확인했어요|확인했습니다|이대로|그대로|지금|최종))*(?:예약(?:을)?(?:신청|확정|접수|진행)?|확정|신청|접수)(?:해|해줘|해줘요|해주세요|해주십시오|해주시겠어요|해줄래|해줄래요|할게|할게요|하겠습니다)$/.test(value)
    || /^(?:please\s+)?(?:submit|confirm)\s+(?:this\s+|the\s+|my\s+)?(?:reservation|booking)[.!]?$/i.test(text.trim());
}
