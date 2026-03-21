import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { News } from '../../../../../core/models/news.model';
import { NewsApiService } from '../../../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { AuthSessionService } from '../../../../../core/auth/auth-session.service';

@Component({
  selector: 'app-delete-news-modal',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" aria-hidden="true" (click)="close.emit()"></div>

        <!-- Trick browser into centering -->
        <span class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

        <!-- Modal Content (relative z-10 fixes the transparency issue) -->
        <div class="relative z-10 inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle border border-slate-200">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 class="text-lg font-semibold leading-6 text-slate-900" id="modal-title">Apagar Matéria</h3>
                <div class="mt-2 text-left">
                  <p class="text-sm text-slate-600 mb-2">
                    O que você deseja fazer com a matéria: <b>{{ news.title }}</b>?
                  </p>
                </div>

                <!-- Options list -->
                <div class="mt-4 space-y-4 text-left">
                  <!-- Opção 1: Inativação Simples (Soft Delete) -->
                  <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 relative">
                    <h4 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
                       Exclusão Lógica (Soft Delete)
                    </h4>
                    <p class="text-xs text-slate-600 mt-1">A matéria será arquivada e ninguém mais poderá ler. Ela sairá do portal, mas continuará escondida no banco de dados para segurança.</p>
                    <button 
                      (click)="confirmSoftDelete()"
                      class="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-100 relative overflow-hidden focus:z-10 disabled:opacity-50"
                      [disabled]="loading()"
                    >
                      <span [class.opacity-0]="loading()">Inverter Notícia (Soft Delete)</span>
                      @if (loading()) { <app-spinner [inline]="true" size="sm" class="absolute inset-0 flex items-center justify-center" /> }
                    </button>
                  </div>

                  <!-- Opção 2: Hard Delete (Apenas Owner) -->
                  @if (session.me()?.roleCode === 'owner') {
                    <div class="rounded-lg border border-rose-200 bg-rose-50 p-4 relative">
                      <h4 class="text-sm font-bold text-rose-700 flex items-center gap-2">
                        Exclusão Definitiva (Hard Delete)
                      </h4>
                      <p class="text-xs text-rose-700 mt-1 font-medium">Isso excluirá todo o conteúdo da matéria permanentemente da base de dados e do sistema.</p>
                      
                      <div class="mt-3 space-y-2">
                        <label class="block text-xs font-semibold text-rose-900">Para confirmar, digite <b>DELETAR</b> abaixo:</label>
                        <input 
                          type="text" 
                          [value]="deleteConfirmText()"
                          (input)="updateConfirmText($event)"
                          class="block w-full rounded-md border border-rose-300 bg-white py-2 px-3 text-slate-900 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm placeholder:text-slate-300"
                          placeholder="DELETAR"
                        />
                        <button 
                          (click)="confirmHardDelete()"
                          [disabled]="deleteConfirmText() !== 'DELETAR' || loading()"
                          class="mt-2 inline-flex w-full justify-center rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-rose-400 relative overflow-hidden"
                        >
                          <span [class.opacity-0]="loading()">Sim, apagar a matéria pra sempre</span>
                          @if (loading()) { <app-spinner [inline]="true" size="sm" class="absolute inset-0 flex items-center justify-center" /> }
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button type="button" (click)="close.emit()" [disabled]="loading()" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-100 sm:mt-0 sm:w-auto transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeleteNewsModalComponent {
  @Input({ required: true }) news!: News;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private readonly newsService = inject(NewsApiService);
  private readonly toastService = inject(ToastMessagesService);
  readonly session = inject(AuthSessionService);

  readonly loading = signal<boolean>(false);
  readonly deleteConfirmText = signal<string>('');

  updateConfirmText(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.deleteConfirmText.set(input.value);
  }

  async confirmSoftDelete() {
    this.loading.set(true);
    try {
      await firstValueFrom(this.newsService.deleteNews(this.news.id, false));
      this.toastService.showSuccess('Matéria enviada para lixeira logicamente.', 'Sucesso');
      this.deleted.emit();
    } catch (err) {
      this.toastService.showApiError(err, 'Falha ao remover matéria');
    } finally {
      this.loading.set(false);
    }
  }

  async confirmHardDelete() {
    if (this.deleteConfirmText() !== 'DELETAR') return;
    this.loading.set(true);
    try {
      await firstValueFrom(this.newsService.deleteNews(this.news.id, true));
      this.toastService.showSuccess('Matéria removida fisicamente e irreversivelmente.', 'Sucesso');
      this.deleted.emit();
    } catch (err) {
      this.toastService.showApiError(err, 'Falha ao remover fisicamente');
    } finally {
      this.loading.set(false);
    }
  }
}
