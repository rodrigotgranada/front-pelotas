import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, from, map, Observable } from 'rxjs';
import { UserMeResponse } from '../models/user.model';
import { UsersApiService } from '../services/users-api.service';
import { AuthTokenService } from './auth-token.service';

export type HydrateSessionResult = 'ok' | 'no-token' | 'invalid-session' | 'error';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly usersApi = inject(UsersApiService);
  private readonly tokenService = inject(AuthTokenService);

  readonly me = signal<UserMeResponse | null>(null);
  readonly loading = signal(false);

  async hydrateSession(): Promise<HydrateSessionResult> {
    if (!this.tokenService.getToken()) {
      this.tokenService.setRoleCode(null);
      this.me.set(null);
      return 'no-token';
    }

    this.loading.set(true);

    try {
      const profile = await firstValueFrom(this.usersApi.getMe());
      this.tokenService.setRoleCode(profile.roleCode ?? this.tokenService.getRoleCode());
      this.me.set(profile);
      return 'ok';
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 404)) {
        this.tokenService.clearToken();
        this.me.set(null);
        return 'invalid-session';
      }

      return 'error';
    } finally {
      this.loading.set(false);
    }
  }

  refreshMe(): Observable<UserMeResponse | null> {
    return from(this.hydrateSession()).pipe(map(() => this.me()));
  }

  clear(): void {
    this.me.set(null);
  }
}
