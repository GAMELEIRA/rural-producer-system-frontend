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
import { MockCollectionStore } from './mock-collection.store';

const MOCK_LATENCY_MS = 400;

/** Erros que indicam "API indisponível" e habilitam o fallback. */
const UNAVAILABLE_STATUSES = new Set([0, 404, 502, 503, 504]);

/** Recursos CRUD simulados: URL base -> nome da coleção e campo de id. */
const CRUD_RESOURCES: Record<string, { resource: string; idField: string }> = {
  [API_ENDPOINTS.culturas]: { resource: 'culturas', idField: 'idCultura' },
  [API_ENDPOINTS.talhoes]: { resource: 'talhoes', idField: 'idTalhao' },
  [API_ENDPOINTS.insumos]: { resource: 'insumos', idField: 'idInsumo' },
  [API_ENDPOINTS.produtos]: { resource: 'produtos', idField: 'idProduto' },
};

interface MockStores {
  auth: MockAuthStore;
  collections: MockCollectionStore;
}

/**
 * Atende requisições com mocks locais quando a API real não está disponível
 * (ou sempre, conforme `environment.mockMode`).
 */
export const mockFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  const mode = environment.mockMode;
  if (mode === 'off') return next(req);

  const stores: MockStores = {
    auth: inject(MockAuthStore),
    collections: inject(MockCollectionStore),
  };

  if (mode === 'always') {
    const mocked = handleMock(req, stores);
    return mocked ? respond(req, mocked) : next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!UNAVAILABLE_STATUSES.has(error.status)) return throwError(() => error);

      const mocked = handleMock(req, stores);
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
  stores: MockStores,
): Observable<HttpEvent<unknown>> | null {
  if (req.method === 'POST') {
    switch (req.url) {
      case API_ENDPOINTS.register:
        return mockRegister(req.body as CadastroUsuarioDto, stores.auth);
      case API_ENDPOINTS.login:
        return mockLogin(req.body as AutenticacaoDto, stores.auth);
      case API_ENDPOINTS.forgotPassword:
        return of(new HttpResponse({ status: 204 }));
    }
  }

  return mockCrud(req, stores.collections);
}

/** Simula GET/POST/PUT/DELETE em `/recurso` e `/recurso/{id}`. */
function mockCrud(
  req: HttpRequest<unknown>,
  store: MockCollectionStore,
): Observable<HttpEvent<unknown>> | null {
  const match = /^(.*?)(?:\/(\d+))?$/.exec(req.url);
  if (!match) return null;

  const config = CRUD_RESOURCES[match[1]];
  if (!config) return null;

  const { resource, idField } = config;
  const id = match[2] !== undefined ? Number(match[2]) : null;
  const body = req.body as Record<string, unknown>;
  const notFound = () => mockError(404, 'Registro nao encontrado');

  if (req.method === 'GET' && id === null) {
    return of(new HttpResponse({ status: 200, body: store.list(resource) }));
  }
  if (req.method === 'GET' && id !== null) {
    const item = store.find(resource, idField, id);
    return item ? of(new HttpResponse({ status: 200, body: item })) : notFound();
  }
  if (req.method === 'POST' && id === null) {
    return of(new HttpResponse({ status: 201, body: store.create(resource, idField, body) }));
  }
  if (req.method === 'PUT' && id !== null) {
    const item = store.update(resource, idField, id, body);
    return item ? of(new HttpResponse({ status: 200, body: item })) : notFound();
  }
  if (req.method === 'DELETE' && id !== null) {
    return store.remove(resource, idField, id) ? of(new HttpResponse({ status: 204 })) : notFound();
  }
  return null;
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
