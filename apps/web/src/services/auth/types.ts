export interface AdminLoginDto {
  email: string;
  password: string;
  turnstileToken?: string;
}

export interface AdminLoginResponse {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    isEmailVerified?: boolean;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    role: string;
  };
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface VerifyEmailResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ResendOtpDto {
  email: string;
}

export interface RefreshTokenResponse {
  user: {
    name: string;
    role: string;
    isSuperBusiness?: boolean;
  };
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface ParticipantLoginDto {
  email: string;
  password: string;
  campaignId?: string;
}

export interface ParticipantLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
