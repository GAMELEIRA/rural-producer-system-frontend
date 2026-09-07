import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RegisterRequest, User } from '../models/user.model';

const USERS_KEY = 'mgr.mock.users';

interface MockUser extends User {
  id: number;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class MockAuthStore {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  findByEmail(email: string): MockUser | undefined {
    return this.load().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  create(payload: RegisterRequest): User {
    const users = this.load();
    const user: MockUser = { id: Date.now(), ...payload };
    users.push(user);
    this.save(users);
    return this.toPublic(user);
  }

  toPublic(user: MockUser): User {
    const { password: _password, ...publicUser } = user;
    return publicUser;
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
