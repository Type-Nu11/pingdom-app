export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type SignupRequest = {
  username: string;
  name: string;
  email: string;
  password: string;
};
