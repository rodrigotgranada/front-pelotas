import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PreviousClub {
  club: string;
  yearStart: number;
  yearEnd?: number;
}

export interface Athlete {
  _id: string;
  name: string;
  nickname?: string;
  photoUrl: string;
  photoStorageKey?: string;
  positions: string[];
  dateOfBirth?: string;
  height?: number;
  hometown?: string;
  preferredFoot?: string;
  previousClubs: PreviousClub[];
  isStaff: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AthletesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/athletes`;

  findAll(params?: any): Observable<Athlete[]> {
    return this.http.get<Athlete[]>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<Athlete> {
    return this.http.get<Athlete>(`${this.apiUrl}/${id}`);
  }

  create(athlete: Partial<Athlete>): Observable<Athlete> {
    return this.http.post<Athlete>(this.apiUrl, athlete);
  }

  update(id: string, athlete: Partial<Athlete>): Observable<Athlete> {
    return this.http.patch<Athlete>(`${this.apiUrl}/${id}`, athlete);
  }

  uploadImage(file: File): Observable<{ success: number; file: { url: string } }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ success: number; file: { url: string } }>(`${this.apiUrl}/upload-image`, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
