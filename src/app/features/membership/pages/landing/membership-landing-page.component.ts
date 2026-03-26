import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MembershipService, MembershipPlan } from '../../../../shared/master-bypass-v2';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-membership-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  template: `
    <div class="min-h-screen bg-white">
      <header class="relative py-24 bg-slate-900 overflow-hidden">
        <div class="absolute inset-0 bg-slate-800 opacity-20"></div>
        <div class="relative max-w-7xl mx-auto px-4 text-center">
          <h1 class="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">SEJA <span class="text-indigo-400">SÓCIO</span></h1>
          <p class="text-xl text-slate-300 max-w-2xl mx-auto font-medium">Faça parte da história do E.C. Pelotas e aproveite benefícios exclusivos enquanto ajuda o seu clube do coração a crescer.</p>
        </div>
      </header>
      
      <div class="py-24 max-w-7xl mx-auto px-4">
        @if (loading()) { 
          <div class="flex justify-center py-20"><app-spinner /></div> 
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (plan of plans(); track plan.id) {
              <div class="flex flex-col bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-2xl">
                <h3 class="text-2xl font-black text-slate-900 mb-2">{{ plan.name }}</h3>
                <p class="text-slate-500 mb-6 font-medium">{{ plan.description }}</p>
                <div class="text-4xl font-black text-indigo-600 mb-8">R$ {{ plan.price }}<span class="text-sm text-slate-400 uppercase tracking-widest font-bold">/mês</span></div>
                <ul class="space-y-4 mb-10 flex-1">
                  @for (benefit of plan.benefits; track benefit) {
                    <li class="flex items-center text-sm font-bold text-slate-600">
                      <svg class="w-5 h-5 text-emerald-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                      {{ benefit }}
                    </li>
                  }
                </ul>
                <a [routerLink]="['adesao', plan.id]" class="block text-center py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg">ASSINAR AGORA</a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class MembershipLandingPageComponent implements OnInit {
  private readonly membershipApi = inject(MembershipService);
  readonly plans = signal<MembershipPlan[]>([]);
  readonly loading = signal(false);

  ngOnInit() { this.loadPlans(); }

  loadPlans() {
    this.loading.set(true);
    this.membershipApi.getPlans()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.plans.set(data),
        error: (err) => console.error('Error loading plans', err)
      });
  }
}
