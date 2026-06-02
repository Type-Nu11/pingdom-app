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

export type ChangePasswordRequest = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type ChangeUsernameRequest = {
  newUsername: string;
};
