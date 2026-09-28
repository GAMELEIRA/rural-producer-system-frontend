export interface User {
  id?: string | number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone?: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
