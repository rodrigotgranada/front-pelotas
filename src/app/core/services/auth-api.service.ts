import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  ResendVerificationCodePayload,
  VerifyEmailPayload,
} from '../models/auth.model';
import { AuthTokenService } from '../auth/auth-token.service';
import { maybeNormalizeContactValue, onlyDigits } from '../utils/normalize.util';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(AuthTokenService);

  register(payload: RegisterRequest): Observable<AuthResponse> {
    const body: RegisterRequest = {
      ...payload,
      document: onlyDigits(payload.document),
      contacts: payload.contacts?.map((contact) => ({
        ...contact,
        value: maybeNormalizeContactValue(contact.type, contact.value),
      })),
    };

    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/register`, body)
      .pipe(tap((response) => this.persistAuthIfAvailable(response)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, payload)
      .pipe(tap((response) => this.persistAuthIfAvailable(response)));
  }

  verifyEmail(payload: VerifyEmailPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/verify-email`, payload)
      .pipe(tap((response) => this.persistAuthIfAvailable(response)));
  }

  resendVerificationCode(payload: ResendVerificationCodePayload): Observable<{ success?: boolean; message?: string }> {
    return this.http.post<{ success?: boolean; message?: string }>(
      `${environment.apiBaseUrl}/auth/resend-verification-code`,
      payload,
    );
  }

  logout(): void {
    this.tokenService.clearToken();
  }

  private persistAuthIfAvailable(response: AuthResponse): void {
    if (response.accessToken) {
      this.tokenService.setAuth(response.accessToken, response.roleCode ?? null);
      return;
    }

    this.tokenService.clearToken();
  }
}
