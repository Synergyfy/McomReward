export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  refreshToken: string;
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
  access_token: string;
  refresh_token: string;
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
