import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthTokenService } from '../../../core/auth/auth-token.service';
import { NewsApiService } from '../../../core/services/news-api.service';
import { News } from '../../../core/models/news.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NewsletterWidgetComponent } from '../../../shared/ui/newsletter-widget/newsletter-widget.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { SponsorsCarouselComponent } from '../components/sponsors-carousel.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, CommonModule, SpinnerComponent, NewsletterWidgetComponent, SponsorsCarouselComponent],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit {
  private readonly authTokenService = inject(AuthTokenService);
  private readonly newsApi = inject(NewsApiService);
  private readonly route = inject(ActivatedRoute);
  readonly appSettings = inject(AppSettingsService);
  private readonly destroyRef = inject(DestroyRef);
  readonly isMembershipEnabled = this.appSettings.isMembershipEnabled;

  readonly isAuthenticated = () => !!this.authTokenService.getToken();
  
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly allNews = signal<News[]>([]);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly currentSearch = signal<string | null>(null);

  readonly hasMore = computed(() => this.currentPage() < this.totalPages());

  // Notícias marcadas como Destaque (isFeatured = true)
  // Só mostramos destaques se não estivermos filtrando por busca
  readonly featuredNews = computed(() => {
    if (this.currentSearch()) return [];
    return this.allNews().filter(n => n.isFeatured).slice(0, 3);
  });

  // Notícias comuns
  readonly standardNews = computed(() => {
    const featuredIds = new Set(this.featuredNews().map(n => n.id));
    return this.allNews().filter(n => !featuredIds.has(n.id));
  });

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const search = params['search'] || null;
        this.currentSearch.set(search);
        this.resetAndLoad();
      });
  }

  private resetAndLoad() {
    this.allNews.set([]);
    this.currentPage.set(1);
    this.loadNews(1);
  }

  loadMore() {
    if (this.loadingMore() || !this.hasMore()) return;
    const nextPage = this.currentPage() + 1;
    this.loadNews(nextPage, true);
  }

  private loadNews(page: number, append = false) {
    if (append) this.loadingMore.set(true);
    else this.loading.set(true);

    const search = this.currentSearch();
    
    this.newsApi.getPublicNews({ 
      page, 
      limit: 12,
      search: search || undefined
    }).subscribe({
      next: (res) => {
        if (append) {
          this.allNews.update(prev => [...prev, ...(res.items || [])]);
        } else {
          this.allNews.set(res.items || []);
        }
        this.currentPage.set(res.page);
        this.totalPages.set(res.pages);
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
