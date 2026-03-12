import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConfirmEmailChangePayload,
  ConfirmPhoneVerificationPayload,
  RequestEmailChangePayload,
  RequestPhoneVerificationPayload,
  RegisterRequest,
  UpdateOwnUserPayload,
} from '../models/auth.model';
import { UpdateUserRequest, UserMeResponse, UserResponse } from '../models/user.model';
import { skipGlobalLoadingContext } from '../http/http-options.util';
import { maybeNormalizeContactValue, onlyDigits } from '../utils/normalize.util';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  create(payload: RegisterRequest): Observable<UserResponse> {
    const body: RegisterRequest = {
      ...payload,
      document: onlyDigits(payload.document),
      contacts: payload.contacts?.map((contact) => ({
        ...contact,
        value: maybeNormalizeContactValue(contact.type, contact.value),
      })),
    };

    return this.http.post<UserResponse>(`${environment.apiBaseUrl}/users`, body);
  }

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${environment.apiBaseUrl}/users`, skipGlobalLoadingContext());
  }

  getById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(
      `${environment.apiBaseUrl}/users/${id}`,
      skipGlobalLoadingContext(),
    );
  }

  getMe(): Observable<UserMeResponse> {
    return this.http.get<UserMeResponse>(`${environment.apiBaseUrl}/users/me`);
  }

  update(id: string, payload: UpdateUserRequest): Observable<UserResponse> {
    const body: UpdateUserRequest = {
      ...payload,
      document: payload.document ? onlyDigits(payload.document) : undefined,
      contacts: payload.contacts?.map((contact) => ({
        ...contact,
        value: maybeNormalizeContactValue(contact.type, contact.value),
      })),
    };

    return this.http.put<UserResponse>(`${environment.apiBaseUrl}/users/${id}`, body);
  }

  updateMe(payload: UpdateOwnUserPayload): Observable<UserMeResponse> {
    const body: UpdateOwnUserPayload = {
      ...payload,
      document: payload.document ? onlyDigits(payload.document) : undefined,
      contacts: payload.contacts?.map((contact) => ({
        ...contact,
        value: maybeNormalizeContactValue(contact.type, contact.value),
      })),
    };

    return this.http.put<UserMeResponse>(`${environment.apiBaseUrl}/users/me`, body);
  }

  requestEmailChange(payload: RequestEmailChangePayload): Observable<{ success?: boolean; message?: string }> {
    return this.http.post<{ success?: boolean; message?: string }>(
      `${environment.apiBaseUrl}/users/me/request-email-change`,
      payload,
    );
  }

  confirmEmailChange(payload: ConfirmEmailChangePayload): Observable<UserMeResponse> {
    return this.http.post<UserMeResponse>(`${environment.apiBaseUrl}/users/me/confirm-email-change`, payload);
  }

  requestPhoneVerification(
    payload: RequestPhoneVerificationPayload,
  ): Observable<{ success?: boolean; message?: string }> {
    const body: RequestPhoneVerificationPayload = {
      ...payload,
      phone: maybeNormalizeContactValue('phone', payload.phone),
    };

    return this.http.post<{ success?: boolean; message?: string }>(
      `${environment.apiBaseUrl}/users/me/request-phone-verification`,
      body,
    );
  }

  confirmPhoneVerification(payload: ConfirmPhoneVerificationPayload): Observable<UserMeResponse> {
    return this.http.post<UserMeResponse>(`${environment.apiBaseUrl}/users/me/confirm-phone-verification`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/users/${id}`);
  }
}
