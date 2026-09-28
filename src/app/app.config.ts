import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { loadingInterceptor } from './core/loading/loading.interceptor';
import { mockFallbackInterceptor } from './core/mocks/mock-fallback.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      // Ordem: loading -> erro -> auth -> mock (o mock é o mais próximo do backend).
      withInterceptors([
        loadingInterceptor,
        errorInterceptor,
        authInterceptor,
        mockFallbackInterceptor,
      ]),
    ),
    provideClientHydration(),
  ],
};
