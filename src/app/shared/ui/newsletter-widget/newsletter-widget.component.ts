import { ChangeDetectionStrategy, Component, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsApiService } from '../../../core/services/news-api.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-newsletter-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  template: `
    <div [class]="lightMode ? 'bg-indigo-950/40 backdrop-blur-3xl border border-white/5' : 'bg-transparent'" class="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden transition-all duration-500">
      <!-- Background Decorative Elements -->
      @if (lightMode) {
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/5 rounded-full opacity-50 blur-3xl"></div>
        <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-500/5 rounded-full opacity-20 blur-3xl"></div>
      }
      
      <div class="relative z-10 max-w-2xl mx-auto">
        <span class="inline-block px-4 py-1.5 font-black uppercase tracking-widest rounded-xl mb-6 italic text-[9px]" 
              [class]="lightMode ? 'bg-amber-400 text-indigo-950 shadow-xl shadow-amber-400/20' : 'bg-white/5 text-white/40 border border-white/5'">
          Exclusivo para Torcedores
        </span>
        
        <h2 class="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-tight uppercase italic">
          Siga o Lobo de Perto! 🐺
        </h2>
        
        <p class="mb-8 text-lg font-bold leading-relaxed italic" [class]="lightMode ? 'text-slate-400' : 'text-white/40'">
          Receba bastidores e promoções exclusivas direto no seu e-mail.
        </p>

        @if (subscribed()) {
          <div class="bg-amber-400/20 border border-amber-400/30 text-amber-100 p-8 rounded-[2rem] animate-in fade-in zoom-in duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 text-amber-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p class="font-black text-2xl uppercase italic tracking-tighter">Inscrição Confirmada!</p>
            <p class="text-amber-200/60 text-xs font-bold uppercase tracking-widest mt-2">Bem-vindo à Alcateia Oficial.</p>
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              name="email"
              [(ngModel)]="email"
              required
              placeholder="Seu melhor e-mail"
              class="flex-1 px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 outline-none focus:ring-4 focus:ring-amber-400/10 focus:border-amber-400/30 transition-all font-bold italic"
            />
            <button 
              type="submit" 
              [disabled]="loading() || !email()"
              class="px-10 py-5 bg-white text-indigo-950 hover:bg-slate-100 disabled:opacity-50 font-black rounded-2xl transition shadow-2xl flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em]"
            >
              @if (loading()) {
                <app-spinner size="sm" [inline]="true" color="dark"></app-spinner>
                Processando...
              } @else {
                INSCREVER AGORA
              }
            </button>
          </form>
          @if (error()) {
            <p class="mt-4 text-rose-400 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 py-3 px-6 rounded-xl border border-rose-500/20 shadow-lg">{{ error() }}</p>
          }
          <p class="mt-8 text-[9px] uppercase font-black tracking-[0.3em] opacity-20 text-white">
            Unidos pela mesma paixão. Alcateia Alve-Azul.
          </p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterWidgetComponent {
  @Input() lightMode = true;
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
