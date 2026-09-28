import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../notifications/notification.service';

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  400: 'Dados inválidos. Revise as informações e tente novamente.',
  401: 'E-mail ou senha inválidos.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Este registro já existe.',
  422: 'Dados inválidos. Revise as informações e tente novamente.',
  500: 'Erro interno do servidor. Tente novamente mais tarde.',
  502: 'Servidor indisponível. Tente novamente mais tarde.',
  503: 'Servidor indisponível. Tente novamente mais tarde.',
  504: 'O servidor demorou para responder. Tente novamente.',
};

interface ApiErrorBody {
  mensagem?: unknown;
  message?: unknown;
}

interface ApiFieldError {
  campo?: unknown;
  mensagem?: unknown;
}

const nonEmpty = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Extrai a mensagem do corpo de erro do backend:
 * - `{ mensagem }` (regra de negócio, 401, 404, 500) ou `{ message }`;
 * - `[{ campo, mensagem }]` (erros de validação do @Valid).
 * Cai no mapa por status quando o corpo não traz mensagem.
 */
export function getErrorMessage(error: HttpErrorResponse): string {
  const body: unknown = error.error;

  if (Array.isArray(body)) {
    const messages = (body as ApiFieldError[])
      .map((e) => (nonEmpty(e.mensagem) ? e.mensagem : null))
      .filter((m): m is string => m !== null);
    if (messages.length) return messages.join(' ');
  } else if (body && typeof body === 'object') {
    const { mensagem, message } = body as ApiErrorBody;
    if (nonEmpty(mensagem)) return mensagem;
    if (nonEmpty(message)) return message;
  }

  return STATUS_MESSAGES[error.status] ?? 'Ocorreu um erro inesperado. Tente novamente.';
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notifications.error(getErrorMessage(error));
      return throwError(() => error);
    }),
  );
};
