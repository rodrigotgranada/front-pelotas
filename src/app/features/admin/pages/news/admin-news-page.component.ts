import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginatedNews } from '../../../../core/models/news.model';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DeleteNewsModalComponent } from './components/delete-news-modal.component';

@Component({
  selector: 'app-admin-news-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, FormsModule, ReactiveFormsModule, DeleteNewsModalComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">Notícias e Matérias</h1>
          <p class="text-sm text-slate-500">Gerencie o conteúdo publicado para os torcedores</p>
        </div>
        <a
          routerLink="editor/new"
          class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
        >
          Nova Matéria
        </a>
      </div>

      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        @if (loading()) {
          <div class="flex items-center justify-center p-12">
            <app-spinner label="Carregando matérias..." size="md" />
          </div>
        } @else {
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th class="px-6 py-4">Título</th>
                <th class="px-6 py-4">Destaque</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Status / Visitas</th>
                <th class="px-6 py-4">Data</th>
                <th class="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              @for (item of news().items; track item.id) {
                <tr class="transition hover:bg-slate-50">
                  <td class="px-6 py-4">
                    <div class="font-medium text-slate-900">{{ item.title }}</div>
                    <div class="text-xs text-slate-500 font-bold uppercase mt-1">{{ item.format }}</div>
                  </td>
                  <td class="px-6 py-4">
                    @if (item.isFeatured) {
                      <span class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Sim
                      </span>
                    } @else {
                      <span class="text-xs text-slate-400 font-medium">Não</span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      [class.bg-green-100]="item.status === 'PUBLISHED'"
                      [class.text-green-800]="item.status === 'PUBLISHED'"
                      [class.bg-amber-100]="item.status === 'DRAFT'"
                      [class.text-amber-800]="item.status === 'DRAFT'"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-xs font-bold text-slate-600">{{ item.views || 0 }} acessos</td>
                  <td class="px-6 py-4 text-xs text-slate-500">{{ item.createdAt | date: 'dd/MM/yyyy - HH:mm' }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center justify-end gap-1">
                      <button (click)="openDetails(item)" class="text-cyan-600 hover:text-cyan-900 font-semibold transition px-3 py-1">Detalhes</button>
                      <a [routerLink]="['editor', item.id]" class="text-indigo-600 hover:text-indigo-900 font-semibold transition px-3 py-1">Editar</a>
                      <button 
                        (click)="$event.stopPropagation(); openDeleteModal(item)"
                        class="text-rose-400 hover:text-rose-600 transition p-2 rounded-lg hover:bg-rose-50"
                        title="Inativar/Excluir Matéria"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-8 text-center text-slate-500">Nenhuma notícia cadastrada ainda.</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>

    <!-- Info Drawer -->
    @if (selectedNews()) {
      <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900/60 transition-opacity" aria-hidden="true" (click)="closeDetails()"></div>

          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div class="pointer-events-auto w-screen max-w-md transform transition-transform shadow-2xl">
              <div class="flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl relative">
                <div class="px-4 sm:px-6 border-b border-slate-100 pb-4">
                  <div class="flex items-start justify-between">
                    <h2 class="text-base font-bold leading-6 text-slate-900" id="slide-over-title">Desempenho da Matéria</h2>
                    <div class="ml-3 flex h-7 items-center">
                      <button type="button" class="relative rounded-md bg-white text-slate-400 hover:text-slate-500" (click)="closeDetails()">
                        <span class="absolute -inset-2.5"></span><span class="sr-only">Fechar painel</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="relative flex-1 px-4 sm:px-6 flex flex-col pt-6 gap-6">
                  <div>
                    <p class="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Título</p>
                    <p class="text-lg font-black text-slate-900">{{ selectedNews()?.title }}</p>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-indigo-50 p-4 rounded-xl">
                      <p class="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-2">Acessos Públicos</p>
                      <p class="text-3xl font-black text-indigo-700">{{ selectedNews()?.views || 0 }}</p>
                    </div>
                    <div class="bg-amber-50 p-4 rounded-xl">
                      <p class="text-xs text-amber-500 font-bold uppercase tracking-wider mb-2">Destaque na Home?</p>
                      <p class="text-lg font-black text-amber-700">{{ selectedNews()?.isFeatured ? 'Sim' : 'Não' }}</p>
                    </div>
                  </div>

                  <div class="flex flex-col gap-4 border-t border-slate-100 pt-6">
                    <div>
                      <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Progresso Editorial</p>
                      <div class="bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col gap-3">
                        <div class="flex justify-between items-center text-sm">
                          <span class="text-slate-500">Criado por:</span>
                          <span class="font-bold text-slate-900">{{ selectedNews()?.author?.name || 'Desconhecido' }}</span>
                        </div>
                        @if (selectedNews()?.lastEditor) {
                          <div class="flex justify-between items-center text-sm border-t border-slate-100 pt-2">
                            <span class="text-slate-500">Última edição por:</span>
                            <span class="font-bold text-slate-900">{{ selectedNews()?.lastEditor?.name }}</span>
                          </div>
                        }
                      </div>
                    </div>

                    <div>
                      <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Data de Criação</p>
                      <p class="text-sm font-medium text-slate-900">{{ selectedNews()?.createdAt | date: 'dd/MM/yyyy - HH:mm' }}</p>
                    </div>

                    @if (selectedNews()?.status === 'PUBLISHED' && selectedNews()?.publishedAt) {
                      <div>
                        <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Data de Publicação</p>
                        <p class="text-sm font-medium text-slate-900">{{ selectedNews()?.publishedAt | date: 'dd/MM/yyyy - HH:mm' }}</p>
                      </div>
                    }

                    <div>
                      <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Formato do Código</p>
                      <p class="text-sm font-medium text-slate-900">{{ selectedNews()?.format }}</p>
                    </div>
                    
                    @if (selectedNews()?.status === 'PUBLISHED') {
                      <div class="mt-2">
                        <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Link Público</p>
                        <div class="flex items-center gap-2">
                          <input readonly class="text-sm bg-slate-50 text-slate-500 px-3 py-2 rounded-lg flex-1 border border-slate-200 outline-none" [value]="'http://localhost:4200/noticias/' + (selectedNews()?.slug || selectedNews()?.id)" />
                          <a [href]="'http://localhost:4200/noticias/' + (selectedNews()?.slug || selectedNews()?.id)" target="_blank" class="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 font-bold text-sm transition">Testar Acesso</a>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <div class="px-4 sm:px-6 pt-6 mt-auto">
                    <a [routerLink]="['editor', selectedNews()?.id]" class="w-full flex justify-center items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700">
                      Entrar no Editor
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
})
export class AdminNewsPageComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);

  readonly loading = signal(false);
  readonly news = signal<PaginatedNews>({ items: [], total: 0, page: 1, limit: 10, pages: 0 });
  readonly selectedNews = signal<any | null>(null);
  readonly newsToDelete = signal<any | null>(null);

  ngOnInit() {
    this.loadNews();
  }

  loadNews() {
    this.loading.set(true);
    this.newsApi.findAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((data) => this.news.set(data));
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
