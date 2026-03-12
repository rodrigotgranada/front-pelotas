import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthTokenService } from './auth-token.service';
import { ToastMessagesService } from '../notifications/toast-messages.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(AuthTokenService);
  const router = inject(Router);
  const toast = inject(ToastMessagesService);

  if (tokenService.getToken()) {
    return true;
  }

  toast.showAuthRequired();
  return router.createUrlTree(['/']);
};
