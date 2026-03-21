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
        // Todos que chegam no AdminLayout tem acesso ao dashboard
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
        path: 'news/editor/:id',
        loadComponent: () => import('./pages/news/admin-news-editor.component').then((c) => c.AdminNewsEditorComponent),
        canActivate: [rolesGuard(['owner', 'socio', 'admin', 'editor'])],
      },
      {
        path: 'logs',
        loadComponent: () => import('../../features/logs/pages/logs-page.component').then((c) => c.LogsPageComponent),
        canActivate: [rolesGuard(['owner', 'admin'])],
      },
      // {
      //   path: 'finance',
      //   loadComponent: () => import('./pages/finance/admin-finance-page.component').then((c) => c.AdminFinancePageComponent),
      //   canActivate: [rolesGuard(['owner', 'socio'])],
      // },
    ],
  },
] satisfies Routes;
