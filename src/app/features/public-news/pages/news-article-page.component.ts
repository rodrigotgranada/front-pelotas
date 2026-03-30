import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthTokenService } from '../../../core/auth/auth-token.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NewsApiService } from '../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../core/notifications/toast-messages.service';
import { News } from '../../../core/models/news.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { SeoService } from '../../../core/services/seo.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NewsletterWidgetComponent } from '../../../shared/ui/newsletter-widget/newsletter-widget.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';


@Component({
  selector: 'app-news-article-page',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, SpinnerComponent, FormsModule, NewsletterWidgetComponent],
  template: `
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 py-8 flex flex-col relative pb-20">
        @if (loading()) {
          <div class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-4 text-slate-500 font-medium">Buscando matéria...</p>
          </div>
        }

        @if (article()) {
          <!-- Capa Hero -->
          @if (article()?.coverImageUrl || appSettings.defaultNewsImageUrl()) {
            <div class="w-full h-64 sm:h-96 relative overflow-hidden bg-slate-900 flex items-center justify-center">
              <img [src]="article()!.coverImageUrl || appSettings.defaultNewsImageUrl()" class="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105" alt="Capa da Matéria">
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

              <div class="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <!-- Data / Author Info -->
                <div class="flex flex-wrap items-center justify-start gap-4 sm:gap-6 text-sm">
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

                <!-- Social Actions -->
                <div class="flex items-center gap-2">
                  <a [href]="getWhatsAppLink()" target="_blank" class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 hover:text-green-700 transition" title="Compartilhar no WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </a>
                  <a [href]="getTwitterLink()" target="_blank" class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition" title="Compartilhar no X (Twitter)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <button (click)="copyLink()" class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-700 transition" title="Copiar Link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </div>
            </header>

            <!-- Conteúdo -->
            <div class="prose prose-lg prose-slate prose-img:rounded-2xl max-w-none mx-auto w-full break-words">
              <div [innerHTML]="parsedContent()"></div>
            </div>
            
            <div class="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center justify-center gap-4">
              <p class="font-medium text-slate-500 text-sm">Gostou dessa matéria? Compartilhe com amigos.</p>
              
              <div class="flex items-center gap-3">
                @if (article()!.allowLikes) {
                  <button (click)="toggleLike()" [ngClass]="userHasLiked() ? 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'" class="font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-sm border">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" [attr.fill]="userHasLiked() ? 'currentColor' : 'none'" [attr.stroke]="userHasLiked() ? 'none' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [class.text-rose-500]="userHasLiked()"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {{ likesCount() }} Curtidas
                  </button>
                }

                <button (click)="copyLink()" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                  Copiar Link
                </button>
              </div>
            </div>

            <!-- Seção de Comentários -->
            @if (article()!.allowComments) {
              <div class="mt-16 pt-12 border-t border-slate-200">
                <h3 class="text-2xl font-black text-slate-900 flex items-center gap-2 mb-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Comentários da Torcida ({{ comments().length }})
                </h3>

                <!-- Input Box -->
                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-10">
                  @if (!isAuthenticated()) {
                    <div class="text-center py-6">
                      <p class="text-slate-600 mb-4 font-medium">Faça login ou cadastre-se no portal para deixar seu comentário.</p>
                      <div class="flex items-center justify-center gap-3">
                        <a routerLink="/login" class="bg-white border border-slate-300 text-slate-700 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-50 transition drop-shadow-sm">Fazer Login</a>
                        <a routerLink="/register" class="bg-cyan-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-cyan-700 transition drop-shadow-sm">Assinar Portal</a>
                      </div>
                    </div>
                  } @else {
                    <div class="flex flex-col">
                      <textarea 
                        [(ngModel)]="commentInput" 
                        rows="3" 
                        class="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition"
                        placeholder="Deixe sua opinião sobre a matéria..."
                      ></textarea>
                      <div class="mt-3 flex justify-end">
                        <button 
                          (click)="submitComment()" 
                          [disabled]="!commentInput().trim() || isSubmittingComment()"
                          class="bg-cyan-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-cyan-700 transition drop-shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          @if (isSubmittingComment()) {
                            Enviando...
                          } @else {
                            Enviar Comentário
                          }
                        </button>
                      </div>
                    </div>
                  }
                </div>

                <!-- Lista de Comentários -->
                <div class="space-y-6">
                  @if (comments().length === 0) {
                    <p class="text-slate-500 text-center py-8 italic">Seja o primeiro a comentar nesta matéria.</p>
                  }
                  @for (comment of comments(); track comment.id) {
                    <div class="flex gap-4">
                      <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase shrink-0">
                        {{ comment.author?.name?.charAt(0) || 'U' }}
                      </div>
                      <div class="flex-1 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                        <div class="flex items-center justify-between mb-2">
                          <h4 class="font-bold text-slate-900">{{ comment.author?.name || 'Torcedor' }}</h4>
                          <span class="text-xs text-slate-400">{{ comment.createdAt | date:'short' }}</span>
                        </div>
                        <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{{ comment.content }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
            <!-- Related News Section -->
            @if (relatedNews().length > 0) {
              <div class="mt-20 border-t border-slate-100 pt-16">
                <h2 class="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-cyan-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Leia também
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  @for (news of relatedNews(); track news.id) {
                    <a [routerLink]="['/noticias', news.slug]" class="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div class="h-40 overflow-hidden relative">
                        <img [src]="news.coverImageUrl || appSettings.defaultNewsImageUrl() || 'assets/placeholder-cover.jpg'" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                      </div>
                      <div class="p-4">
                        <span class="text-[10px] font-bold uppercase text-cyan-700 mb-1 block">{{ news.categories[0] }}</span>
                        <h3 class="text-base font-black text-slate-900 leading-tight group-hover:text-cyan-600 transition line-clamp-2">
                          {{ news.title }}
                        </h3>
                      </div>
                    </a>
                  }
                </div>
              </div>
            }
            <!-- Newsletter Widget on Article -->
            <div class="mt-20">
              <app-newsletter-widget></app-newsletter-widget>
            </div>
          </article>
        }
      </main>
  `
})
export class NewsArticlePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly newsApi = inject(NewsApiService);
  private readonly seo = inject(SeoService);
  private readonly toast = inject(ToastMessagesService);
  private readonly tokenService = inject(AuthTokenService);
  readonly appSettings = inject(AppSettingsService);

  readonly isAuthenticated = () => !!this.tokenService.getToken();

  readonly loading = signal<boolean>(true);
  readonly article = signal<News | null>(null);
  readonly relatedNews = signal<News[]>([]);

  readonly userHasLiked = signal<boolean>(false);
  readonly likesCount = signal<number>(0);
  readonly comments = signal<any[]>([]);
  readonly commentInput = signal<string>('');
  readonly isSubmittingComment = signal<boolean>(false);

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
        this.likesCount.set(news.likesCount || 0);

        if (this.isAuthenticated() && news.allowLikes) {
          this.newsApi.getLikeStatus(slug).subscribe(res => this.userHasLiked.set(res.liked));
        }
        if (news.allowComments) {
          this.newsApi.getComments(slug).subscribe(res => this.comments.set(res));
        }

        this.loading.set(false);
        this.seo.updateArticleSeo(news);
        this.loadRelated(news.slug);
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

  private loadRelated(slug: string) {
    this.newsApi.getRelated(slug).subscribe({
      next: (res) => this.relatedNews.set(res),
      error: () => this.relatedNews.set([])
    });
  }

  toggleLike() {
    if (!this.isAuthenticated()) {
      this.toast.showWarning('Faça login ou cadastre-se para curtir.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const data = this.article();
    if (!data || !data.allowLikes) return;

    // Optimistic UI update
    const currentlyLiked = this.userHasLiked();
    this.userHasLiked.set(!currentlyLiked);
    this.likesCount.update(c => currentlyLiked ? c - 1 : c + 1);

    this.newsApi.toggleLike(data.slug).subscribe({
      next: (res) => {
        this.userHasLiked.set(res.liked);
        this.likesCount.set(res.totalLikes);
      },
      error: () => {
        // Revert optimistic update
        this.userHasLiked.set(currentlyLiked);
        this.likesCount.update(c => currentlyLiked ? c + 1 : c - 1);
        this.toast.showError('Erro ao registrar curtida.');
      }
    });
  }

  submitComment() {
    if (!this.isAuthenticated()) {
      this.toast.showWarning('Faça login ou cadastre-se para comentar.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    
    const text = this.commentInput().trim();
    if (!text) return;
    
    const data = this.article();
    if (!data || !data.allowComments) return;

    this.isSubmittingComment.set(true);
    this.newsApi.addComment(data.slug, text).subscribe({
      next: (res) => {
        // Unshift the new comment to the top of the array visually
        this.comments.update(all => [res, ...all]);
        this.commentInput.set('');
        this.isSubmittingComment.set(false);
        this.toast.showSuccess('Comentário publicado!');
      },
      error: () => {
        this.isSubmittingComment.set(false);
        this.toast.showError('Erro ao publicar comentário.');
      }
    });
  }

  getWhatsAppLink(): string {
    const text = encodeURIComponent(`Confira essa matéria do Pelotas: ${this.article()?.title} - `);
    const url = encodeURIComponent(window.location.href);
    return `https://api.whatsapp.com/send?text=${text}${url}`;
  }

  getTwitterLink(): string {
    const text = encodeURIComponent(this.article()?.title || '');
    const url = encodeURIComponent(window.location.href);
    return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  }

  copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.toast.showSuccess('Link copiado para a área de transferência!');
    }).catch(() => {
      this.toast.showError('Não foi possível copiar o link.');
    });
  }
}
