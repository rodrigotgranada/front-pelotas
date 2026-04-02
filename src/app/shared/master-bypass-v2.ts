import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Routes } from '@angular/router';
import { environment } from '../../environments/environment';

// --- SHARED MODELS ---
export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'quarterly' | 'yearly';
  slug?: string;
  benefits: string[];
  isActive: boolean;
}

import { History } from '../core/models/history.model';
export type { History };

// --- MEMBERSHIP SERVICE ---
@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/membership`;

  // Public
  getPlans(): Observable<MembershipPlan[]> { return this.http.get<MembershipPlan[]>(`${this.apiUrl}/plans`); }
  getPlan(id: string): Observable<MembershipPlan> { return this.http.get<MembershipPlan>(`${this.apiUrl}/plans/${id}`); }
  enroll(planId: string, paymentMethod: string = 'pix'): Observable<any> { return this.http.post(`${this.apiUrl}/enroll`, { planId, paymentMethod }); }
  
  // Admin
  getAllPlans(): Observable<MembershipPlan[]> { return this.http.get<MembershipPlan[]>(`${this.apiUrl}/admin/plans`); }
  createPlan(plan: Partial<MembershipPlan>): Observable<MembershipPlan> { return this.http.post<MembershipPlan>(`${this.apiUrl}/admin/plans`, plan); }
  updatePlan(id: string, plan: Partial<MembershipPlan>): Observable<MembershipPlan> { return this.http.put<MembershipPlan>(`${this.apiUrl}/admin/plans/${id}`, plan); }
  deletePlan(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/admin/plans/${id}`); }
}

// --- HISTORY SERVICE ---
@Injectable({
  providedIn: 'root'
})
export class HistoryApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/history`;

  listPublic(): Observable<History[]> { return this.http.get<History[]>(this.apiUrl); }
  listAdmin(): Observable<History[]> { return this.http.get<History[]>(`${this.apiUrl}/admin`); }
  getById(id: string): Observable<History> { return this.http.get<History>(`${this.apiUrl}/${id}`); }
  create(data: Partial<History>): Observable<History> { return this.http.post<History>(this.apiUrl, data); }
  update(id: string, data: Partial<History>): Observable<History> { return this.http.put<History>(`${this.apiUrl}/${id}`, data); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  reorder(ids: string[]): Observable<void> { return this.http.put<void>(`${this.apiUrl}/reorder`, { ids }); }
}

// --- ROUTES ---
export const routes: Routes = [
  { path: "", pathMatch: "full", loadComponent: () => import("../features/landing/pages/landing-page.component").then(m => m.LandingPageComponent) },
  { path: "login", loadComponent: () => import("../features/login/pages/login-page.component").then(m => m.LoginPageComponent) },
  { path: "forgot-password", loadComponent: () => import("../features/forgot-password/pages/forgot-password-page.component").then(m => m.ForgotPasswordPageComponent) },
  { path: "reset-password", loadComponent: () => import("../features/reset-password/pages/reset-password-page.component").then(m => m.ResetPasswordPageComponent) },
  { path: "register", loadComponent: () => import("../features/register/pages/register-page.component").then(m => m.RegisterPageComponent) },
  {
    path: "app",
    children: [
      { path: "me", loadComponent: () => import("../features/me/pages/me-page.component").then(m => m.MePageComponent) },
      { path: "users", loadComponent: () => import("../features/users/pages/users-page.component").then(m => m.UsersPageComponent) },
      { path: "logs", loadComponent: () => import("../features/logs/pages/logs-page.component").then(m => m.LogsPageComponent) },
      { path: "", pathMatch: "full", redirectTo: "me" }
    ]
  },
  { path: "admin", loadChildren: () => import("../features/admin/admin.routes") },
  { path: "historia", loadComponent: () => import("../features/public-history/pages/history-page.component").then(m => m.HistoryPageComponent) },
  { path: "idolos", loadComponent: () => import("../features/public-idols/pages/public-idols-page.component").then(m => m.PublicIdolsPageComponent) },
  { path: "seja-socio", loadComponent: () => import("../features/membership/pages/landing/membership-landing-page.component").then(m => m.MembershipLandingPageComponent) },
  { path: "seja-socio/adesao/:planId", loadComponent: () => import("../features/membership/pages/subscription/membership-subscription.component").then(m => m.MembershipSubscriptionComponent) },
  { path: "noticias/:slug", loadComponent: () => import("../features/public-news/pages/news-article-page.component").then(m => m.NewsArticlePageComponent) },
  { path: "**", loadComponent: () => import("../core/pages/not-found/not-found.component").then(m => m.NotFoundComponent) }
];
