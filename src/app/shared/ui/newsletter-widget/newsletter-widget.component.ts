import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsApiService } from '../../../core/services/news-api.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-newsletter-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  template: `
    <div class="bg-cyan-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
      <!-- Background Decorative Elements -->
      <div class="absolute -top-24 -right-24 w-64 h-64 bg-cyan-800 rounded-full opacity-50 blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-500 rounded-full opacity-20 blur-3xl"></div>
      
      <div class="relative z-10 max-w-2xl mx-auto">
        <span class="inline-block px-4 py-1.5 bg-cyan-800 text-cyan-300 text-xs font-black uppercase tracking-widest rounded-full mb-6 italic">Exclusivo para Torcedores</span>
        <h2 class="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight">
          Siga o Lobo de Perto! 🐺
        </h2>
        <p class="text-cyan-100 mb-8 text-lg font-medium opacity-90">
          Receba as últimas notícias, bastidores e promoções do Pelotas direto no seu e-mail.
        </p>

        @if (subscribed()) {
          <div class="bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 p-6 rounded-2xl animate-in fade-in zoom-in duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p class="font-bold text-xl">Inscrição Confirmada!</p>
            <p class="text-emerald-200/80 text-sm mt-1">Agora você faz parte da nossa rede oficial.</p>
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              name="email"
              [(ngModel)]="email"
              required
              placeholder="Seu melhor e-mail"
              class="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-cyan-200 outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white/20 transition-all font-medium"
            />
            <button 
              type="submit" 
              [disabled]="loading() || !email()"
              class="px-8 py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black rounded-2xl transition shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <app-spinner size="sm" [inline]="true"></app-spinner>
              } @else {
                INSCREVER AGORA
              }
            </button>
          </form>
          @if (error()) {
            <p class="mt-4 text-rose-300 text-sm font-bold bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{{ error() }}</p>
          }
          <p class="mt-6 text-cyan-400 text-[10px] uppercase font-bold tracking-widest opacity-60">
            Respeitamos sua privacidade. Saia quando quiser.
          </p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterWidgetComponent {
  private readonly newsApi = inject(NewsApiService);

  readonly email = signal('');
  readonly loading = signal(false);
  readonly subscribed = signal(false);
  readonly error = signal<string | null>(null);

  onSubmit() {
    if (!this.email() || this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.newsApi.subscribeNewsletter(this.email()).subscribe({
      next: () => {
        this.subscribed.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Ocorreu um erro ao processar sua inscrição.');
        this.loading.set(false);
      }
    });
  }
}
