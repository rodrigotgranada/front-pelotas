import { Component, EventEmitter, Input, Output, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MembershipInterest, MembershipInterestApiService } from '../../../../core/services/membership-interest-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-interest-resolve-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="fixed inset-0 z-50 overflow-hidden">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        (click)="close.emit()"
      ></div>

      <!-- Drawer Content -->
      <div class="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col">
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span 
              class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 block w-fit"
              [class.bg-emerald-100]="type === 'COMPLETED'"
              [class.text-emerald-700]="type === 'COMPLETED'"
              [class.bg-rose-100]="type === 'REJECTED'"
              [class.text-rose-700]="type === 'REJECTED'"
            >
              {{ type === 'COMPLETED' ? 'Concluir Adesão' : 'Registrar Desistência' }}
            </span>
            <h2 class="text-xl font-black text-slate-900">{{ item?.name }}</h2>
          </div>
          <button 
            (click)="close.emit()"
            class="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <!-- Context Info -->
            <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Plano de Interesse</p>
                <p class="text-sm font-black text-indigo-700">{{ item?.planId?.name }} - R$ {{ item?.planId?.price }}</p>
            </div>

            <!-- Notes Field -->
            <div class="space-y-2">
              <label class="text-xs font-black text-slate-500 uppercase tracking-widest">
                {{ type === 'COMPLETED' ? 'Observações da Adesão' : 'Motivo da Desistência' }}
              </label>
              <textarea 
                formControlName="notes"
                rows="5"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none font-medium"
                [placeholder]="type === 'COMPLETED' ? 'Ex: Retirou a camisa de brinde, enviou cartão pelo correio...' : 'Explique por que o torcedor desistiu...'"
              ></textarea>
              @if (type === 'REJECTED' && form.get('notes')?.invalid && form.get('notes')?.touched) {
                <p class="text-[10px] font-bold text-rose-500 uppercase tracking-tighter mt-1">
                  A justificativa é obrigatória para desistências.
                </p>
              }
            </div>

            <!-- Warning for rejection -->
            @if (type === 'REJECTED') {
              <div class="flex gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-rose-500 shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                <p class="text-xs text-rose-700 font-medium">Esta solicitação será marcada como resolvida e o torcedor não será mais notificado.</p>
              </div>
            } @else {
               <div class="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-emerald-500 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p class="text-xs text-emerald-700 font-medium">Confirmando a adesão, o ciclo deste lead será encerrado com sucesso.</p>
              </div>
            }
          </form>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <button 
            (click)="close.emit()"
            class="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-white transition-all text-xs uppercase tracking-widest cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            (click)="onSubmit()"
            [disabled]="loading() || (type === 'REJECTED' && form.invalid)"
            class="flex-[2] px-6 py-3 font-black rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            [class.bg-emerald-600]="type === 'COMPLETED'"
            [class.hover:bg-emerald-700]="type === 'COMPLETED' && !loading()"
            [class.bg-rose-600]="type === 'REJECTED'"
            [class.hover:bg-rose-700]="type === 'REJECTED' && !loading()"
            [class.text-white]="true"
            [class.opacity-50]="loading() || (type === 'REJECTED' && form.invalid)"
          >
            @if (loading()) {
               <app-spinner size="sm" />
               PROCESSANDO...
            } @else {
               {{ type === 'COMPLETED' ? 'CONFIRMAR ADESÃO' : 'REJEITAR SOLICITAÇÃO' }}
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AdminInterestResolveDrawerComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly interestApi = inject(MembershipInterestApiService);
  private readonly toast = inject(ToastMessagesService);

  @Input() item: MembershipInterest | null = null;
  @Input() type: 'COMPLETED' | 'REJECTED' = 'COMPLETED';
  @Output() close = new EventEmitter<void>();
  @Output() resolved = new EventEmitter<MembershipInterest>();

  readonly loading = signal(false);
  readonly form = this.fb.group({
    notes: ['', [Validators.required]]
  });

  ngOnInit() {
    // If completed, notes are optional but recommended
    if (this.type === 'COMPLETED') {
      this.form.get('notes')?.clearValidators();
    }
  }

  onSubmit() {
    if (this.type === 'REJECTED' && this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.item) return;

    this.loading.set(true);
    const notes = this.form.get('notes')?.value || undefined;

    this.interestApi.updateStatus(this.item.id, this.type, notes)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updated) => {
          this.toast.showSuccess(`Solicitação ${this.type === 'COMPLETED' ? 'confirmada' : 'rejeitada'} com sucesso!`);
          this.resolved.emit(updated);
        },
        error: () => this.toast.showError('Erro ao atualizar solicitação.')
      });
  }
}
