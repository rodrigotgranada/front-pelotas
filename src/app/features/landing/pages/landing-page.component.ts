import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthTokenService } from '../../../core/auth/auth-token.service';
import { NewsApiService } from '../../../core/services/news-api.service';
import { News } from '../../../core/models/news.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, CommonModule, SpinnerComponent],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent implements OnInit {
  private readonly authTokenService = inject(AuthTokenService);
  private readonly newsApi = inject(NewsApiService);

  readonly isAuthenticated = () => !!this.authTokenService.getToken();
  
  readonly loading = signal(true);
  readonly allNews = signal<News[]>([]);

  // Notícias marcadas como Destaque (isFeatured = true)
  readonly featuredNews = computed(() => {
    return this.allNews().filter(n => n.isFeatured).slice(0, 3);
  });

  // Notícias comuns (as que não entraram no Destaque ou excederam o limite 3)
  readonly standardNews = computed(() => {
    const featuredIds = new Set(this.featuredNews().map(n => n.id));
    return this.allNews().filter(n => !featuredIds.has(n.id));
  });

  ngOnInit() {
    this.newsApi.getPublicNews({ page: 1, limit: 12 }).subscribe({
      next: (res) => {
        this.allNews.set(res.items || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
