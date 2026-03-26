import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MembershipService, MembershipPlan } from '../../../../shared/master-bypass-v2';
import { finalize } from 'rxjs';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-admin-plans-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Planos de Sócio</h1>
          <p class="mt-1 text-slate-500 font-medium">Gerencie as opções de assinatura para os torcedores.</p>
        </div>
        <a routerLink="novo" class="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95">
          Novo Plano
        </a>
      </header>

      <div class="relative min-h-[400px]">
        @if (loading()) {
          <div class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
            <app-spinner />
          </div>
        }

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (plan of plans(); track plan.id) {
            <div class="group bg-white border border-slate-200 rounded-3xl p-8 transition-all hover:shadow-2xl hover:border-indigo-100 flex flex-col">
              <div class="flex justify-between items-start mb-6">
                <span [class]="plan.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'" class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {{ plan.isActive ? 'Ativo' : 'Inativo' }}
                </span>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <a [routerLink]="['editar', plan.id]" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </a>
                  <button (click)="deletePlan(plan.id)" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </div>
              </div>

              <h3 class="text-2xl font-black text-slate-900 mb-2">{{ plan.name }}</h3>
              <p class="text-slate-500 text-sm font-medium line-clamp-2 mb-6">{{ plan.description }}</p>
              
              <div class="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div class="text-2xl font-black text-indigo-600">
                  R$ {{ plan.price }}<span class="text-[10px] text-slate-400 uppercase tracking-widest ml-1">/mês</span>
                </div>
              </div>
            </div>
          } @empty {
            @if (!loading()) {
               <div class="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <p class="font-black uppercase tracking-widest text-xs">Nenhum plano cadastrado</p>
               </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminPlansPageComponent implements OnInit {
  private readonly membershipApi = inject(MembershipService);
  private readonly toast = inject(ToastMessagesService);
  readonly plans = signal<MembershipPlan[]>([]);
  readonly loading = signal(false);

  ngOnInit() { this.loadPlans(); }

  loadPlans() {
    this.loading.set(true);
    this.membershipApi.getAllPlans()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.plans.set(data),
        error: (err) => this.toast.showApiError(err, 'Falha ao carregar')
      });
  }

  deletePlan(id: string) {
    if (!confirm('Deseja realmente excluir este plano?')) return;
    this.loading.set(true);
    this.membershipApi.deletePlan(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toast.showSuccess('Sucesso!', 'Plano removido');
          this.loadPlans();
        },
        error: (err) => this.toast.showApiError(err, 'Falha ao excluir')
      });
  }
}
