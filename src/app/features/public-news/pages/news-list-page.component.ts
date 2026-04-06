import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NewsApiService } from '../../../core/services/news-api.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { News, NewsCategory } from '../../../core/models/news.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { FallbackImgDirective } from '../../../shared/directives/fallback-img.directive';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-news-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, SpinnerComponent, FallbackImgDirective],
  template: `
    <div class="flex-1 w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 min-h-screen">
      <!-- Hero Section -->
      <section class="relative pt-24 pb-16 overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div class="max-w-7xl mx-auto px-4 relative z-10">
          <div class="flex flex-col items-center text-center space-y-6">
            <div class="flex items-center gap-3 animate-in fade-in slide-in-from-top duration-700">
               <div class="w-2 h-10 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
               <h1 class="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase italic">
                 Central de Notícias
               </h1>
            </div>
            <p class="text-[8px] sm:text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-4 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
              Acompanhe cada detalhe, cada vitória e cada história da Alcateia Áureo-Cerúlea
            </p>
          </div>

          <!-- Search & Filters -->
          <!-- Minimalist Search Input -->
          <div class="mt-8 max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
            <div class="relative group">
              <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-amber-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input 
                type="text" 
                [ngModel]="searchQuery()" 
                (ngModelChange)="onSearchChange($event)"
                placeholder="O que você está procurando na Alcateia?" 
                class="w-full bg-indigo-950/40 backdrop-blur-2xl border border-white/10 rounded-2xl py-5 pl-16 pr-14 text-white placeholder:text-white/20 font-bold outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400 transition-all shadow-2xl"
              >
              @if (searchQuery()) {
                <button 
                  (click)="clearSearch()"
                  class="absolute inset-y-0 right-5 flex items-center text-white/20 hover:text-amber-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content -->
      <section class="max-w-7xl mx-auto px-4 pb-32">
        @if (loading()) {
          <div class="py-32 flex flex-col items-center justify-center">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Sincronizando Alcateia...</p>
          </div>
        } @else {
          @if (news().length === 0) {
            <div class="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <div>
                <p class="text-xl font-black text-white uppercase italic">Nenhuma matéria encontrada</p>
                <p class="text-xs font-bold text-slate-400 mt-2">Tente ajustar sua busca ou categoria</p>
              </div>
            </div>
          } @else {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              @for (item of news(); track item.id; let i = $index) {
                <a [routerLink]="['/noticias', item.slug]" 
                   class="group bg-indigo-900/20 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden hover:border-amber-400/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full animate-in fade-in slide-in-from-bottom duration-500"
                   [style.animation-delay]="(i % 6) * 100 + 'ms'"
                >
                  <!-- Cover Image -->
                  <div class="aspect-[16/10] overflow-hidden relative">
                    <img 
                      [src]="item.coverImageUrl" 
                      [alt]="item.title"
                      appFallbackImg="cover"
                      class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity"></div>
                    
                    <!-- Categories -->
                    <div class="absolute top-6 left-6 flex flex-col items-start gap-2">
                      @for (cat of item.categories.slice(0,2); track cat) {
                        <span class="px-3 py-1 bg-amber-400 text-indigo-950 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                          {{ cat }}
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Card Content -->
                  <div class="p-8 flex flex-col flex-1 relative">
                    <!-- Date Meta -->
                    <div class="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">
                      <span class="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {{ (item.publishedAt || item.createdAt) | date:'dd MMM, yyyy' }}
                      </span>
                    </div>

                    <h3 class="text-xl sm:text-2xl font-black text-white leading-[1.1] mb-4 group-hover:text-amber-400 transition-colors uppercase tracking-tight line-clamp-3 italic">
                      {{ item.title }}
                    </h3>

                    @if (item.subtitle) {
                      <p class="text-slate-400 text-xs sm:text-sm font-bold leading-relaxed line-clamp-2 mb-8 opacity-60">
                        {{ item.subtitle }}
                      </p>
                    }

                    <div class="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <span class="text-[10px] font-black text-amber-400/40 uppercase tracking-widest group-hover:text-amber-400 transition-colors">Ler Reportagem</span>
                      <div class="flex items-center gap-3 text-[10px] font-black text-white/20">
                         <span class="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><circle cx="12" cy="12" r="3"/></svg>
                            {{ item.views || 0 }}
                         </span>
                      </div>
                    </div>
                  </div>
                </a>
              }
            </div>

            <!-- Page Actions -->
            @if (hasMore()) {
              <div class="mt-20 flex justify-center">
                <button 
                  (click)="loadMore()" 
                  [disabled]="loadingMore()"
                  class="px-12 py-5 bg-white text-indigo-950 rounded-2xl shadow-2xl shadow-indigo-500/20 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4 group"
                >
                  @if (loadingMore()) {
                    <app-spinner size="sm" [inline]="true"></app-spinner>
                    Buscando Matérias...
                  } @else {
                    Carregar Mais Notícias
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  }
                </button>
              </div>
            }
          }
        }
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NewsListPageComponent implements OnInit {
  private readonly newsApi = inject(NewsApiService);
  private readonly route = inject(ActivatedRoute);
  readonly appSettings = inject(AppSettingsService);

  readonly news = signal<News[]>([]);
  readonly categories = signal<NewsCategory[]>([]);
  
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly currentPage = signal(1);
  readonly hasMore = signal(false);
  
  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  
  private searchSubject = new Subject<string>();

  constructor() {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchQuery.set(value);
      this.refresh();
    });

    // Effect to auto-refresh when category changes
    effect(() => {
      const cat = this.selectedCategory();
      this.refresh();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadCategories();
    
    // Captura busca vinda da URL (ex: drawer mobile)
    this.route.queryParams.subscribe(params => {
      const q = params['q'] || params['search'];
      if (q) {
        this.searchQuery.set(q);
        this.refresh();
      } else {
        this.fetchNews(true); // Carga inicial padrão
      }
    });
  }

  private loadCategories() {
    this.newsApi.getCategories().subscribe(res => this.categories.set(res));
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  selectCategory(name: string) {
    // Toggle: if clicking same category, clear it to show all
    if (this.selectedCategory() === name) {
      this.selectedCategory.set('');
    } else {
      this.selectedCategory.set(name);
    }
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  refresh() {
    this.currentPage.set(1);
    this.fetchNews(true);
  }

  loadMore() {
    if (this.loadingMore()) return;
    this.currentPage.update(p => p + 1);
    this.fetchNews(false);
  }

  private fetchNews(isInitial: boolean) {
    if (isInitial) this.loading.set(true);
    else this.loadingMore.set(true);

    this.newsApi.getPublicNews({
      page: this.currentPage(),
      limit: 9,
      search: this.searchQuery(),
      category: this.selectedCategory()
    }).subscribe({
      next: (res) => {
        if (isInitial) this.news.set(res.items);
        else this.news.update(all => [...all, ...res.items]);
        
        this.hasMore.set(res.page < res.pages);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    });
  }
}
