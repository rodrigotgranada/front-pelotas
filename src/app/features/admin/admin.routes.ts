import { Routes } from '@angular/router';
import { rolesGuard } from '../../core/guards/roles.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export default [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-page.component').then((c) => c.DashboardPageComponent),
        canActivate: [rolesGuard(['owner', 'socio', 'admin', 'editor'])],
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/admin-users-page.component').then((c) => c.AdminUsersPageComponent),
        canActivate: [rolesGuard(['owner', 'socio', 'admin'])],
      },
      {
        path: 'news',
        loadComponent: () => import('./pages/news/admin-news-page.component').then((c) => c.AdminNewsPageComponent),
        canActivate: [rolesGuard(['owner', 'socio', 'admin', 'editor'])],
      },
      {
        path: 'newsletter',
        loadComponent: () => import('./pages/newsletter-admin/newsletter-admin-page.component').then((c) => c.AdminNewsletterPageComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'news/editor/:id',
        loadComponent: () => import('./pages/news/admin-news-editor.component').then((c) => c.AdminNewsEditorComponent),
        canActivate: [rolesGuard(['owner', 'socio', 'admin', 'editor'])],
      },
      {
        path: 'logs',
        loadComponent: () => import('../../features/logs/pages/logs-page.component').then((c) => c.LogsPageComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/admin-settings-page.component').then((c) => c.AdminSettingsPageComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'historia',
        loadComponent: () => import('./pages/history/admin-history-page.component').then((c) => c.AdminHistoryPageComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'historia/novo',
        loadComponent: () => import('./pages/history/admin-history-editor.component').then((c) => c.AdminHistoryEditorComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'historia/editar/:id',
        loadComponent: () => import('./pages/history/admin-history-editor.component').then((c) => c.AdminHistoryEditorComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'socio/planos',
        loadComponent: () => import('./pages/membership/admin-plans-page.component').then((c) => c.AdminPlansPageComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'socio/planos/novo',
        loadComponent: () => import('./pages/membership/admin-plan-editor.component').then((c) => c.AdminPlanEditorComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      {
        path: 'socio/planos/editar/:id',
        loadComponent: () => import('./pages/membership/admin-plan-editor.component').then((c) => c.AdminPlanEditorComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
    ],
  },
] satisfies Routes;
