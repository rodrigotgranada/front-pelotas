import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserResponse, UserContactResponse } from '../../../../core/models/user.model';
import { RoleCode } from '../../../../core/models/role.model';
import { UsersApiService } from '../../../../core/services/users-api.service';
import { AuthApiService } from '../../../../core/services/auth-api.service';
import { ToastMessagesService, ToastTitle } from '../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from '../../../../core/auth/auth-session.service';
import { DeleteUserModalComponent } from './delete-user-modal.component';

@Component({
  selector: 'app-admin-user-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, DeleteUserModalComponent],
  templateUrl: './admin-user-drawer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDrawerComponent implements OnChanges {
  private readonly usersApi = inject(UsersApiService);
  private readonly authApi = inject(AuthApiService);
  private readonly toast = inject(ToastMessagesService);
  readonly session = inject(AuthSessionService);

  @Input({ required: true }) user!: UserResponse;
  @Output() close = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<void>();

  readonly activeTab = signal<'profile' | 'access'>('profile');
  readonly loading = signal<boolean>(false);
  
  selectedRoleCode: RoleCode = 'user';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.selectedRoleCode = this.user.roleCode || 'user';
    }
  }

  get primaryPhone(): string | undefined {
    const contact = this.user.contacts?.find((c: UserContactResponse) => c.isPrimary && (c.type === 'phone' || c.type === 'celular' || c.type === 'whatsapp'));
    if (contact) return contact.value;
    const anyPhone = this.user.contacts?.find((c: UserContactResponse) => c.type === 'phone' || c.type === 'celular' || c.type === 'whatsapp');
    return anyPhone?.value;
  }

  onClose() {
    this.close.emit();
  }

  async updateRole() {
    if (this.selectedRoleCode === this.user.roleCode) return;

    this.loading.set(true);
    try {
      await firstValueFrom(this.usersApi.update(this.user.id, {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        roleCode: this.selectedRoleCode
      }));
      this.toast.showSuccess('Cargo de acesso atualizado com sucesso.', ToastTitle.Success);
      this.userUpdated.emit();
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao atualizar cargo');
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus() {
    const isActivating = !this.user.isActive;
    const confirmMessage = isActivating
      ? `Tem certeza que deseja reativar o usuario ${this.user.firstName}?`
      : `Tem certeza que deseja inativar o usuario ${this.user.firstName}? Ele perdera acesso ao sistema.`;

    if (!confirm(confirmMessage)) return;

    this.loading.set(true);
    try {
      if (isActivating) {
        await firstValueFrom(this.usersApi.reactivate(this.user.id));
      } else {
        await firstValueFrom(this.usersApi.delete(this.user.id));
      }
      this.toast.showSuccess(`Usuario ${isActivating ? 'reativado' : 'inativado'} com sucesso.`, ToastTitle.Success);
      this.userUpdated.emit();
    } catch (error) {
      this.toast.showApiError(error, `Falha ao ${isActivating ? 'reativar' : 'inativar'} usuario`);
    } finally {
      this.loading.set(false);
    }
  }

  async suspendUser() {
    if (!this.user.isActive) return;
    
    const reason = prompt(`Por qual motivo voce esta suspendendo o usuario ${this.user.firstName}? O usuario vera esta mensagem.`);
    if (reason === null) return; // cancelled
    if (reason.trim() === '') {
      this.toast.showError('O motivo da suspensao e obrigatorio.', ToastTitle.Error);
      return;
    }

    this.loading.set(true);
    try {
      await firstValueFrom(this.usersApi.suspend(this.user.id, reason));
      this.toast.showSuccess('Usuario suspenso com sucesso.', ToastTitle.Success);
      this.userUpdated.emit();
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao suspender usuario');
    } finally {
      this.loading.set(false);
    }
  }


  async forcePasswordReset() {
    if (!confirm(`Deseja enviar um e-mail de redefinicao de senha para ${this.user.email}?`)) return;

    this.loading.set(true);
    try {
      await firstValueFrom(this.authApi.requestPasswordReset({ email: this.user.email }));
      this.toast.showSuccess('E-mail de redefinicao de senha enviado com sucesso.', ToastTitle.Success);
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao enviar e-mail de redefinicao');
    } finally {
      this.loading.set(false);
    }
  }

  async forceLogout() {
    if (!confirm(`Deseja forcar o encerramento de todas as sessoes ativas do usuario ${this.user.firstName}? Ele sera deslogado de imediato de todos os aparelhos.`)) return;

    this.loading.set(true);
    try {
      await firstValueFrom(this.usersApi.forceLogout(this.user.id));
      this.toast.showSuccess('Sessoes encerradas com sucesso.', ToastTitle.Success);
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao encerrar sessoes');
    } finally {
      this.loading.set(false);
    }
  }

  readonly showDeleteModal = signal(false);

  onUserDeleted(): void {
    this.showDeleteModal.set(false);
    this.userUpdated.emit();
    this.close.emit();
  }
}
