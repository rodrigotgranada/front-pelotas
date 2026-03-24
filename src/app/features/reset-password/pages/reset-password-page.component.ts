import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { PasswordInputComponent } from '../../../shared/ui/password-input/password-input.component';
import { CodeInputComponent } from '../../../shared/ui/code-input/code-input.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, SpinnerComponent, PasswordInputComponent, CodeInputComponent, RouterLink],
  templateUrl: './reset-password-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly appSettings = inject(AppSettingsService);

  readonly resetForm = this.formBuilder.nonNullable.group(
    {
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: (form: AbstractControl) => {
        const password = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        
        if (password !== confirmPassword) {
          form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
          return { passwordMismatch: true };
        }
        
        if (form.get('confirmPassword')?.hasError('passwordMismatch')) {
          const errors = { ...form.get('confirmPassword')?.errors };
          delete errors['passwordMismatch'];
          form.get('confirmPassword')?.setErrors(Object.keys(errors).length ? errors : null);
        }
        
        return null;
      }
    },
  );

  readonly loading = signal(false);

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.resetForm.patchValue({ email });
    } else {
      this.toast.showWarning('Email nao especificado para redefinicao.', ToastTitle.Warning);
      this.router.navigateByUrl('/forgot-password');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    this.loading.set(true);
    const formValue = this.resetForm.getRawValue();

    try {
      await firstValueFrom(
        this.authApi.confirmPasswordReset({
          email: formValue.email, // using raw value to get disabled fields
          code: formValue.code.trim(),
          newPassword: formValue.newPassword,
        }),
      );

      this.toast.showSuccess('Senha redefinida com sucesso! Faça login com a nova senha.', ToastTitle.Success);
      await this.router.navigateByUrl('/login');
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao redefinir senha');
    } finally {
      this.loading.set(false);
    }
  }
}
