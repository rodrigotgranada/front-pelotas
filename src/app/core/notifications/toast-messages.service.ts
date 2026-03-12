import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

export const ToastTitle = {
  Success: 'Sucesso',
  Info: 'Informacao',
  Warning: 'Atencao',
  Error: 'Erro',
  Welcome: 'Bem-vindo',
  Logout: 'Logout',
  InvalidForm: 'Formulario invalido',
  RestrictedAccess: 'Acesso restrito',
  SessionExpired: 'Sessao expirada',
  AccessDenied: 'Acesso negado',
  LoginFailure: 'Falha no login',
  UsersLoadFailure: 'Falha ao carregar usuarios',
  LogsLoadFailure: 'Falha ao carregar logs',
  ProfileLoadFailure: 'Falha ao carregar perfil',
  ProfileUpdateSuccess: 'Perfil atualizado',
  ProfileUpdateFailure: 'Falha ao atualizar perfil',
} as const;

export type ToastTitleValue = (typeof ToastTitle)[keyof typeof ToastTitle];

@Injectable({ providedIn: 'root' })
export class ToastMessagesService {
  private readonly toastr = inject(ToastrService);

  showSuccess(message: string, title: string = ToastTitle.Success): void {
    this.toastr.success(message, title);
  }

  showInfo(message: string, title: string = ToastTitle.Info): void {
    this.toastr.info(message, title);
  }

  showWarning(message: string, title: string = ToastTitle.Warning): void {
    this.toastr.warning(message, title);
  }

  showError(message: string, title: string = ToastTitle.Error): void {
    this.toastr.error(message, title);
  }

  showLoginSuccess(): void {
    this.showSuccess('Login realizado com sucesso.', ToastTitle.Welcome);
  }

  showLogoutInfo(): void {
    this.showInfo('Sessao encerrada com sucesso.', ToastTitle.Logout);
  }

  showInvalidFormWarning(): void {
    this.showWarning('Revise os campos obrigatorios antes de continuar.', ToastTitle.InvalidForm);
  }

  showAuthRequired(): void {
    this.showWarning('Voce precisa estar logado para acessar essa area.', ToastTitle.RestrictedAccess);
  }

  showSessionExpired(): void {
    this.showWarning('Sua sessao nao esta valida. Faca login novamente.', ToastTitle.SessionExpired);
  }

  showAccessDenied(): void {
    this.showWarning('Voce nao tem permissao para acessar essa area.', ToastTitle.AccessDenied);
  }

  showApiError(error: unknown, title: string = ToastTitle.Error): void {
    this.showError(this.getApiErrorMessage(error), title);
  }

  private getApiErrorMessage(error: unknown): string {
    if (typeof error === 'string' && error.trim().length > 0) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      const responseMessage = (error.error as { message?: unknown })?.message;

      if (typeof responseMessage === 'string') {
        return responseMessage;
      }

      if (Array.isArray(responseMessage)) {
        return responseMessage.join(', ');
      }

      if (error.status === 0) {
        return 'Nao foi possivel conectar ao backend.';
      }

      return `Erro HTTP ${error.status}.`;
    }

    return 'Erro inesperado ao chamar a API.';
  }
}
