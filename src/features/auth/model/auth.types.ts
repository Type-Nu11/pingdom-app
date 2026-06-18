export type LoginRequest = {
  username: string;
  password: string;
};

export type User = {
  id: number;
  username: string;
  name: string;
  email: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user?: User;
};

export type SignupRequest = {
  username: string;
  name: string;
  email: string;
  password: string;
};

export type PhoneSendRequest = {
  phoneNumber: string;
};

export type PhoneVerifyRequest = {
  phoneNumber: string;
  code: string;
};
