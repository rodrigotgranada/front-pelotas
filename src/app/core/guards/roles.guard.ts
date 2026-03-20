import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../auth/auth-session.service';
import { ToastMessagesService, ToastTitle } from '../notifications/toast-messages.service';

/**
 * Roles Guard
 * Restarts route navigation mapping allowed roles for the route.
 * @param allowedRoles e.g. ['owner', 'admin']
 */
export const rolesGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const session = inject(AuthSessionService);
    const router = inject(Router);
    const toast = inject(ToastMessagesService);
    
    // Check if the user is authenticated at all
    const me = session.me();
    if (!me) {
      toast.showWarning('Você precisa estar logado para acessar esta área.', ToastTitle.Warning);
      return router.parseUrl('/login');
    }

    // Role code é o código legível (owner, admin, editor...), roleId é o ObjectId do MongoDB
    const userRole = me.roleCode || me.roleId || 'user';

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    toast.showError('Você não tem o nivel de permissao exigido para acessar essa pagina.', 'Acesso Negado');
    // Send user to a safe page since they lack roles.
    return router.parseUrl('/app/me');
  };
};
