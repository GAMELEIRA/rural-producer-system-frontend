import { environment } from '../../../environments/environment';

/** Rotas expostas pelo backend (rural-producer-system-backend, Spring Boot). */
export const API_ENDPOINTS = {
  register: `${environment.apiUrl}/auth/cadastrar`,
  login: `${environment.apiUrl}/auth/login`,
  forgotPassword: `${environment.apiUrl}/auth/recuperar-senha`,
  culturas: `${environment.apiUrl}/culturas`,
  talhoes: `${environment.apiUrl}/talhoes`,
  insumos: `${environment.apiUrl}/insumos`,
  produtos: `${environment.apiUrl}/produtos`,
} as const;
