import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastMessagesService, ToastTitle } from '../../../../core/notifications/toast-messages.service';
import { UsersApiService } from '../../../../core/services/users-api.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { RolesApiService } from '../../../../core/services/roles-api.service';
import { EmailInputComponent } from '../../../../shared/ui/email-input/email-input.component';
import { CpfInputComponent } from '../../../../shared/ui/cpf-input/cpf-input.component';
import { PhoneInputComponent } from '../../../../shared/ui/phone-input/phone-input.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-admin-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent, EmailInputComponent, CpfInputComponent, PhoneInputComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-0">
      <div class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl relative flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Novo Membro</h3>
            <p class="text-xs text-slate-500 mt-0.5">O usuário será criado como ativo imediatamente.</p>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          >
            <span class="sr-only">Fechar modal</span>
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" id="adminUserForm" class="space-y-5">

            <!-- Nome / Sobrenome -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label for="firstName" class="text-sm font-semibold text-slate-700">Nome <span class="text-rose-500">*</span></label>
                <input
                  id="firstName"
                  type="text"
                  formControlName="firstName"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500"
                  [class.border-rose-300]="hasError('firstName')"
                  placeholder="Ex: João"
                />
                @if (hasError('firstName')) {
                  <p class="text-xs text-rose-500">Nome obrigatório (mín. 2 caracteres).</p>
                }
              </div>
              <div class="space-y-1.5">
                <label for="lastName" class="text-sm font-semibold text-slate-700">Sobrenome <span class="text-rose-500">*</span></label>
                <input
                  id="lastName"
                  type="text"
                  formControlName="lastName"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500"
                  [class.border-rose-300]="hasError('lastName')"
                  placeholder="Ex: Silva"
                />
                @if (hasError('lastName')) {
                  <p class="text-xs text-rose-500">Sobrenome obrigatório (mín. 2 caracteres).</p>
                }
              </div>
            </div>

            <!-- Email -->
            <div class="space-y-1.5">
              <label for="email" class="text-sm font-semibold text-slate-700">E-mail de acesso <span class="text-rose-500">*</span></label>
              <app-email-input
                id="email"
                formControlName="email"
                placeholder="usuario@empresa.com"
              />
            </div>

            <!-- CPF -->
            <div class="space-y-1.5">
              <label for="document" class="text-sm font-semibold text-slate-700">CPF</label>
              <app-cpf-input
                id="document"
                formControlName="document"
                placeholder="000.000.000-00"
              />
            </div>

            <!-- Telefone -->
            <div class="space-y-1.5">
              <label for="phone" class="text-sm font-semibold text-slate-700">Telefone / WhatsApp</label>
              <app-phone-input
                id="phone"
                formControlName="phone"
                placeholder="(00) 00000-0000"
              />
            </div>

            <!-- Cargo -->
            <div class="space-y-1.5">
              <label for="roleId" class="text-sm font-semibold text-slate-700">Nível de Acesso <span class="text-rose-500">*</span></label>
              <select
                id="roleId"
                formControlName="roleId"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                [class.border-rose-300]="hasError('roleId')"
              >
                <option value="" disabled>Selecione um cargo</option>
                @for (role of activeRoles(); track role.id) {
                  <option [value]="role.id">{{ role.name }}</option>
                }
              </select>
              @if (hasError('roleId')) {
                <p class="text-xs text-rose-500">Selecione um cargo para o usuário.</p>
              }
            </div>

            <!-- Info Banner -->
            <div class="rounded-xl bg-amber-50 p-4 border border-amber-100 flex gap-3">
              <div class="shrink-0 text-amber-500 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-amber-900">Atenção sobre a senha</h4>
                <p class="text-xs text-amber-800 mt-1 leading-relaxed">
                  Uma <strong>senha temporária</strong> será gerada e exibida no console do servidor.
                  Use a opção <strong>"Forçar Redefinição de Senha"</strong> no Drawer do usuário para enviar o link de troca por e-mail assim que o cadastro for concluído.
                </p>
              </div>
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            [disabled]="loading()"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="adminUserForm"
            class="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-500 outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            [disabled]="loading() || form.invalid"
          >
            @if (loading()) {
              <div class="mr-2 h-4 w-4 shrink-0 text-white flex items-center justify-center">
                <app-spinner [size]="'sm'"></app-spinner>
              </div>
              <span>Salvando...</span>
            } @else {
              Criar Membro
            }
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersApiService);
  private readonly rolesService = inject(RolesApiService);
  private readonly toast = inject(ToastMessagesService);

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  readonly loading = signal(false);

  readonly activeRoles = toSignal(
    this.rolesService.listActive().pipe(map((roles) => roles.filter((r) => r.code !== 'owner'))),
    { initialValue: [] }
  );

  readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    document: [''],
    documentType: ['cpf'],
    phone: [''],
    roleId: ['', [Validators.required]],
    isActive: [true],
  });

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const raw = this.form.getRawValue();

    // Build contacts array only if phone is provided
    const contacts: Array<{ type: string; value: string; isPrimary: boolean }> = [];
    if (raw.phone) {
      contacts.push({ type: 'mobile', value: raw.phone, isPrimary: true });
    }

    const payload: any = {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      document: raw.document || undefined,
      documentType: raw.documentType || 'cpf',
      roleId: raw.roleId,
      isActive: true,          // owner always creates active users
      ...(contacts.length > 0 ? { contacts } : {}),
    };

    this.usersService.createAdmin(payload).subscribe({
      next: () => {
        this.toast.showSuccess('Membro criado com sucesso! Conta já está ativa.', 'Sucesso');
        this.loading.set(false);
        this.saved.emit();
      },
      error: (err) => {
        this.toast.showApiError(err, ToastTitle.UserRegistrationFailure);
        this.loading.set(false);
      },
    });
  }
}
