import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MembershipInterest {
  id: string;
  userId?: any;
  name: string;
  email: string;
  phone: string;
  planId: any;
  isRead: boolean;
  status: string;
  createdAt: string;
}

export interface CreateInterestDto {
  userId?: string;
  name: string;
  email: string;
  phone: string;
  planId: string;
}

@Injectable({ providedIn: 'root' })
export class MembershipInterestApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/membership-interests`;

  create(dto: CreateInterestDto): Observable<MembershipInterest> {
    return this.http.post<MembershipInterest>(this.apiUrl, dto);
  }

  getAdminInterests(): Observable<MembershipInterest[]> {
    return this.http.get<MembershipInterest[]>(`${this.apiUrl}/admin`);
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/admin/unread-count`);
  }

  markAsRead(id: string): Observable<MembershipInterest> {
    return this.http.patch<MembershipInterest>(`${this.apiUrl}/admin/${id}/read`, {});
  }

  updateStatus(id: string, status: string): Observable<MembershipInterest> {
    return this.http.patch<MembershipInterest>(`${this.apiUrl}/admin/${id}/status`, { status });
  }
}
