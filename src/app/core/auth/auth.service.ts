import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../config/api.config';
import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from '../models/user.model';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storage = inject(TokenStorageService);

  private readonly tokenSignal = signal<string | null>(this.storage.getToken());
  private readonly userSignal = signal<User | null>(this.storage.getUser<User>());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal());

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(API_ENDPOINTS.login, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(API_ENDPOINTS.register, payload);
  }

  forgotPassword(payload: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.forgotPassword, payload);
  }

  logout(): void {
    this.storage.clear();
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    void this.router.navigate(['/auth/login']);
  }

  private setSession(res: LoginResponse): void {
    this.storage.setToken(res.token);
    this.tokenSignal.set(res.token);
    if (res.user) {
      this.storage.setUser(res.user);
      this.userSignal.set(res.user);
    }
  }
}
