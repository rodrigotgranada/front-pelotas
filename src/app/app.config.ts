import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppSettingsService } from './core/services/app-settings.service';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

import { authInterceptor } from './core/http/auth.interceptor';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { routes } from './shared/master-bypass-v2';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-center',
      timeOut: 3500,
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (settings: AppSettingsService) => () => settings.loadPublicSettings(),
      deps: [AppSettingsService],
      multi: true
    }
  ]
};
