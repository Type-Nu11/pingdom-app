/**
 * 전화번호 인증 API — 현재 서버 미구현이라 mock.
 *
 * 서버 엔드포인트(POST /auth/phone/send, POST /auth/phone/verify)가 생기면
 * 이 파일의 두 함수 본문만 api.post(...) 호출로 교체하면 된다.
 * 화면/훅은 이 모듈만 바라보므로 다른 파일은 수정할 필요 없음.
 */

export type SendPhoneCodeRequest = { phoneNumber: string };
export type VerifyPhoneCodeRequest = { phoneNumber: string; code: string };

const MOCK_DELAY_MS = 600;
const MOCK_VALID_CODE = '123456';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const phoneVerificationApi = {
  // TODO(server): POST /auth/phone/send
  sendPhoneCode: async (_payload: SendPhoneCodeRequest): Promise<void> => {
    await delay(MOCK_DELAY_MS);
  },

  // TODO(server): POST /auth/phone/verify
  verifyPhoneCode: async (payload: VerifyPhoneCodeRequest): Promise<void> => {
    await delay(MOCK_DELAY_MS);
    if (payload.code !== MOCK_VALID_CODE) {
      throw new Error('인증번호가 올바르지 않습니다.');
    }
  },
};
