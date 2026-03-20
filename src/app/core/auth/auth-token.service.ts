import { Injectable, signal } from '@angular/core';
import { RoleCode } from '../models/role.model';

const TOKEN_STORAGE_KEY = 'pelotas.access-token';
const ROLE_CODE_STORAGE_KEY = 'pelotas.role-code';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly tokenSignal = signal<string | null>(this.readTokenFromStorage());
  private readonly roleCodeSignal = signal<RoleCode | null>(this.readRoleCodeFromStorage());

  readonly token = this.tokenSignal.asReadonly();
  readonly roleCode = this.roleCodeSignal.asReadonly();

  setAuth(token: string, roleCode: RoleCode | null): void {
    this.setToken(token);
    this.setRoleCode(roleCode);
  }

  setToken(token: string): void {
    this.tokenSignal.set(token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  clearToken(): void {
    this.tokenSignal.set(null);
    this.roleCodeSignal.set(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(ROLE_CODE_STORAGE_KEY);
  }

  setRoleCode(roleCode: RoleCode | null): void {
    this.roleCodeSignal.set(roleCode);

    if (roleCode) {
      localStorage.setItem(ROLE_CODE_STORAGE_KEY, roleCode);
      return;
    }

    localStorage.removeItem(ROLE_CODE_STORAGE_KEY);
  }

  getRoleCode(): RoleCode | null {
    return this.roleCodeSignal();
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private readTokenFromStorage(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private readRoleCodeFromStorage(): RoleCode | null {
    try {
      const value = localStorage.getItem(ROLE_CODE_STORAGE_KEY);

      if (value === 'owner' || value === 'admin' || value === 'editor' || value === 'socio' || value === 'user') {
        return value;
      }

      return null;
    } catch {
      return null;
    }
  }
}
