import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  // Hardcoding to bypass persistent environment import issues in this corrupted environment
  private readonly apiUrl = 'http://localhost:3000/api/membership';

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
