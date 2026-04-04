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
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { FallbackImgDirective } from '../../../shared/directives/fallback-img.directive';


@Component({
  selector: 'app-news-article-page',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, SpinnerComponent, FormsModule, FallbackImgDirective],
  template: `
    <div class="flex-1 w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 min-h-screen relative pb-20">
      <!-- Background Decoration -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-40 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <main class="relative z-10 w-full max-w-5xl mx-auto px-4 pt-24">
        @if (loading()) {
          <div class="py-32 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-4 text-white/20 font-black uppercase tracking-[0.3em] text-xs">Sincronizando Alcateia...</p>
          </div>
        }

        @if (article()) {
          <!-- Luxury Hero Header -->
          <div class="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 mb-12 animate-in zoom-in-95 duration-700">
            <div class="aspect-[16/9] sm:aspect-[21/9] relative">
              <img [src]="article()!.coverImageUrl || appSettings.defaultNewsImageUrl()" 
                   appFallbackImg="cover" 
                   class="w-full h-full object-cover grayscale-[0.2]" 
                   alt="Capa">
              <!-- Deep Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/40 to-transparent"></div>
              
              <!-- Title Overlay -->
              <div class="absolute inset-0 flex flex-col justify-end p-6 sm:p-12">
                <div class="flex flex-wrap gap-2 mb-6 pointer-events-none">
                  @for (cat of article()!.categories; track cat) {
                    <span class="px-4 py-1.5 bg-amber-400 text-indigo-950 text-[9px] font-black uppercase tracking-widest rounded-xl shadow-xl transform -rotate-1">
                      {{ cat }}
                    </span>
                  }
                </div>
                <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tighter leading-tight uppercase italic max-w-3xl">
                  {{ article()!.title }}
                </h1>
              </div>
            </div>
          </div>

          <!-- Article Content Shell -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Main Content Area -->
            <div class="lg:col-span-8 animate-in fade-in slide-in-from-left duration-700">
              
              <!-- Unified Reader Card (Meta + Body) -->
              <div class="bg-indigo-950/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <!-- Inner Meta Header -->
                <div class="p-8 sm:px-12 py-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-indigo-900/10">
                  <!-- Author Info -->
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-black text-xs">
                      {{ article()!.author?.name?.charAt(0) || 'E' }}
                    </div>
                    <div class="flex flex-col">
                      <span class="text-white font-black uppercase text-[10px] tracking-widest">{{ article()!.author?.name || 'Equipe Pelotas' }}</span>
                      <span class="text-white/30 text-[8px] font-bold uppercase tracking-widest leading-none">Departamento de Comunicação</span>
                    </div>
                  </div>

                  <!-- Date & Views Meta -->
                  <div class="flex items-center gap-6 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
                     <span class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        {{ (article()!.publishedAt || article()!.createdAt) | date: 'dd MMM, yyyy' }}
                     </span>
                     <span class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7.305 4.5 3.135 7.305 1.5 12c1.635 4.695 5.805 7.5 10.5 7.5s8.865-2.805 10.5-7.5C20.865 7.305 16.695 4.5 12 4.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/></svg>
                        {{ article()!.views || 0 }}
                     </span>
                  </div>
                </div>

                <!-- Content Body -->
                <div class="p-8 sm:p-12">
                  @if (article()?.subtitle) {
                    <p class="text-xl text-amber-400 font-bold leading-relaxed italic border-l-4 border-amber-400/30 pl-8 mb-12 py-2">
                      "{{ article()!.subtitle }}"
                    </p>
                  }

                  <div class="prose prose-lg prose-invert max-w-none prose-p:text-white/90 prose-p:leading-relaxed prose-p:mb-8 prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-amber-400 prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-12">
                    <div [innerHTML]="parsedContent()"></div>
                  </div>

                  <!-- Tags Section -->
                  @if (article()?.tags?.length) {
                    <div class="mt-16 pt-10 border-t border-white/5 flex flex-wrap gap-2.5">
                      @for (tag of article()!.tags; track tag) {
                        <span class="px-4 py-2 bg-indigo-950 text-white/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:text-amber-400 hover:bg-amber-400/5 transition-all cursor-default border border-white/5">
                          #{{ tag }}
                        </span>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Engagement (Likes & Social) - Minimalist Style -->
              <div class="mt-8 flex flex-col sm:flex-row items-center gap-8 justify-between bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5">
                <div class="flex items-center gap-8">
                  @if (article()!.allowLikes) {
                    <button 
                      (click)="toggleLike()" 
                      [class]="userHasLiked() ? 'text-rose-500 scale-110' : 'text-white/30 hover:text-white'"
                      class="flex items-center gap-3 transition-all duration-300 group active:scale-95"
                    >
                      <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-rose-500/10 group-hover:border-rose-500/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" [attr.fill]="userHasLiked() ? 'currentColor' : 'none'" [attr.stroke]="userHasLiked() ? 'none' : 'currentColor'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="transition-colors"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </div>
                      <span class="font-black text-sm tracking-widest">{{ likesCount() }}</span>
                    </button>
                  }

                  <!-- Social Share Group -->
                  <div class="flex items-center gap-4 border-l border-white/10 pl-8">
                    <button (click)="copyLink()" 
                            class="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/30 flex items-center justify-center hover:bg-amber-400/10 hover:text-amber-400 transition-all active:scale-90"
                            title="Copiar Link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                    <a [href]="getWhatsAppLink()" target="_blank" 
                       class="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/30 flex items-center justify-center hover:bg-green-500/10 hover:text-green-500 transition-all active:scale-90"
                       title="WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </a>
                    <a [href]="getTwitterLink()" target="_blank" 
                       class="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-white/30 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90"
                       title="X / Twitter">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar / Related (Stacks below on mobile) -->
            <aside class="lg:col-span-4 space-y-12 animate-in fade-in slide-in-from-right duration-700">
              <!-- Related Container -->
              @if (relatedNews().length > 0) {
                <div class="bg-indigo-950/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                  <h3 class="text-lg font-black text-white uppercase italic tracking-tight mb-8 flex items-center gap-3">
                    <div class="w-1 h-6 bg-amber-400 rounded-full"></div>
                    Leia Também
                  </h3>
                  <div class="space-y-8">
                    @for (news of relatedNews(); track news.id) {
                      <a [routerLink]="['/noticias', news.slug]" class="group block space-y-4">
                        <div class="aspect-video rounded-2xl overflow-hidden border border-white/5 relative">
                          <img [src]="news.coverImageUrl || appSettings.defaultNewsImageUrl() || '/placeholder-cover.svg'" appFallbackImg="cover" class="w-full h-full object-cover group-hover:scale-110 transition duration-1000 grayscale-[0.2] group-hover:grayscale-0" />
                          <div class="absolute inset-0 bg-gradient-to-t from-indigo-950/40 to-transparent"></div>
                        </div>
                        <h4 class="text-white/80 font-bold leading-snug group-hover:text-amber-400 transition-colors line-clamp-2 uppercase text-xs tracking-tight text-left italic">
                          {{ news.title }}
                        </h4>
                      </a>
                    }
                  </div>
                </div>
              }
            </aside>
          </div>

          <!-- Comments Overlay Section -->
          @if (article()!.allowComments) {
            <div class="mt-20 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 sm:p-16 animate-in slide-in-from-bottom duration-700">
              <h3 class="text-2xl font-black text-white flex items-center gap-4 mb-12 uppercase italic">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-amber-400"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                Voz da Alcateia ({{ comments().length }})
              </h3>

              <!-- Comment Input -->
              <div class="bg-indigo-950/50 border border-white/5 rounded-[2rem] p-2 mb-12 shadow-inner">
                @if (!isAuthenticated()) {
                  <div class="text-center py-12 px-6">
                    <p class="text-white/40 mb-6 font-bold uppercase tracking-widest text-[10px] leading-relaxed">Assine o portal ou entre na sua conta para deixar seu rastro na conversa do Lobo.</p>
                    <div class="flex items-center justify-center gap-4">
                      <a routerLink="/login" class="px-8 py-3 bg-white text-indigo-950 font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-slate-100 transition shadow-lg">Entrar</a>
                      <a routerLink="/register" class="px-8 py-3 bg-amber-400 text-indigo-950 font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-amber-500 transition shadow-lg shadow-amber-400/20">Alistar-se</a>
                    </div>
                  </div>
                } @else if (!isSocio()) {
                  <div class="text-center py-12 px-6">
                    <p class="text-amber-400 mb-4 font-black uppercase tracking-[0.2em] text-xs leading-relaxed italic animate-pulse">Privilégio da Alcateia</p>
                    <p class="text-white/60 mb-8 font-bold text-sm max-w-sm mx-auto">A resenha nos comentários é um privilégio exclusivo para Sócios do Pelotas.</p>
                    <a routerLink="/membership" class="inline-flex items-center gap-3 px-10 py-4 bg-amber-400 text-indigo-950 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-amber-500 transition shadow-lg shadow-amber-400/20 group">
                      Seja Sócio Agora
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                  </div>
                } @else {
                  <div class="flex flex-col p-4">
                    <textarea 
                      [(ngModel)]="commentInput" 
                      rows="3" 
                      class="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400/30 resize-none transition-all font-medium"
                      placeholder="Deixe sua opinião sobre a matéria..."
                    ></textarea>
                    <div class="mt-4 flex justify-end">
                      <button 
                        (click)="submitComment()" 
                        [disabled]="!commentInput().trim() || isSubmittingComment()"
                        class="bg-white text-indigo-950 font-black px-10 py-3.5 rounded-xl hover:bg-slate-100 transition shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 uppercase text-[9px] tracking-[0.2em]"
                      >
                        @if (isSubmittingComment()) {
                          <app-spinner size="sm" [inline]="true" color="dark"></app-spinner>
                          Publicando...
                        } @else {
                          Enviar Comentário
                        }
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Comments List -->
              <div class="space-y-8">
                @if (comments().length === 0) {
                  <p class="text-white/10 text-center py-12 italic uppercase font-black text-[10px] tracking-widest">Nenhum comentário ainda. Dê o primeiro uivo!</p>
                }
                @for (comment of comments(); track comment.id) {
                  <div class="flex gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div class="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-black uppercase shrink-0 text-xs shadow-lg">
                      {{ comment.author?.name?.charAt(0) || 'U' }}
                    </div>
                    <div class="flex-1 bg-white/5 border border-white/5 rounded-[2rem] p-8 group hover:border-amber-400/20 transition-all duration-300 shadow-xl"
                         [class.opacity-50]="comment.isModerated">
                      <div class="flex items-center justify-between mb-4">
                        <h4 class="font-black text-white uppercase text-[10px] tracking-widest italic leading-none">{{ comment.author?.name || 'Torcedor' }}</h4>
                        <span class="text-[9px] font-black text-white/20 uppercase tracking-widest">{{ comment.createdAt | date:'shortDate' }}</span>
                      </div>
                      <p class="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-medium"
                         [class.italic]="comment.isModerated"
                         [class.text-white/40]="comment.isModerated">
                        {{ comment.content }}
                      </p>
                      
                      @if (comment.moderationInfo) {
                        <div class="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl animate-in slide-in-from-left duration-500">
                          <p class="text-rose-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                            <span class="flex items-center gap-2 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                              Ação de Moderação
                            </span>
                            {{ comment.moderationInfo }}
                          </p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      </main>
    </div>
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

  readonly isSocio = computed(() => {
    const role = this.tokenService.getRoleCode();
    return ['owner', 'admin', 'editor', 'socio'].includes(role || '');
  });

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
            html += `<h${block.data.level} class="font-black text-white mt-12 mb-6 tracking-tight uppercase italic leading-tight">${block.data.text}</h${block.data.level}>`;
            break;
          case 'paragraph':
            html += `<p class="mb-8 text-white/90 leading-relaxed text-lg font-medium">${block.data.text}</p>`;
            break;
          case 'image':
            html += `<figure class="my-12"><img src="${block.data.file.url}" class="rounded-[2.5rem] w-full object-cover shadow-2xl bg-indigo-950 border border-white/5"><figcaption class="text-xs text-center text-white/30 mt-4 font-bold uppercase tracking-widest italic">${block.data.caption || ''}</figcaption></figure>`;
            break;
          case 'list':
            const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const classlist = block.data.style === 'ordered' ? 'list-decimal pl-6 space-y-4 mb-8' : 'list-none pl-0 space-y-4 mb-8';
            html += `<${tag} class="${classlist} text-white/90 text-lg">`;
            block.data.items.forEach((li: string) => { 
                const item = block.data.style === 'ordered' ? li : `<div class="flex items-start gap-3"><div class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 shrink-0"></div><span>${li}</span></div>`;
                html += `<li class="font-medium">${item}</li>`; 
            });
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
        
        // Dispara contagem de visualização de forma isolada
        this.newsApi.incrementView(news.slug || news.id).subscribe();
      },
      error: () => {
        this.toast.showError('Matéria não encontrada ou indisponível no momento.');
        this.loading.set(false);
        this.router.navigate(['/404']);
      }
    });
  }

  private loadRelated(slug: string) {
    this.newsApi.getRelated(slug).subscribe({
      next: (res) => {
        // Sort by date (descending) to ensure most recent are first
        const sorted = [...res].sort((a,b) => {
          const dateA = new Date(a.publishedAt || a.createdAt).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        this.relatedNews.set(sorted);
      },
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
      this.toast.showSuccess('Link copiado!');
    }).catch(() => {
      this.toast.showError('Não foi possível copiar o link.');
    });
  }
}
