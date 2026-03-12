import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthSessionService } from './auth-session.service';
import { AppRole, getRoleDebugInfo, resolveRoleWithStoredCode } from './roles.util';
import { ToastMessagesService } from '../notifications/toast-messages.service';
import { AuthTokenService } from './auth-token.service';
import { environment } from '../../../environments/environment';

export const roleGuard: CanActivateFn = async (route) => {
  const session = inject(AuthSessionService);
  const router = inject(Router);
  const toast = inject(ToastMessagesService);
  const tokenService = inject(AuthTokenService);

  const allowedRoles = (route.data?.['allowedRoles'] as AppRole[] | undefined) ?? [];
  if (allowedRoles.length === 0) {
    return true;
  }

  let profile = session.me();

  if (!profile) {
    const result = await session.hydrateSession();

    if (result === 'invalid-session' || result === 'no-token') {
      toast.showSessionExpired();
      return router.createUrlTree(['/']);
    }

    profile = session.me();
  }

  const storedRoleCode = tokenService.getRoleCode();
  const resolvedRole = resolveRoleWithStoredCode(profile, tokenService.getToken(), storedRoleCode);

  let rbacDebugEnabled = !environment.production;
  try {
    rbacDebugEnabled = rbacDebugEnabled || localStorage.getItem('pelotas.rbac-debug') === '1';
  } catch {
    // Ignore storage access issues (SSR/privacy mode).
  }

  if (rbacDebugEnabled) {
    console.info('[RBAC][roleGuard]', {
      allowedRoles,
      ...getRoleDebugInfo(profile, tokenService.getToken(), storedRoleCode),
    });
  }

  // Unknown role should not grant admin access in the front-end.
  if (!resolvedRole) {
    toast.showAccessDenied();
    return router.createUrlTree(['/app/me']);
  }

  if (allowedRoles.includes(resolvedRole)) {
    return true;
  }

  toast.showAccessDenied();
  return router.createUrlTree(['/app/me']);
};
