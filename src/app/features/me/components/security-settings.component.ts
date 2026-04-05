import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  ConfirmEmailChangePayload,
  ConfirmPhoneVerificationPayload,
  RequestEmailChangePayload,
  RequestPhoneVerificationPayload,
} from '../../../core/models/auth.model';
import { ToastMessagesService, ToastTitle } from '../../../core/notifications/toast-messages.service';
import { UsersApiService } from '../../../core/services/users-api.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritySettingsComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersApi = inject(UsersApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly profileChanged = output<void>();

  readonly requestingEmailChange = signal(false);
  readonly confirmingEmailChange = signal(false);
  readonly requestingPhoneVerification = signal(false);
  readonly confirmingPhoneVerification = signal(false);
  readonly emailChangeRequested = signal(false);
  readonly phoneVerificationRequested = signal(false);

  readonly emailRequestError = signal<string | null>(null);
  readonly emailConfirmError = signal<string | null>(null);
  readonly phoneRequestError = signal<string | null>(null);
  readonly phoneConfirmError = signal<string | null>(null);

  readonly emailRequestCooldown = signal(0);
  readonly phoneRequestCooldown = signal(0);

  readonly emailChangeRequestForm = this.formBuilder.nonNullable.group({
    newEmail: ['', [Validators.required, Validators.email]],
  });

  readonly emailChangeConfirmForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  readonly phoneVerificationRequestForm = this.formBuilder.nonNullable.group({
    phone: ['', [Validators.required]],
    channel: ['whatsapp' as 'whatsapp', [Validators.required]],
  });

  readonly phoneVerificationConfirmForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  private emailCooldownTimer: ReturnType<typeof setInterval> | null = null;
  private phoneCooldownTimer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.stopEmailCooldown();
    this.stopPhoneCooldown();
  }

  onPhoneVerificationInput(): void {
    const control = this.phoneVerificationRequestForm.get('phone');
    const rawValue = String(control?.value ?? '');
    control?.setValue(this.maskPhone(rawValue), { emitEvent: false });
  }

  async requestEmailChange(): Promise<void> {
    this.emailRequestError.set(null);

    if (this.emailRequestCooldown() > 0) {
      return;
    }

    if (this.emailChangeRequestForm.invalid) {
      this.emailChangeRequestForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    const payload: RequestEmailChangePayload = {
      newEmail: this.emailChangeRequestForm.getRawValue().newEmail.trim(),
    };

    this.requestingEmailChange.set(true);

    try {
      await firstValueFrom(this.usersApi.requestEmailChange(payload));
      this.emailChangeRequested.set(true);
      this.toast.showInfo('Codigo de confirmacao enviado para o novo email.', ToastTitle.Info);
      this.startEmailCooldown(60);
    } catch (error) {
      this.emailRequestError.set(this.getStatusMessage(error, 'request-email'));
      this.toast.showApiError(error, 'Falha na troca de email');
    } finally {
      this.requestingEmailChange.set(false);
    }
  }

  async confirmEmailChange(): Promise<void> {
    this.emailConfirmError.set(null);

    if (this.emailChangeConfirmForm.invalid) {
      this.emailChangeConfirmForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    const payload: ConfirmEmailChangePayload = {
      code: this.emailChangeConfirmForm.getRawValue().code.trim(),
    };

    this.confirmingEmailChange.set(true);

    try {
      await firstValueFrom(this.usersApi.confirmEmailChange(payload));
      this.emailChangeRequested.set(false);
      this.emailChangeConfirmForm.reset();
      this.emailChangeRequestForm.reset();
      this.toast.showSuccess('Email atualizado com sucesso.', ToastTitle.Success);
      this.profileChanged.emit();
    } catch (error) {
      this.emailConfirmError.set(this.getStatusMessage(error, 'confirm-email'));
      this.toast.showApiError(error, 'Falha ao confirmar email');
    } finally {
      this.confirmingEmailChange.set(false);
    }
  }

  async requestPhoneVerification(): Promise<void> {
    this.phoneRequestError.set(null);

    if (this.phoneRequestCooldown() > 0) {
      return;
    }

    if (this.phoneVerificationRequestForm.invalid) {
      this.phoneVerificationRequestForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    const raw = this.phoneVerificationRequestForm.getRawValue();
    const digits = raw.phone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      this.phoneRequestError.set('Telefone deve ter 10 ou 11 digitos.');
      this.toast.showWarning('Telefone deve ter 10 ou 11 digitos.', ToastTitle.Warning);
      return;
    }

    const payload: RequestPhoneVerificationPayload = {
      phone: raw.phone,
      channel: 'whatsapp',
    };

    this.requestingPhoneVerification.set(true);

    try {
      await firstValueFrom(this.usersApi.requestPhoneVerification(payload));
      this.phoneVerificationRequested.set(true);
      this.toast.showInfo('Codigo de verificacao enviado para o telefone informado.', ToastTitle.Info);
      this.startPhoneCooldown(60);
    } catch (error) {
      this.phoneRequestError.set(this.getStatusMessage(error, 'request-phone'));
      this.toast.showApiError(error, 'Falha na verificacao de telefone');
    } finally {
      this.requestingPhoneVerification.set(false);
    }
  }

  async confirmPhoneVerification(): Promise<void> {
    this.phoneConfirmError.set(null);

    if (this.phoneVerificationConfirmForm.invalid) {
      this.phoneVerificationConfirmForm.markAllAsTouched();
      this.toast.showInvalidFormWarning();
      return;
    }

    const payload: ConfirmPhoneVerificationPayload = {
      code: this.phoneVerificationConfirmForm.getRawValue().code.trim(),
    };

    this.confirmingPhoneVerification.set(true);

    try {
      await firstValueFrom(this.usersApi.confirmPhoneVerification(payload));
      this.phoneVerificationRequested.set(false);
      this.phoneVerificationConfirmForm.reset();
      this.toast.showSuccess('Telefone verificado com sucesso.', ToastTitle.Success);
      this.profileChanged.emit();
    } catch (error) {
      this.phoneConfirmError.set(this.getStatusMessage(error, 'confirm-phone'));
      this.toast.showApiError(error, 'Falha ao confirmar telefone');
    } finally {
      this.confirmingPhoneVerification.set(false);
    }
  }

  private startEmailCooldown(seconds: number): void {
    this.stopEmailCooldown();
    this.emailRequestCooldown.set(seconds);
    this.emailCooldownTimer = setInterval(() => {
      const next = this.emailRequestCooldown() - 1;
      this.emailRequestCooldown.set(Math.max(0, next));
      if (next <= 0) {
        this.stopEmailCooldown();
      }
    }, 1000);
  }

  private stopEmailCooldown(): void {
    if (this.emailCooldownTimer) {
      clearInterval(this.emailCooldownTimer);
      this.emailCooldownTimer = null;
    }
  }

  private startPhoneCooldown(seconds: number): void {
    this.stopPhoneCooldown();
    this.phoneRequestCooldown.set(seconds);
    this.phoneCooldownTimer = setInterval(() => {
      const next = this.phoneRequestCooldown() - 1;
      this.phoneRequestCooldown.set(Math.max(0, next));
      if (next <= 0) {
        this.stopPhoneCooldown();
      }
    }, 1000);
  }

  private stopPhoneCooldown(): void {
    if (this.phoneCooldownTimer) {
      clearInterval(this.phoneCooldownTimer);
      this.phoneCooldownTimer = null;
    }
  }

  private maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  private getStatusMessage(error: unknown, operation: 'request-email' | 'confirm-email' | 'request-phone' | 'confirm-phone'): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        if (operation === 'confirm-email' || operation === 'confirm-phone') {
          return 'Codigo invalido ou expirado. Tente novamente.';
        }
        return 'Dados invalidos. Revise os campos e tente novamente.';
      }

      if (error.status === 401) {
        return 'Sua sessao expirou. Faca login novamente.';
      }

      if (error.status === 403) {
        return 'Voce nao tem permissao para realizar esta acao.';
      }

      if (error.status === 409) {
        return 'Conflito de dados. O recurso informado ja esta em uso.';
      }
    }

    return 'Nao foi possivel concluir a operacao no momento.';
  }
}
