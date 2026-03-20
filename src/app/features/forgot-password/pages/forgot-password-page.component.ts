import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, SpinnerComponent, RouterLink],
  templateUrl: './forgot-password-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);

  readonly forgotForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly loading = signal(false);

  async onSubmit(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    this.loading.set(true);
    const email = this.forgotForm.getRawValue().email;

    try {
      await firstValueFrom(this.authApi.requestPasswordReset({ email }));
      
      this.toast.showSuccess('Se o email existir, um codigo foi enviado.', ToastTitle.Success);
      await this.router.navigate(['/reset-password'], { queryParams: { email } });
    } catch (error) {
      // Backend should not error on not found to prevent email enumeration, but just in case
      this.toast.showApiError(error, 'Falha ao solicitar');
    } finally {
      this.loading.set(false);
    }
  }
}
