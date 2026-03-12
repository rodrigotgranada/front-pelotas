import { HttpContext } from '@angular/common/http';
import { SKIP_GLOBAL_LOADING } from './loading.interceptor';

interface HasHttpContext {
  context?: HttpContext;
}

export function skipGlobalLoadingContext(): { context: HttpContext } {
  return {
    context: new HttpContext().set(SKIP_GLOBAL_LOADING, true),
  };
}

export function withSkipGlobalLoading<T extends object & HasHttpContext>(options: T): T {
  const context = (options.context ?? new HttpContext()).set(SKIP_GLOBAL_LOADING, true);

  return {
    ...options,
    context,
  } as T;
}
