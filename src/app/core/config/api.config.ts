import { environment } from '../../../environments/environment';

/** Rotas expostas pelo backend (rural-producer-system-backend, Spring Boot). */
export const API_ENDPOINTS = {
  register: `${environment.apiUrl}/auth/cadastrar`,
  login: `${environment.apiUrl}/auth/login`,
  forgotPassword: `${environment.apiUrl}/auth/recuperar-senha`,
} as const;
