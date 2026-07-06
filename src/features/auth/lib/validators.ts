export type FieldValidationResult = string | null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// 010-1234-5678 / 010 1234 5678 / 01012345678 모두 허용
const PHONE_PATTERN = /^01[016789][ -]?\d{3,4}[ -]?\d{4}$/;
const VERIFICATION_CODE_LENGTH = 6;

export const validateUsername = (username: string): FieldValidationResult => {
  if (!username.trim()) return '아이디를 입력해주세요';
  return null;
};

export const validateEmail = (email: string): FieldValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) return '이메일을 입력해주세요';
  if (!EMAIL_PATTERN.test(trimmed)) return '올바른 이메일 형식이 아닙니다';
  return null;
};

export const validatePhoneNumber = (phoneNumber: string): FieldValidationResult => {
  const trimmed = phoneNumber.trim();
  if (!trimmed) return '전화번호를 입력해주세요';
  if (!PHONE_PATTERN.test(trimmed)) return '올바른 전화번호 형식이 아닙니다';
  return null;
};

export const validatePassword = (password: string): FieldValidationResult => {
  if (!password.trim()) return '비밀번호를 입력해주세요';
  return null;
};

export const validatePasswordConfirm = (
  password: string,
  passwordConfirm: string,
): FieldValidationResult => {
  if (!passwordConfirm.trim()) return '비밀번호를 한번 더 입력해주세요';
  if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다';
  return null;
};

export const isVerificationCodeComplete = (code: string): boolean =>
  code.trim().length === VERIFICATION_CODE_LENGTH;
