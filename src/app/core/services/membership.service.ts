import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/membership`;

  constructor() { }

  // Public methods
  getPlans(): Observable<MembershipPlan[]> {
    return this.http.get<MembershipPlan[]>(`${this.apiUrl}/plans/public`);
  }

  getPlan(id: string): Observable<MembershipPlan> {
    return this.http.get<MembershipPlan>(`${this.apiUrl}/plans/${id}`);
  }

  enroll(planId: string, paymentMethod: string = 'mock'): Observable<any> {
    return this.http.post(`${this.apiUrl}/enroll`, { planId, paymentMethod });
  }

  // Admin methods
  getAllPlans(): Observable<MembershipPlan[]> {
    return this.http.get<MembershipPlan[]>(`${this.apiUrl}/plans/admin`);
  }

  createPlan(plan: Partial<MembershipPlan>): Observable<MembershipPlan> {
    return this.http.post<MembershipPlan>(`${this.apiUrl}/plans`, plan);
  }

  updatePlan(id: string, plan: Partial<MembershipPlan>): Observable<MembershipPlan> {
    return this.http.patch<MembershipPlan>(`${this.apiUrl}/plans/${id}`, plan);
  }

  deletePlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plans/${id}`);
  }
}