import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserResponse } from '../../../core/models/user.model';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { UsersApiService } from '../../../core/services/users-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-users-page',
  imports: [SpinnerComponent],
  templateUrl: './users-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent implements OnInit {
  private readonly usersApi = inject(UsersApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly users = signal<UserResponse[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    void this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);

    try {
      const response = await firstValueFrom(this.usersApi.list());
      this.users.set(response.data);
    } catch (error) {
      this.toast.showApiError(error, ToastTitle.UsersLoadFailure);
    } finally {
      this.loading.set(false);
    }
  }
}
