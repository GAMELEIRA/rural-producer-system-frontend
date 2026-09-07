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

const MOCK_LATENCY_MS = 300;

/**
 * Se a API real não responder (erro de rede, status 0), atende a requisição
 * com mocks locais. Habilitado por `environment.useMockFallback`.
 */
export const mockFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMockFallback) return next(req);

  const store = inject(MockAuthStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 0) return throwError(() => error);

      const mocked = handleMock(req, store);
      if (!mocked) return throwError(() => error);

      console.warn(`[mock] API indisponível, respondendo ${req.method} ${req.url} com mock.`);
      return mocked.pipe(delay(MOCK_LATENCY_MS));
    }),
  );
};

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

function mockRegister(body: RegisterRequest, store: MockAuthStore): Observable<HttpEvent<unknown>> {
  if (store.findByEmail(body.email)) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 409,
          statusText: 'Conflict',
          error: { message: 'E-mail já cadastrado' },
        }),
    );
  }
  return of(new HttpResponse({ status: 201, body: store.create(body) }));
}

function mockLogin(body: LoginRequest, store: MockAuthStore): Observable<HttpEvent<unknown>> {
  const user = store.findByEmail(body.email);
  if (!user || user.password !== body.password) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
          error: { message: 'Credenciais inválidas' },
        }),
    );
  }
  const response: LoginResponse = {
    token: `mock-token.${btoa(user.email)}.${Date.now()}`,
    user: store.toPublic(user),
  };
  return of(new HttpResponse({ status: 200, body: response }));
}
