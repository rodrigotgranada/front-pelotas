import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';
import { membershipEnabledGuard } from './core/guards/membership-enabled.guard';
import { squadsEnabledGuard } from './core/guards/squads-enabled.guard';
import { idolsEnabledGuard } from './core/guards/idols-enabled.guard';
import { matchesEnabledGuard } from './core/guards/matches-enabled.guard';

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
    path: 'calendario',
    canActivate: [matchesEnabledGuard],
    loadComponent: () => import('./features/public-matches/pages/calendar-page.component').then((m) => m.CalendarPageComponent),
  },
  {
    path: 'jogos/:id',
    canActivate: [matchesEnabledGuard],
    loadComponent: () => import('./features/public-matches/pages/match-details.component').then((m) => m.MatchDetailsComponent),
  },
  {
    path: 'historia',
    loadComponent: () => import('./features/public-history/pages/history-page.component').then((m) => m.HistoryPageComponent),
  },
  {
    path: 'idolos',
    canActivate: [idolsEnabledGuard],
    loadComponent: () => import('./features/public-idols/pages/public-idols-page.component').then((m) => m.PublicIdolsPageComponent),
  },
  {
    path: 'elenco',
    canActivate: [squadsEnabledGuard],
    loadComponent: () => import('./features/public-squads/pages/public-squads-page.component').then((m) => m.PublicSquadsPageComponent),
  },
  {
    path: 'elenco/:year/:competition',
    canActivate: [squadsEnabledGuard],
    loadComponent: () => import('./features/public-squads/pages/public-squads-page.component').then((m) => m.PublicSquadsPageComponent),
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
    path: 'noticias',
    loadComponent: () => import('./features/public-news/pages/news-list-page.component').then((m) => m.NewsListPageComponent),
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
