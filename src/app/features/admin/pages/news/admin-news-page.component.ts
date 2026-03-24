import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { RouterLink } from '@angular/router';
import { PaginatedNews } from '../../../../core/models/news.model';
import { AppSettingsService } from '../../../../core/services/app-settings.service';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DeleteNewsModalComponent } from './components/delete-news-modal.component';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-admin-news-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, FormsModule, ReactiveFormsModule, DeleteNewsModalComponent],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Notícias e Matérias</h1>
          <p class="mt-1 text-slate-500">Gerencie o conteúdo publicado e acompanhe o engajamento dos torcedores.</p>
        </div>
        <a
          routerLink="editor/new"
          class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Nova Matéria
        </a>
      </header>

      <!-- Filters & Toolbar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all">
        <div class="md:col-span-2 relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            [(ngModel)]="filterQuery.search"
            (ngModelChange)="onFilterChange()"
            placeholder="Buscar por título ou autor..." 
            class="w-full rounded-xl border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>
        
        <select 
          [(ngModel)]="filterQuery.status" 
          (ngModelChange)="onFilterChange()"
          class="rounded-xl border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer bg-white"
        >
          <option value="">Todos os status</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="DRAFT">Rascunho</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>

        <div class="flex items-center justify-end px-2">
           <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ news().total }} matérias</span>
        </div>
      </div>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="overflow-x-auto relative">
          @if (loading()) {
            <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm min-h-[300px]">
              <app-spinner label="Processando..." size="md" />
            </div>
          }

          <table class="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead class="bg-slate-50/80 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Matéria</th>
                <th class="px-6 py-4">Home</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Engajamento</th>
                <th class="px-6 py-4">Criado em</th>
                <th class="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of news().items; track item.id) {
                <tr class="transition hover:bg-slate-50/50 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        @if (item.coverImageUrl || appSettings.defaultNewsImageUrl()) {
                          <img [src]="item.coverImageUrl || appSettings.defaultNewsImageUrl()" class="h-full w-full object-cover" />
                        } @else {
                          <div class="h-full w-full flex items-center justify-center text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          </div>
                        }
                      </div>
                      <div class="max-w-[240px] truncate">
                        <div class="font-bold text-slate-900 truncate" [title]="item.title">{{ item.title }}</div>
                        <div class="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{{ item.format }} • {{ item.categories[0] || 'Sem categoria' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <button 
                      (click)="toggleFeatured(item)"
                      [class.bg-amber-100]="item.isFeatured"
                      [class.text-amber-700]="item.isFeatured"
                      [class.bg-slate-100]="!item.isFeatured"
                      [class.text-slate-400]="!item.isFeatured"
                      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tight transition hover:scale-105 active:scale-95 shadow-sm border border-transparent"
                      [class.border-amber-200]="item.isFeatured"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" [attr.fill]="item.isFeatured ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {{ item.isFeatured ? 'Sim' : 'Não' }}
                    </button>
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      class="inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-tight"
                      [class.bg-emerald-50]="item.status === 'PUBLISHED'"
                      [class.text-emerald-700]="item.status === 'PUBLISHED'"
                      [class.bg-amber-50]="item.status === 'DRAFT'"
                      [class.text-amber-700]="item.status === 'DRAFT'"
                      [class.bg-slate-100]="item.status === 'ARCHIVED'"
                      [class.text-slate-500]="item.status === 'ARCHIVED'"
                    >
                      {{ item.status === 'PUBLISHED' ? 'Publicado' : item.status === 'DRAFT' ? 'Rascunho' : 'Arquivado' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                      <div class="flex items-center gap-1.5" title="Visualizações">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                        {{ item.views || 0 }}
                      </div>
                      <div class="flex items-center gap-1.5" title="Curtidas">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-rose-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        {{ item.likesCount || 0 }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-xs font-medium text-slate-400 tracking-tight">
                    {{ item.createdAt | date: 'dd MMM, yy • HH:mm' }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-1">
                      <button (click)="openDetails(item)" class="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition shadow-sm" title="Ver estatísticas">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                      </button>
                      <a [routerLink]="['editor', item.id]" class="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition shadow-sm" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </a>
                      <button 
                        (click)="$event.stopPropagation(); openDeleteModal(item)"
                        class="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition shadow-sm"
                        title="Inativar/Excluir"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-20 text-center">
                    <div class="flex flex-col items-center gap-3">
                      <div class="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                      </div>
                      <p class="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhuma notícia encontrada</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        @if (news(); as data) {
          <div class="bg-slate-50/50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Página {{ data.page }} de {{ data.pages || 1 }}
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
                [disabled]="data.page >= data.pages"
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

    <!-- Info Drawer -->
    @if (selectedNews()) {
      <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity" aria-hidden="true" (click)="closeDetails()"></div>

          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div class="pointer-events-auto w-screen max-w-md transform transition-transform shadow-2xl">
              <div class="flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl relative">
                <div class="px-6 border-b border-slate-100 pb-5">
                  <div class="flex items-start justify-between">
                    <h2 class="text-xl font-black tracking-tight text-slate-900" id="slide-over-title">Desempenho da Matéria</h2>
                    <div class="ml-3 flex h-7 items-center">
                      <button type="button" class="relative rounded-full p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors" (click)="closeDetails()">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="relative flex-1 px-6 flex flex-col pt-8 gap-8">
                  <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Título da Matéria</p>
                    <p class="text-lg font-black text-slate-900 leading-tight">{{ selectedNews()?.title }}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                      <div class="flex items-center gap-2 mb-3">
                         <div class="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                         </div>
                         <p class="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Acessos</p>
                      </div>
                      <p class="text-3xl font-black text-indigo-700">{{ selectedNews()?.views || 0 }}</p>
                    </div>
                    <div class="bg-rose-50/50 p-5 rounded-2xl border border-rose-100">
                      <div class="flex items-center gap-2 mb-3">
                         <div class="h-6 w-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                         </div>
                         <p class="text-[10px] text-rose-500 font-black uppercase tracking-widest">Curtidas</p>
                      </div>
                      <p class="text-3xl font-black text-rose-700">{{ selectedNews()?.likesCount || 0 }}</p>
                    </div>
                  </div>

                  <div class="space-y-4 border-t border-slate-100 pt-8 mt-2">
                    <div class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div class="flex items-center gap-2">
                        <div class="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">{{ selectedNews()?.author?.name?.charAt(0) || 'D' }}</div>
                        <div class="flex flex-col">
                          <span class="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Autor Principal</span>
                          <span class="text-sm font-bold text-slate-800">{{ selectedNews()?.author?.name || 'Desconhecido' }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-col gap-1.5 px-1">
                      <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Timeline Editorial</p>
                      <div class="flex items-center gap-3 text-sm">
                         <div class="h-2 w-2 rounded-full bg-indigo-500"></div>
                         <span class="text-slate-500 font-medium">Criado:</span>
                         <span class="font-bold text-slate-800">{{ selectedNews()?.createdAt | date: 'dd/MM/yyyy • HH:mm' }}</span>
                      </div>
                      @if (selectedNews()?.status === 'PUBLISHED') {
                        <div class="flex items-center gap-3 text-sm">
                           <div class="h-2 w-2 rounded-full bg-emerald-500"></div>
                           <span class="text-slate-500 font-medium">Publicado:</span>
                           <span class="font-bold text-slate-800">{{ selectedNews()?.publishedAt | date: 'dd/MM/yyyy • HH:mm' }}</span>
                        </div>
                      }
                    </div>
                    
                    @if (selectedNews()?.status === 'PUBLISHED') {
                      <div class="mt-6">
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Acesso Rápido</p>
                        <div class="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                          <input readonly class="text-xs bg-transparent text-slate-500 px-3 py-2 flex-1 outline-none font-medium" [value]="publicBaseUrl + '/noticias/' + (selectedNews()?.slug || selectedNews()?.id)" />
                          <a [href]="publicBaseUrl + '/noticias/' + (selectedNews()?.slug || selectedNews()?.id)" target="_blank" class="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 font-bold text-xs transition shadow-sm active:scale-95">Abrir</a>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="px-6 pt-6 mt-auto border-t border-slate-100 grid grid-cols-2 gap-3">
                    <button (click)="closeDetails()" class="w-full flex justify-center items-center rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
                       Fechar
                    </button>
                    <a [routerLink]="['editor', selectedNews()?.id]" class="w-full flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
                      Editar Matéria
                    </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Modal Delete -->
    @if (newsToDelete()) {
      <app-delete-news-modal
        [news]="newsToDelete()!"
        (close)="newsToDelete.set(null)"
        (deleted)="onNewsDeleted()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsPageComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  readonly appSettings = inject(AppSettingsService);

  readonly loading = signal(false);
  readonly publicBaseUrl = environment.publicBaseUrl;
  readonly news = signal<PaginatedNews>({ items: [], total: 0, page: 1, limit: 10, pages: 0 });
  readonly selectedNews = signal<any | null>(null);
  readonly newsToDelete = signal<any | null>(null);

  filterQuery = {
    search: '',
    status: '',
    page: 1,
    limit: 10
  };

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading.set(true);
    this.newsApi.findAll(this.filterQuery)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.news.set(data),
        error: (err) => this.toast.showApiError(err, 'Falha ao carregar notícias')
      });
  }

  onFilterChange() {
    this.filterQuery.page = 1;
    this.loadNews();
  }

  changePage(page: number) {
    if (page < 1 || page > this.news().pages) return;
    this.filterQuery.page = page;
    this.loadNews();
  }

  toggleFeatured(item: any) {
    const newStatus = !item.isFeatured;
    this.loading.set(true);
    this.newsApi.update(item.id, { isFeatured: newStatus })
      .subscribe({
        next: () => {
          this.toast.showSuccess(`Matéria ${newStatus ? 'marcada como destaque' : 'removida dos destaques'}`, 'Sucesso');
          this.loadNews();
        },
        error: (err) => {
          this.toast.showApiError(err, 'Falha ao atualizar destaque');
          this.loading.set(false);
        }
      });
  }

  openDetails(item: any) {
    this.selectedNews.set(item);
  }

  closeDetails() {
    this.selectedNews.set(null);
  }

  openDeleteModal(item: any) {
    this.newsToDelete.set(item);
  }

  onNewsDeleted() {
    this.newsToDelete.set(null);
    this.loadNews();
  }
}
