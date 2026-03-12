import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service';

export const SKIP_GLOBAL_LOADING = new HttpContextToken<boolean>(() => false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADING)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.requestStarted();

  return next(req).pipe(finalize(() => loadingService.requestFinished()));
};
