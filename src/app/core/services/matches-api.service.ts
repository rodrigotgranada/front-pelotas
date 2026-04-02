import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Competition, Match, Team, CreateMatchPayload, MatchStatus } from '../models/match.model';

@Injectable({
  providedIn: 'root',
})
export class MatchesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}`;

  // --- MATCHES ---
  listMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches`);
  }

  getNextMatch(): Observable<Match | null> {
    return this.http.get<Match | null>(`${this.baseUrl}/matches/next`);
  }

  getLastResult(): Observable<Match | null> {
    return this.http.get<Match | null>(`${this.baseUrl}/matches/last-result`);
  }

  getMatch(id: string): Observable<Match> {
    return this.http.get<Match>(`${this.baseUrl}/matches/${id}`);
  }

  createMatch(data: CreateMatchPayload): Observable<Match> {
    return this.http.post<Match>(`${this.baseUrl}/matches`, data);
  }

  updateMatch(id: string, data: Partial<CreateMatchPayload>): Observable<Match> {
    return this.http.put<Match>(`${this.baseUrl}/matches/${id}`, data);
  }

  finishMatch(id: string, newsId?: string): Observable<Match> {
    const url = newsId ? `${this.baseUrl}/matches/${id}/finish?newsId=${newsId}` : `${this.baseUrl}/matches/${id}/finish`;
    return this.http.patch<Match>(url, {});
  }

  deleteMatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/matches/${id}`);
  }

  // --- COMPETITIONS ---
  listCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.baseUrl}/competitions`);
  }

  getActiveCompetitions(): Observable<Competition[]> {
    return this.http.get<Competition[]>(`${this.baseUrl}/competitions/active`);
  }

  createCompetition(data: Partial<Competition>): Observable<Competition> {
    return this.http.post<Competition>(`${this.baseUrl}/competitions`, data);
  }

  updateCompetition(id: string, data: Partial<Competition>): Observable<Competition> {
    return this.http.put<Competition>(`${this.baseUrl}/competitions/${id}`, data);
  }

  deleteCompetition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/competitions/${id}`);
  }

  // --- TEAMS (OPPONENTS) ---
  listTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/teams`);
  }

  createTeam(data: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/teams`, data);
  }

  updateTeam(id: string, data: Partial<Team>): Observable<Team> {
    return this.http.put<Team>(`${this.baseUrl}/teams/${id}`, data);
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/teams/${id}`);
  }

  uploadTeamLogo(file: Blob): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file, 'team-logo.jpg');
    return this.http.post<{ url: string }>(`${this.baseUrl}/teams/upload-image`, formData);
  }
}
