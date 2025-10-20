export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
}
