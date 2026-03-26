import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';

// --- SERVICE ---
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
  private readonly apiUrl = 'http://localhost:3000/api/membership';

  getPlans(): Observable<MembershipPlan[]> { return this.http.get<MembershipPlan[]>(`${this.apiUrl}/plans/public`); }
  getPlan(id: string): Observable<MembershipPlan> { return this.http.get<MembershipPlan>(`${this.apiUrl}/plans/${id}`); }
  enroll(planId: string, paymentMethod: string = 'mock'): Observable<any> { return this.http.post(`${this.apiUrl}/enroll`, { planId, paymentMethod }); }
  getAllPlans(): Observable<MembershipPlan[]> { return this.http.get<MembershipPlan[]>(`${this.apiUrl}/plans/admin`); }
  createPlan(plan: Partial<MembershipPlan>): Observable<MembershipPlan> { return this.http.post<MembershipPlan>(`${this.apiUrl}/plans`, plan); }
  updatePlan(id: string, plan: Partial<MembershipPlan>): Observable<MembershipPlan> { return this.http.patch<MembershipPlan>(`${this.apiUrl}/plans/${id}`, plan); }
  deletePlan(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/plans/${id}`); }
}

// --- ROUTES ---
export const routes: Routes = [
  { path: "", pathMatch: "full", loadComponent: () => import("./features/landing/pages/landing-page.component").then(m => m.LandingPageComponent) },
  { path: "login", canActivate: [guestGuard], loadComponent: () => import("./features/login/pages/login-page.component").then(m => m.LoginPageComponent) },
  { path: "forgot-password", canActivate: [guestGuard], loadComponent: () => import("./features/forgot-password/pages/forgot-password-page.component").then(m => m.ForgotPasswordPageComponent) },
  { path: "reset-password", canActivate: [guestGuard], loadComponent: () => import("./features/reset-password/pages/reset-password-page.component").then(m => m.ResetPasswordPageComponent) },
  { path: "register", canActivate: [guestGuard], loadComponent: () => import("./features/register/pages/register-page.component").then(m => m.RegisterPageComponent) },
  {
    path: "app",
    canActivate: [authGuard],
    children: [
      { path: "me", loadComponent: () => import("./features/me/pages/me-page.component").then(m => m.MePageComponent) },
      { path: "users", canActivate: [roleGuard], data: { allowedRoles: ["owner", "admin"] }, loadComponent: () => import("./features/users/pages/users-page.component").then(m => m.UsersPageComponent) },
      { path: "logs", canActivate: [roleGuard], data: { allowedRoles: ["owner", "admin"] }, loadComponent: () => import("./features/logs/pages/logs-page.component").then(m => m.LogsPageComponent) },
      { path: "", pathMatch: "full", redirectTo: "me" }
    ]
  },
  { path: "admin", canActivate: [authGuard], loadChildren: () => import("./features/admin/admin.routes") },
  { path: "historia", loadComponent: () => import("./features/public-history/pages/history-page.component").then(m => m.HistoryPageComponent) },
  { path: "seja-socio", loadComponent: () => import("./features/membership/pages/landing/membership-landing-page.component").then(m => m.MembershipLandingPageComponent) },
  { path: "seja-socio/adesao/:planId", canActivate: [authGuard], loadComponent: () => import("./features/membership/pages/subscription/membership-subscription.component").then(m => m.MembershipSubscriptionComponent) },
  { path: "noticias/:slug", loadComponent: () => import("./features/public-news/pages/news-article-page.component").then(m => m.NewsArticlePageComponent) },
  { path: "**", loadComponent: () => import("./core/pages/not-found/not-found.component").then(m => m.NotFoundComponent) }
];
