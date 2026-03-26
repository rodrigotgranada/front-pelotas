import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';
import { membershipEnabledGuard } from './core/guards/membership-enabled.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/pages/landing-page.component').then((m) => m.LandingPageComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/pages/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/forgot-password/pages/forgot-password-page.component').then((m) => m.ForgotPasswordPageComponent),
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/reset-password/pages/reset-password-page.component').then((m) => m.ResetPasswordPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/register/pages/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      {
        path: 'me',
        loadComponent: () => import('./features/me/pages/me-page.component').then((m) => m.MePageComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { allowedRoles: ['owner', 'admin'] },
        loadComponent: () => import('./features/users/pages/users-page.component').then((m) => m.UsersPageComponent),
      },
      {
        path: 'logs',
        canActivate: [roleGuard],
        data: { allowedRoles: ['owner', 'admin'] },
        loadComponent: () => import('./features/logs/pages/logs-page.component').then((m) => m.LogsPageComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'me',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes'),
  },
  {
    path: 'historia',
    loadComponent: () => import('./features/public-history/pages/history-page.component').then((m) => m.HistoryPageComponent),
  },
  {
    path: 'seja-socio',
    canActivate: [membershipEnabledGuard],
    loadComponent: () => import('./features/membership/pages/landing/membership-landing-page.component').then((m) => m.MembershipLandingPageComponent),
  },
  {
    path: 'seja-socio/adesao/:planId',
    canActivate: [authGuard, membershipEnabledGuard],
    loadComponent: () => import('./features/membership/pages/subscription/membership-subscription.component').then((m) => m.MembershipSubscriptionComponent),
  },
  {
    path: 'noticias/:slug',
    loadComponent: () => import('./features/public-news/pages/news-article-page.component').then((m) => m.NewsArticlePageComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./core/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
