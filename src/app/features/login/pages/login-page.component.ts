import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { PasswordInputComponent } from '../../../shared/ui/password-input/password-input.component';
import { CodeInputComponent } from '../../../shared/ui/code-input/code-input.component';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, SpinnerComponent, PasswordInputComponent, CodeInputComponent],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly verifyEmailForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  readonly loading = signal(false);
  readonly pendingEmailVerification = signal(false);
  readonly verificationEmail = signal<string | null>(null);

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    this.loading.set(true);

    try {
      const response = await firstValueFrom(this.authApi.login(this.loginForm.getRawValue()));

      if (response.requiresEmailVerification) {
        this.pendingEmailVerification.set(true);
        this.verificationEmail.set(this.loginForm.getRawValue().email);
        this.toast.showInfo('Digite o codigo enviado para seu email para concluir o acesso.', ToastTitle.Info);
        return;
      }

      await this.session.hydrateSession();
      this.toast.showLoginSuccess();
      await this.router.navigateByUrl('/app/me');
    } catch (error) {
      this.toast.showApiError(error, ToastTitle.LoginFailure);
    } finally {
      this.loading.set(false);
    }
  }

  async onVerifyEmail(): Promise<void> {
    if (this.verifyEmailForm.invalid || !this.verificationEmail()) {
      this.verifyEmailForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    this.loading.set(true);

    try {
      await firstValueFrom(
        this.authApi.verifyEmail({
          email: this.verificationEmail()!,
          code: this.verifyEmailForm.getRawValue().code.trim(),
        }),
      );

      await this.session.hydrateSession();
      this.pendingEmailVerification.set(false);
      this.verifyEmailForm.reset();
      this.toast.showSuccess('Email verificado com sucesso.', ToastTitle.Success);
      await this.router.navigateByUrl('/app/me');
    } catch (error) {
      this.toast.showApiError(error, 'Falha na verificacao');
    } finally {
      this.loading.set(false);
    }
  }

  async resendCode(): Promise<void> {
    if (!this.verificationEmail()) {
      this.toast.showWarning('Informe um email valido para reenviar o codigo.', ToastTitle.Warning);
      return;
    }

    this.loading.set(true);

    try {
      await firstValueFrom(this.authApi.resendVerificationCode({ email: this.verificationEmail()! }));
      this.toast.showInfo('Codigo reenviado. Verifique sua caixa de entrada.', ToastTitle.Info);
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao reenviar codigo');
    } finally {
      this.loading.set(false);
    }
  }
}
