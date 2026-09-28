import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CadastroUsuarioDto } from '../auth/auth-api.dto';

const USERS_KEY = 'mgr.mock.users';

/** Usuário persistido pelo mock, no mesmo formato dos DTOs do backend. */
export interface MockUser extends CadastroUsuarioDto {
  idUsuario: number;
  dataCadastro: string;
}

@Injectable({ providedIn: 'root' })
export class MockAuthStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  findByEmail(email: string): MockUser | undefined {
    return this.load().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  create(payload: CadastroUsuarioDto): MockUser {
    const users = this.load();
    const user: MockUser = {
      idUsuario: Date.now(),
      dataCadastro: new Date().toISOString(),
      ...payload,
    };
    users.push(user);
    this.save(users);
    return user;
  }

  private load(): MockUser[] {
    if (!this.isBrowser) return [];
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
  }

  private save(users: MockUser[]): void {
    if (this.isBrowser) localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}
