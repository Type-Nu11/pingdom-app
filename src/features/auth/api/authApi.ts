import { api } from '../../../shared/api/apiClient';
import type {
  LoginRequest,
  LoginResponse,
  PhoneSendRequest,
  PhoneVerifyRequest,
  SignupRequest,
} from '../model/auth.types';

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);

    if (!data.accessToken) {
      throw new Error('로그인 응답에 accessToken이 없습니다.');
    }

    return data;
  },
  signup: async (payload: SignupRequest): Promise<void> => {
    await api.post('/auth/signup', payload);
  },
  sendPhoneCode: async (payload: PhoneSendRequest): Promise<void> => {
    await api.post('/auth/phone/send', payload);
  },
  verifyPhoneCode: async (payload: PhoneVerifyRequest): Promise<void> => {
    await api.post('/auth/phone/verify', payload);
  },
};
