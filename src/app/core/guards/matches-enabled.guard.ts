import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppSettingsService } from '../services/app-settings.service';

export const matchesEnabledGuard: CanActivateFn = () => {
  const settings = inject(AppSettingsService);
  const router = inject(Router);

  if (!settings.isMatchesEnabled()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
