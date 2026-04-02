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
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { FallbackImgDirective } from '../../../../shared/directives/fallback-img.directive';

@Component({
  selector: 'app-admin-news-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, FormsModule, ReactiveFormsModule, DatePipe, FallbackImgDirective],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Notícias e Matérias</h1>
          <p class="mt-1 text-slate-500">Gerencie o conteúdo publicado.</p>
        </div>
        <a routerLink="editor/new" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
          Nova Matéria
        </a>
      </header>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div class="md:col-span-2 relative">
          <input type="text" [(ngModel)]="filterQuery.search" (ngModelChange)="loadNews()" placeholder="Pesquisar..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium">
        </div>
        <select [(ngModel)]="filterQuery.status" (ngModelChange)="loadNews()" class="bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 px-4 py-2.5">
          <option value="">Todos os Status</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="DRAFT">Rascunho</option>
        </select>
        <div class="flex items-center justify-end px-2">
          <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ news().total }} totais</span>
        </div>
      </div>

      <div class="relative min-h-[400px]">
        @if (loading()) {
          <div class="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
            <app-spinner />
          </div>
        }

        @if (news().items.length > 0) {
          <div class="grid grid-cols-1 gap-4">
            @for (item of news().items; track item.id) {
              <div class="group bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:shadow-xl flex flex-col md:flex-row gap-5">
                <div class="w-full md:w-48 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 relative">
                  <img [src]="item.coverImageUrl || appSettings.defaultNewsImageUrl()" appFallbackImg="cover" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                </div>
                <div class="flex-1 flex flex-col min-w-0">
                  <div class="flex flex-wrap gap-2 mb-2">
                    @for (cat of item.categories.slice(0, 3); track cat) {
                      <span class="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">{{ cat }}</span>
                    }
                  </div>
                  <h3 class="text-lg font-black text-slate-900 leading-tight mb-2 line-clamp-2">{{ item.title }}</h3>
                  <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-500">{{ (item.publishedAt || item.createdAt) | date:'dd/MM/yyyy' }}</span>
                    </div>
                    <div class="flex gap-2">
                      <a [routerLink]="['editor', item.id]" class="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-90 shadow-sm border border-indigo-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (!loading()) {
          <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-300">
             <p class="font-bold uppercase tracking-widest text-xs">Vazio</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AdminNewsPageComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  readonly appSettings = inject(AppSettingsService);
  readonly loading = signal(false);
  readonly news = signal<PaginatedNews>({ items: [], total: 0, page: 1, limit: 10, pages: 0 });

  filterQuery = { search: '', status: '', page: 1, limit: 10 };

  ngOnInit() { this.loadNews(); }

  loadNews() {
    this.loading.set(true);
    this.newsApi.findAll(this.filterQuery)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.news.set(data),
        error: (err) => this.toast.showApiError(err, 'Falha ao carregar')
      });
  }
}
