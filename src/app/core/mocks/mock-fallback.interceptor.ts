import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../config/api.config';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';
import { MockAuthStore } from './mock-auth.store';

const MOCK_LATENCY_MS = 400;

/** Erros que indicam "API indisponível" e habilitam o fallback. */
const UNAVAILABLE_STATUSES = new Set([0, 404, 502, 503, 504]);

/**
 * Atende requisições com mocks locais quando a API real não está disponível
 * (ou sempre, conforme `environment.mockMode`).
 */
export const mockFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  const mode = environment.mockMode;
  if (mode === 'off') return next(req);

  const store = inject(MockAuthStore);

  if (mode === 'always') {
    const mocked = handleMock(req, store);
    return mocked ? respond(req, mocked) : next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!UNAVAILABLE_STATUSES.has(error.status)) return throwError(() => error);

      const mocked = handleMock(req, store);
      return mocked ? respond(req, mocked) : throwError(() => error);
    }),
  );
};

function respond(
  req: HttpRequest<unknown>,
  mocked: Observable<HttpEvent<unknown>>,
): Observable<HttpEvent<unknown>> {
  console.warn(`[mock] respondendo ${req.method} ${req.url} com mock local.`);
  return mocked.pipe(delay(MOCK_LATENCY_MS));
}

function handleMock(
  req: HttpRequest<unknown>,
  store: MockAuthStore,
): Observable<HttpEvent<unknown>> | null {
  if (req.method !== 'POST') return null;

  switch (req.url) {
    case API_ENDPOINTS.register:
      return mockRegister(req.body as RegisterRequest, store);
    case API_ENDPOINTS.login:
      return mockLogin(req.body as LoginRequest, store);
    case API_ENDPOINTS.forgotPassword:
      return of(new HttpResponse({ status: 204 }));
    default:
      return null;
  }
}

function mockError(status: number, message: string): Observable<never> {
  return throwError(() => new HttpErrorResponse({ status, error: { message } }));
}

function mockRegister(body: RegisterRequest, store: MockAuthStore): Observable<HttpEvent<unknown>> {
  if (store.findByEmail(body.email)) {
    return mockError(409, 'Já existe uma conta com este e-mail.');
  }
  return of(new HttpResponse({ status: 201, body: store.create(body) }));
}

function mockLogin(body: LoginRequest, store: MockAuthStore): Observable<HttpEvent<unknown>> {
  const user = store.findByEmail(body.email);
  if (!user || user.password !== body.password) {
    return mockError(401, 'E-mail ou senha inválidos.');
  }
  const response: LoginResponse = {
    token: `mock-token.${btoa(user.email)}.${Date.now()}`,
    user: store.toPublic(user),
  };
  return of(new HttpResponse({ status: 200, body: response }));
}
