import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Idol, CreateIdolPayload, UpdateIdolPayload } from '../models/idol.model';

@Injectable({
  providedIn: 'root'
})
export class IdolsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/idols`;

  listAdmin(): Observable<Idol[]> {
    return this.http.get<Idol[]>(this.apiUrl);
  }

  listPublic(): Observable<Idol[]> {
    return this.http.get<Idol[]>(`${environment.apiUrl}/public-idols`);
  }

  getById(id: string): Observable<Idol> {
    return this.http.get<Idol>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateIdolPayload): Observable<Idol> {
    return this.http.post<Idol>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateIdolPayload): Observable<Idol> {
    return this.http.put<Idol>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorder(ids: string[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/reorder`, { ids });
  }
}
