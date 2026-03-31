import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Athlete } from './athletes-api.service';

export interface SquadMember {
  athleteId: string | Athlete;
  number?: number;
  role?: string;
}

export interface Squad {
  _id: string;
  year: number;
  competition: string;
  category: string;
  members: SquadMember[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SquadsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/squads`;

  findAll(params?: any): Observable<Squad[]> {
    return this.http.get<Squad[]>(this.apiUrl, { params });
  }

  findOne(id: string): Observable<Squad> {
    return this.http.get<Squad>(`${this.apiUrl}/${id}`);
  }

  create(squad: Partial<Squad>): Observable<Squad> {
    return this.http.post<Squad>(this.apiUrl, squad);
  }

  update(id: string, squad: Partial<Squad>): Observable<Squad> {
    return this.http.patch<Squad>(`${this.apiUrl}/${id}`, squad);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
