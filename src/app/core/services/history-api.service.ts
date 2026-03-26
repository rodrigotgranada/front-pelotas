import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { History, CreateHistoryPayload, UpdateHistoryPayload } from '../models/history.model';
import { skipGlobalLoadingContext } from '../http/http-options.util';

@Injectable({ providedIn: 'root' })
export class HistoryApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/history`;

  listPublic(): Observable<History[]> {
    return this.http.get<History[]>(this.apiUrl);
  }

  listAdmin(): Observable<History[]> {
    return this.http.get<History[]>(`${this.apiUrl}/admin`);
  }

  getByIdOrSlug(idOrSlug: string): Observable<History> {
    return this.http.get<History>(`${this.apiUrl}/${idOrSlug}`);
  }

  create(payload: CreateHistoryPayload): Observable<History> {
    return this.http.post<History>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateHistoryPayload): Observable<History> {
    return this.http.put<History>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorder(ids: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reorder`, { ids });
  }
}
