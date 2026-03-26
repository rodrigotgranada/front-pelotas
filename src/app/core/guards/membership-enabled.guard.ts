import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppSettingsService } from '../services/app-settings.service';

export const membershipEnabledGuard: CanActivateFn = () => {
  const settings = inject(AppSettingsService);
  const router = inject(Router);

  if (!settings.isMembershipEnabled()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
