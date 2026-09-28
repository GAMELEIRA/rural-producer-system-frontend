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
import {
  AutenticacaoDto,
  CadastroUsuarioDto,
  DetalhamentoUsuarioDto,
  TokenJwtDto,
} from '../auth/auth-api.dto';
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
      return mockRegister(req.body as CadastroUsuarioDto, store);
    case API_ENDPOINTS.login:
      return mockLogin(req.body as AutenticacaoDto, store);
    case API_ENDPOINTS.forgotPassword:
      return of(new HttpResponse({ status: 204 }));
    default:
      return null;
  }
}

function mockError(status: number, message: string): Observable<never> {
  // Mesmo formato de erro do backend (TratadorDeErros): { mensagem }
  return throwError(() => new HttpErrorResponse({ status, error: { mensagem: message } }));
}

function mockRegister(
  body: CadastroUsuarioDto,
  store: MockAuthStore,
): Observable<HttpEvent<unknown>> {
  if (store.findByEmail(body.email)) {
    return mockError(400, 'Ja existe um usuario cadastrado com este e-mail!');
  }
  const user = store.create(body);
  const response: DetalhamentoUsuarioDto = {
    idUsuario: user.idUsuario,
    nome: user.nome,
    sobrenome: user.sobrenome,
    email: user.email,
    cpf: user.cpf,
    telefone: user.telefone,
    dataCadastro: user.dataCadastro,
    ativo: true,
  };
  return of(new HttpResponse({ status: 201, body: response }));
}

function mockLogin(body: AutenticacaoDto, store: MockAuthStore): Observable<HttpEvent<unknown>> {
  const user = store.findByEmail(body.email);
  if (!user || user.senha !== body.senha) {
    return mockError(401, 'Credenciais invalidas (e-mail ou senha incorretos)');
  }
  const response: TokenJwtDto = {
    token: `mock-token.${btoa(user.email)}.${Date.now()}`,
    tipo: 'Bearer',
    idUsuario: user.idUsuario,
    nome: user.nome,
    email: user.email,
  };
  return of(new HttpResponse({ status: 200, body: response }));
}
