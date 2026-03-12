import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthTokenService } from './auth-token.service';

export const guestGuard: CanActivateFn = () => {
  const tokenService = inject(AuthTokenService);
  const router = inject(Router);

  if (!tokenService.getToken()) {
    return true;
  }

  return router.createUrlTree(['/app/me']);
};
