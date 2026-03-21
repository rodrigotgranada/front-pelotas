import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NewsApiService } from '../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../core/notifications/toast-messages.service';
import { News } from '../../../core/models/news.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-news-article-page',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, SpinnerComponent],
  template: `
    <div class="min-h-screen bg-slate-50 font-sans flex flex-col">
      <!-- Minimal Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-xl font-black tracking-tighter text-slate-900 hover:text-cyan-700 transition flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-cyan-600"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></svg>
            PELOTAS
          </a>
          <nav>
            <a routerLink="/login" class="text-sm font-semibold text-slate-600 hover:text-slate-900 transition mr-4">Entrar</a>
            <a routerLink="/register" class="text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-full transition">Assinar</a>
          </nav>
        </div>
      </header>

      <main class="flex-1 w-full max-w-4xl mx-auto bg-white shadow-xl min-h-[80vh] my-0 sm:my-8 sm:rounded-3xl overflow-hidden flex flex-col relative pb-20">
        @if (loading()) {
          <div class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-4 text-slate-500 font-medium">Buscando matéria...</p>
          </div>
        }

        @if (article()) {
          <!-- Capa Hero -->
          @if (article()?.coverImageUrl) {
            <div class="w-full h-64 sm:h-96 relative overflow-hidden bg-slate-900 flex items-center justify-center">
              <img [src]="article()!.coverImageUrl" class="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105" alt="Capa da Matéria">
            </div>
          }

          <article class="px-6 py-8 sm:px-12 sm:py-12 flex-1 flex flex-col">
            <header class="mb-10 text-center sm:text-left border-b border-slate-100 pb-8">
              <h1 class="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {{ article()!.title }}
              </h1>
              @if (article()?.subtitle) {
                <p class="text-xl text-slate-600 font-medium leading-relaxed">{{ article()!.subtitle }}</p>
              }

              <div class="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-sm">
                <div class="flex items-center gap-2">
                  <div class="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-full border border-slate-200 text-slate-600 font-bold uppercase shrink-0">
                    {{ article()!.author?.name?.charAt(0) || 'E' }}
                  </div>
                  <div class="flex flex-col text-left">
                    <span class="font-bold text-slate-900">{{ article()!.author?.name || 'Equipe Pelotas' }}</span>
                    <span class="text-xs text-slate-500">Redação</span>
                  </div>
                </div>
                
                <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

                <div class="flex flex-col text-left text-slate-500">
                  <span class="font-medium text-slate-900 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {{ (article()!.publishedAt || article()!.createdAt) | date: 'dd/MM/yyyy' }}
                  </span>
                  <span class="text-xs">
                    {{ (article()!.publishedAt || article()!.createdAt) | date: 'HH:mm' }}
                    @if (article()?.updatedAt && article()?.updatedAt !== article()?.createdAt) {
                      <span class="ml-1">(Atualizado)</span>
                    }
                  </span>
                </div>
              </div>
            </header>

            <!-- Conteúdo -->
            <div class="prose prose-lg prose-slate prose-img:rounded-2xl max-w-none mx-auto w-full break-words">
              <div [innerHTML]="parsedContent()"></div>
            </div>
            
            <div class="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center justify-center gap-4">
              <p class="font-medium text-slate-500 text-sm">Gostou dessa matéria? Compartilhe com amigos.</p>
              <button class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                Copiar Link da Matéria
              </button>
            </div>
          </article>
        }
      </main>
      
      <!-- Minimal Footer -->
      <footer class="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <div class="max-w-5xl mx-auto px-4">
          <p>© 2026 Portal Pelotas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  `
})
export class NewsArticlePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly newsApi = inject(NewsApiService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly toast = inject(ToastMessagesService);

  readonly loading = signal<boolean>(true);
  readonly article = signal<News | null>(null);

  readonly parsedContent = computed(() => {
    const data = this.article();
    if (!data) return '';

    if (data.format === 'HTML') {
      return data.content;
    }

    // Parse Editor.js Blocks
    let html = '';
    const blocks = data.content?.blocks;
    if (Array.isArray(blocks)) {
      for (const block of blocks) {
        switch (block.type) {
          case 'header':
            html += `<h${block.data.level} class="font-black text-slate-900 mt-10 mb-4 tracking-tight" style="line-height: 1.2;">${block.data.text}</h${block.data.level}>`;
            break;
          case 'paragraph':
            html += `<p class="mb-6 text-slate-700 leading-relaxed text-lg">${block.data.text}</p>`;
            break;
          case 'image':
            html += `<figure class="my-10"><img src="${block.data.file.url}" class="rounded-2xl w-full object-cover shadow-md bg-slate-100"><figcaption class="text-sm text-center text-slate-500 mt-3 font-medium">${block.data.caption || ''}</figcaption></figure>`;
            break;
          case 'list':
            const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const classlist = block.data.style === 'ordered' ? 'list-decimal pl-6 space-y-2' : 'list-disc pl-6 space-y-2 marker:text-cyan-500';
            html += `<${tag} class="${classlist} mb-8 text-slate-700 text-lg">`;
            block.data.items.forEach((li: string) => { html += `<li>${li}</li>`; });
            html += `</${tag}>`;
            break;
        }
      }
    }
    return html;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.fetchArticle(slug);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private fetchArticle(slug: string) {
    this.loading.set(true);
    this.newsApi.getPublicBySlug(slug).subscribe({
      next: (news) => {
        this.article.set(news);
        this.loading.set(false);
        this.updateSeoTags(news);
        // Dispara contagem de visuzalização de forma isolada
        this.newsApi.incrementView(news.slug || news.id).subscribe();
      },
      error: () => {
        // Redireciona para um generico 404
        this.toast.showError('Matéria não encontrada ou indisponível no momento.');
        this.loading.set(false);
        this.router.navigate(['/404']);
      }
    });
  }

  private updateSeoTags(news: News) {
    this.titleService.setTitle(`${news.title} | Portal Pelotas`);

    this.metaService.updateTag({ property: 'og:title', content: news.title });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Portal Pelotas' });

    if (news.subtitle) {
      this.metaService.updateTag({ name: 'description', content: news.subtitle });
      this.metaService.updateTag({ property: 'og:description', content: news.subtitle });
    }
    
    if (news.coverImageUrl) {
      this.metaService.updateTag({ property: 'og:image', content: news.coverImageUrl });
      this.metaService.updateTag({ property: 'og:image:width', content: '800' });
      this.metaService.updateTag({ property: 'og:image:height', content: '450' });
    }
  }
}
