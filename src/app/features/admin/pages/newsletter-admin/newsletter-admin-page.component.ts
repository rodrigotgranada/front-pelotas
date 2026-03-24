import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-admin-newsletter-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="space-y-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Inscritos Newsletter</h1>
          <p class="mt-2 text-slate-600">Gerencie a lista de e-mails capturados para campanhas de marketing e notícias.</p>
        </div>
        
        <button
          type="button"
          (click)="copyAllEmails()"
          class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
          Copiar Todos os E-mails
        </button>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
        <!-- Toolbar -->
        <div class="border-b border-slate-200 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="relative flex-1 max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              [formControl]="searchControl"
              placeholder="Filtrar por e-mail..." 
              class="w-full rounded-xl border-slate-200 pl-10 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
            />
          </div>
          
          <div class="text-sm text-slate-500 font-bold uppercase tracking-widest text-[10px]">
            <span class="text-indigo-600 font-black">{{ subscribersData()?.total || 0 }}</span> inscritos ativos
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto relative min-h-[400px]">
          @if (loading()) {
            <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <app-spinner size="lg" label="Carregando inscritos..."></app-spinner>
            </div>
          }

          <table class="min-w-full divide-y divide-slate-200 text-sm text-left">
            <thead class="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th scope="col" class="px-6 py-4">E-mail</th>
                <th scope="col" class="px-6 py-4">Inscrição</th>
                <th scope="col" class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              @for (sub of subscribersData()?.data; track sub._id) {
                <tr class="transition hover:bg-slate-50/50 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <span class="font-bold text-slate-900">{{ sub.email }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-500 font-medium">
                    {{ sub.createdAt | date:'dd MMM, yyyy • HH:mm' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button 
                      (click)="deleteSubscriber(sub)"
                      class="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                      title="Remover inscrito"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="3" class="px-6 py-24 text-center">
                    <div class="flex flex-col items-center gap-4">
                      <div class="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      </div>
                      <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum inscrito encontrado</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        @if (subscribersData(); as data) {
          <div class="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Página {{ data.page }} de {{ data.totalPages }}
            </p>
            <div class="flex gap-2">
              <button 
                [disabled]="data.page <= 1"
                (click)="changePage(data.page - 1)"
                class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm cursor-pointer shadow-slate-100 active:scale-95 translate-y-0"
              >
                Anterior
              </button>
              <button 
                [disabled]="data.page >= data.totalPages"
                (click)="changePage(data.page + 1)"
                class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm cursor-pointer shadow-slate-100 active:scale-95 translate-y-0"
              >
                Próxima
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsletterPageComponent implements OnInit {
  private readonly newsService = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('');
  readonly loading = signal(true);
  readonly subscribersData = signal<any>(null);

  private currentPage = 1;

  ngOnInit(): void {
    this.fetchData();
    
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.fetchData();
      });
  }

  fetchData(): void {
    this.loading.set(true);
    this.newsService.getSubscribers({
      page: this.currentPage,
      limit: 20,
      search: this.searchControl.value || ''
    }).subscribe({
      next: (res) => {
        this.subscribersData.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.showApiError(err, 'Erro ao carregar inscritos');
        this.loading.set(false);
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.fetchData();
  }

  deleteSubscriber(sub: any): void {
    if (confirm(`Tem certeza que deseja remover ${sub.email} da newsletter?`)) {
        this.toast.showWarning('Funcionalidade de exclusão em desenvolvimento junto ao backend.', 'Aviso');
    }
  }

  copyAllEmails(): void {
    const emails = this.subscribersData()?.data.map((s: any) => s.email).join(', ');
    if (emails) {
      navigator.clipboard.writeText(emails).then(() => {
        this.toast.showSuccess('E-mails copiados para a área de transferência!', 'Sucesso');
      });
    } else {
        this.toast.showInfo('Nenhum e-mail para copiar.');
    }
  }
}
