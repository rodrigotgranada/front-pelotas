import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sponsor, CreateSponsorDto, UpdateSponsorDto } from '../models/sponsor.model';

@Injectable({
  providedIn: 'root',
})
export class SponsorsService {
  private http = inject(HttpClient);
  private adminUrl = `${environment.apiBaseUrl}/sponsors`;
  private publicUrl = `${environment.apiBaseUrl}/public/sponsors`;

  /**
   * ADMIN ENDPOINTS
   */

  findAllAdmin(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.adminUrl);
  }

  findOne(id: string): Observable<Sponsor> {
    return this.http.get<Sponsor>(`${this.adminUrl}/${id}`);
  }

  create(data: CreateSponsorDto): Observable<Sponsor> {
    return this.http.post<Sponsor>(this.adminUrl, data);
  }

  update(id: string, data: UpdateSponsorDto): Observable<Sponsor> {
    return this.http.put<Sponsor>(`${this.adminUrl}/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }

  reorder(ids: string[]): Observable<void> {
    return this.http.patch<void>(`${this.adminUrl}/reorder`, { ids });
  }

  /**
   * PUBLIC ENDPOINTS
   */

  findAllPublic(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.publicUrl);
  }
}
