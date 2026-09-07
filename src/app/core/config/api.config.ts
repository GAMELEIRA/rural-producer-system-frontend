import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  register: `${environment.apiUrl}/api/v1/user`,
  login: `${environment.apiUrl}/api/user/login`,
  forgotPassword: `${environment.apiUrl}/api/v1/user/forgot-password`,
} as const;
