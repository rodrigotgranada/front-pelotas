import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';
import { AuthTokenService } from '../auth/auth-token.service';
import { ToastMessagesService, ToastTitle } from '../notifications/toast-messages.service';

/**
 * Roles Guard
 * Restarts route navigation mapping allowed roles for the route.
 * @param allowedRoles e.g. ['owner', 'admin']
 */
export const rolesGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const session = inject(AuthSessionService);
    const tokenService = inject(AuthTokenService);
    const router = inject(Router);
    const toast = inject(ToastMessagesService);
    
    const me = session.me();
    // Use fallback from TokenService if session is not yet hydrated (e.g. F5 page refresh)
    const userRole = me?.roleCode || me?.roleId || tokenService.getRoleCode() || 'user';

    // Se não há token sequer, ele já está deslogado
    if (!tokenService.getToken()) {
      toast.showWarning('Você precisa estar logado para acessar esta área.', ToastTitle.Warning);
      return router.parseUrl('/login');
    }

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    toast.showError('Você não tem o nível de permissão exigido para acessar essa página.', 'Acesso Negado');
    return router.parseUrl('/app/me');
  };
};
