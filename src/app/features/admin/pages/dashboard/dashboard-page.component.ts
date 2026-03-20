import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  template: `
    <div class="space-y-6">
      <header class="mb-8">
        <h1 class="text-3xl font-black tracking-tight text-slate-900">Dashboard Geral</h1>
        <p class="mt-2 text-slate-600">Bem-vindo(a) ao painel administrativo. Selecione um modulo no menu lateral para iniciar.</p>
      </header>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- Placeholder Metric Cards -->
        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold text-slate-500 uppercase tracking-widest">Usuarios Novos</p>
          <div class="mt-4 flex items-end gap-3">
            <span class="text-4xl font-black tracking-tight text-slate-900">24</span>
            <span class="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
          </div>
        </article>
        
        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold text-slate-500 uppercase tracking-widest">Receita Mensal</p>
          <div class="mt-4 flex items-end gap-3">
            <span class="text-4xl font-black tracking-tight text-slate-900">R$ 1.200</span>
            <span class="text-sm font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">-2%</span>
          </div>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-sm font-semibold text-slate-500 uppercase tracking-widest">Ativos</p>
          <div class="mt-4 flex items-end gap-3">
            <span class="text-4xl font-black tracking-tight text-slate-900">98.4%</span>
            <span class="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+0.2%</span>
          </div>
        </article>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {}
