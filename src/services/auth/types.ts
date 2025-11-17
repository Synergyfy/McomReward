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

export interface RefreshTokenResponse {
  user: {
    name: string;
    role: string;
  };
  access_token: string;
  refresh_token: string;
}