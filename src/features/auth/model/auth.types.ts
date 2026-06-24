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
  email: string;
  password: string;
  birthYear: number;
  profileImageUrl?: string;
  language: string;
  country: string;
};

export type SignupResponse = {
  id: number;
  username: string;
  email: string;
  birthYear: number;
  profileImageUrl?: string;
  language: string;
  country: string;
};

export type ChangePasswordRequest = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export type ChangeUsernameRequest = {
  newUsername: string;
};

export type PhoneSendRequest = {
  phoneNumber: string;
};

export type PhoneVerifyRequest = {
  phoneNumber: string;
  code: string;
};
