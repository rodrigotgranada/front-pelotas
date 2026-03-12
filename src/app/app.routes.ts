import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';
import { roleGuard } from './core/auth/role.guard';

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
				data: {
					allowedRoles: ['owner', 'admin'],
				},
				loadComponent: () => import('./features/users/pages/users-page.component').then((m) => m.UsersPageComponent),
			},
			{
				path: 'logs',
				canActivate: [roleGuard],
				data: {
					allowedRoles: ['owner', 'admin'],
				},
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
		path: '**',
		redirectTo: '',
	},
];
