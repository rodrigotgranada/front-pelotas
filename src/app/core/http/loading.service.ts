import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);

  readonly isLoading = computed(() => this.activeRequests() > 0);

  requestStarted(): void {
    this.activeRequests.update((value) => value + 1);
  }

  requestFinished(): void {
    this.activeRequests.update((value) => (value > 0 ? value - 1 : 0));
  }
}
