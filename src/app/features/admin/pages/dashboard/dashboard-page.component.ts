import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsApiService } from '../../../../core/services/news-api.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <header>
        <h1 class="text-3xl font-black tracking-tight text-slate-900">Dashboard de Visão Geral</h1>
        <p class="mt-2 text-slate-600 font-medium whitespace-pre-line">
          Bem-vindo(a) ao painel estratégico do E.C. Pelotas.
          Aqui você acompanha o crescimento do portal em tempo real.
        </p>
      </header>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Metric Cards -->
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm group hover:border-cyan-200 transition-all">
          <div class="flex items-center gap-3 mb-4">
             <div class="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Inscritos Newsletter</p>
          </div>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black tracking-tight text-slate-900 leading-none">{{ totalSubscribers() }}</span>
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Total</span>
          </div>
        </div>
        
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm group hover:border-indigo-200 transition-all">
          <div class="flex items-center gap-3 mb-4">
             <div class="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
             </div>
             <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Matérias Publicadas</p>
          </div>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black tracking-tight text-slate-900 leading-none"> -- </span>
            <span class="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">Sistema</span>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm group hover:border-amber-200 transition-all">
          <div class="flex items-center gap-3 mb-4">
             <div class="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
             </div>
             <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Status de Saúde</p>
          </div>
          <div class="flex items-end gap-3">
            <span class="text-4xl font-black tracking-tight text-slate-900 leading-none truncate">Estável</span>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div class="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="text-2xl font-black tracking-tight text-slate-950">Engajamento de Newsletter</h2>
            <p class="text-sm font-medium text-slate-500">Crescimento de e-mails capturados nos últimos 6 meses</p>
          </div>
          <div class="flex gap-2">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-100">
              <div class="h-2 w-2 rounded-full bg-cyan-500"></div>
              <span class="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Inscrições</span>
            </div>
          </div>
        </div>

        <div class="relative h-64 w-full flex items-end gap-2 md:gap-4 justify-between pt-4">
          @if (loading()) {
            <div class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <p class="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em]">Compilando dados...</p>
            </div>
          }

          @for (month of stats(); track month.label) {
            <div class="relative flex-1 flex flex-col items-center group max-w-[80px]">
              <!-- Value Tooltip -->
              <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold z-20 shadow-xl whitespace-nowrap">
                {{ month.count }} inscr.
              </div>
              <!-- Bar -->
              <div 
                [style.height.%]="month.percent"
                class="w-full bg-slate-100 group-hover:bg-cyan-500 transition-all duration-500 rounded-t-xl group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] relative overflow-hidden"
              >
                <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
              <!-- Label -->
              <span class="mt-4 text-[10px] md:text-xs font-black text-slate-400 uppercase group-hover:text-slate-900 transition-colors">{{ month.label }}</span>
            </div>
          } @empty {
             @if (!loading()) {
                <div class="absolute inset-0 flex items-center justify-center">
                   <p class="text-xs font-bold text-slate-300 uppercase tracking-widest">Nenhum dado capturado ainda</p>
                </div>
             }
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly newsService = inject(NewsApiService);

  readonly stats = signal<any[]>([]);
  readonly loading = signal(true);
  readonly totalSubscribers = signal(0);

  ngOnInit(): void {
    this.newsService.getNewsletterStats().subscribe({
      next: (res) => {
        const max = Math.max(...res.map(s => s.count), 1);
        this.stats.set(res.map(s => ({
          ...s,
          percent: (s.count / max) * 100
        })));
        this.totalSubscribers.set(res.reduce((acc, curr) => acc + curr.count, 0));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
