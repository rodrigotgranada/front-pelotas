import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivityLog } from '../../../core/models/log.model';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { LogsApiService } from '../../../core/services/logs-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-logs-page',
  imports: [SpinnerComponent],
  templateUrl: './logs-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsPageComponent implements OnInit {
  private readonly logsApi = inject(LogsApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly logs = signal<ActivityLog[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    void this.loadLogs();
  }

  async loadLogs(): Promise<void> {
    this.loading.set(true);

    try {
      const logs = await firstValueFrom(this.logsApi.list({ limit: 20 }));
      this.logs.set(logs);
    } catch (error) {
      this.toast.showApiError(error, ToastTitle.LogsLoadFailure);
    } finally {
      this.loading.set(false);
    }
  }
}
