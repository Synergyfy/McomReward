export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    role: string;
  };
}
