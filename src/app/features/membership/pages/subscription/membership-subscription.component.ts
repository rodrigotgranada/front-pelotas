import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MembershipService, MembershipPlan } from '../../../../shared/master-bypass-v2';
import { finalize } from 'rxjs';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-membership-subscription',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <header class="text-center mb-12">
          <h1 class="text-4xl font-black text-slate-900 tracking-tight mb-4">Finalize sua Adesão</h1>
          <p class="text-lg text-slate-600 font-medium">Você está a poucos passos de se tornar um Sócio do E.C. Pelotas.</p>
        </header>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <app-spinner />
            <p class="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando detalhes do plano...</p>
          </div>
        } @else if (plan()) {
          <div class="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
            <div class="p-8 sm:p-12">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-8 border-b border-slate-50">
                <div>
                  <h2 class="text-3xl font-black text-slate-900 mb-1">{{ plan()?.name }}</h2>
                  <p class="text-slate-500 font-medium">{{ plan()?.description }}</p>
                </div>
                <div class="text-4xl font-black text-indigo-600">
                  R$ {{ plan()?.price }}<span class="text-sm text-slate-400 uppercase tracking-widest ml-1">/mês</span>
                </div>
              </div>

              <div class="space-y-6">
                <h3 class="text-xs font-black uppercase tracking-widest text-slate-400">Benefícios inclusos</h3>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  @for (benefit of plan()?.benefits; track benefit) {
                    <li class="flex items-start gap-3">
                      <div class="mt-1 bg-emerald-100 rounded-full p-1 text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <span class="text-slate-700 font-bold text-sm">{{ benefit }}</span>
                    </li>
                  }
                </ul>
              </div>

              <div class="mt-12 p-8 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div class="flex items-start gap-4">
                  <div class="bg-indigo-600 rounded-xl p-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </div>
                  <div>
                    <h4 class="text-indigo-900 font-black mb-1">Pagamento Mockado</h4>
                    <p class="text-indigo-700/70 text-sm font-medium">Nesta versão de teste, o pagamento será processado automaticamente para simular a adesão real.</p>
                  </div>
                </div>
              </div>

              <div class="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  (click)="confirmEnrollment()" 
                  [disabled]=" enrolling()"
                  class="flex-1 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  @if (enrolling()) { <app-spinner /> }
                  {{ enrolling() ? 'Processando...' : 'Confirmar e Assinar Agora' }}
                </button>
                <a 
                  routerLink="/seja-socio"
                  class="py-4 px-8 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black rounded-2xl transition-all text-center"
                >
                  Cancelar
                </a>
              </div>
            </div>
          </div>
        } @else {
           <div class="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
              <p class="text-slate-400 font-black uppercase tracking-widest text-xs">Plano não encontrado</p>
              <a routerLink="/seja-socio" class="mt-4 inline-block text-indigo-600 font-bold">Voltar para planos</a>
           </div>
        }
      </div>
    </div>
  `,
})
export class MembershipSubscriptionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly membershipApi = inject(MembershipService);
  private readonly toast = inject(ToastMessagesService);

  readonly plan = signal<MembershipPlan | null>(null);
  readonly loading = signal(true);
  readonly enrolling = signal(false);

  ngOnInit() {
    const planId = this.route.snapshot.paramMap.get('planId');
    if (!planId) {
      this.router.navigate(['/seja-socio']);
      return;
    }
    this.loadPlan(planId);
  }

  loadPlan(id: string) {
    this.membershipApi.getPlan(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (p) => this.plan.set(p),
        error: (err) => this.toast.showApiError(err, 'Falha ao carregar plano')
      });
  }

  confirmEnrollment() {
    const p = this.plan();
    if (!p) return;

    this.enrolling.set(true);
    this.membershipApi.enroll(p.id)
      .pipe(finalize(() => this.enrolling.set(false)))
      .subscribe({
        next: () => {
          this.toast.showSuccess('Parabéns!', 'Agora você é Sócio do Lobo!');
          this.router.navigate(['/app/me']);
        },
        error: (err) => this.toast.showApiError(err, 'Falha na adesão')
      });
  }
}
