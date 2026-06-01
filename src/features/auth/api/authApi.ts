import { api } from '../../../shared/api/apiClient';
import type {
  ChangePasswordRequest,
  ChangeUsernameRequest,
  LoginRequest,
  LoginResponse,
  SignupRequest,
} from '../model/auth.types';

type RawLoginResponse =
  | LoginResponse
  | {
      data?: LoginResponse;
      accessToken?: string;
      refreshToken?: string;
    };

function toLoginResponse(response: RawLoginResponse): LoginResponse {
  if ('data' in response && response.data?.accessToken) {
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken ?? '',
    };
  }

  if ('accessToken' in response && response.accessToken) {
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken ?? '',
    };
  }

  throw new Error('로그인 응답에 accessToken이 없습니다.');
}

export const authApi = {
  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    // api.post 뒤의 <string>을 지우거나 <any>로 둡니다.
    await api.post('/users/change-pw', payload);
  },
  changeUsername: async (payload: ChangeUsernameRequest): Promise<void> => {
    await api.post('/users/change-id', payload);
  },
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<RawLoginResponse>('/auth/login', payload);
    return toLoginResponse(data);
  },
  signup: async (payload: SignupRequest): Promise<void> => {
    await api.post('/auth/signup', payload);
  },
};
