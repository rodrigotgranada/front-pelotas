import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipService, MembershipPlan } from '../../../../shared/master-bypass-v2';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';
import { AuthSessionService } from '../../../../core/auth/auth-session.service';
import { MembershipInterestApiService } from '../../../../core/services/membership-interest-api.service';
import { FormsModule } from '@angular/forms';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-membership-landing-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, FormsModule],
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
        } @else if (!selectedPlan()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            @for (plan of plans(); track plan.id) {
              <div class="flex flex-col bg-slate-50 rounded-[32px] p-10 border border-slate-100 hover:border-indigo-300 transition-all hover:shadow-2xl hover:-translate-y-1 group">
                <h3 class="text-2xl font-black text-slate-900 mb-2">{{ plan.name }}</h3>
                <p class="text-slate-500 mb-6 font-medium leading-relaxed">{{ plan.description }}</p>
                <div class="text-4xl font-black text-indigo-600 mb-8">
                  R$ {{ plan.price }}<span class="text-sm text-slate-400 uppercase tracking-widest font-bold ml-1">/mês</span>
                </div>
                <ul class="space-y-4 mb-10 flex-1">
                  @for (benefit of plan.benefits; track benefit) {
                    <li class="flex items-start text-sm font-bold text-slate-600">
                      <svg class="w-5 h-5 text-emerald-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                      {{ benefit }}
                    </li>
                  }
                </ul>
                <button 
                  (click)="selectPlan(plan)"
                  class="block w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  TENHO INTERESSE
                </button>
              </div>
            }
          </div>
        } @else {
          <!-- Form Section -->
          <div class="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button (click)="selectedPlan.set(null)" class="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Voltar aos planos
            </button>

            <div class="bg-white rounded-[40px] border border-slate-200 p-8 md:p-12 shadow-2xl relative overflow-hidden">
               <div class="absolute top-0 right-0 p-8 opacity-5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.35C17.25 23.15 21 18.25 21 13V7L12 2Z"/></svg>
               </div>

               <h2 class="text-3xl font-black text-slate-900 mb-2">Solicitar Adesão</h2>
               <p class="text-slate-500 font-medium mb-8">Você escolheu o plano <span class="text-indigo-600 font-black">{{ selectedPlan()?.name }}</span>. Preencha seus dados e nossa equipe entrará em contato via WhatsApp.</p>

               <form (submit)="onSubmit($event)" class="space-y-5">
                  <div class="space-y-1.5">
                    <label class="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                    <input 
                      type="text" name="name" [(ngModel)]="formData.name" required
                      placeholder="Como podemos te chamar?"
                      class="w-full bg-slate-100 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
                    <input 
                      type="email" name="email" [(ngModel)]="formData.email" required auto-complete="email"
                      placeholder="seu@email.com"
                      class="w-full bg-slate-100 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp / Telefone</label>
                    <input 
                      type="tel" name="phone" [(ngModel)]="formData.phone" required
                      placeholder="(00) 00000-0000"
                      class="w-full bg-slate-100 border-none rounded-2xl py-4 px-6 font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    [disabled]="submitting()"
                    class="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    @if (submitting()) {
                      <app-spinner size="sm" />
                      ENVIANDO...
                    } @else {
                      ENVIAR SOLICITAÇÃO
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7 7 7-7"/><path d="M12 19V5"/></svg>
                    }
                  </button>
               </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class MembershipLandingPageComponent implements OnInit {
  private readonly membershipApi = inject(MembershipService);
  private readonly interestApi = inject(MembershipInterestApiService);
  private readonly session = inject(AuthSessionService);
  private readonly toast = inject(ToastMessagesService);

  readonly plans = signal<MembershipPlan[]>([]);
  readonly loading = signal(false);
  readonly selectedPlan = signal<MembershipPlan | null>(null);
  readonly submitting = signal(false);

  formData = {
    name: '',
    email: '',
    phone: '',
  };

  ngOnInit() { 
    this.loadPlans(); 
  }

  loadPlans() {
    this.loading.set(true);
    this.membershipApi.getPlans()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.plans.set(data),
        error: (err) => console.error('Error loading plans', err)
      });
  }

  selectPlan(plan: MembershipPlan) {
    this.selectedPlan.set(plan);
    const me = this.session.me();
    if (me) {
      this.formData.name = `${me.firstName ?? ''} ${me.lastName ?? ''}`.trim();
      this.formData.email = me.email ?? '';
    }
  }

  onSubmit(e: Event) {
    e.preventDefault();
    if (this.submitting() || !this.selectedPlan()) return;

    this.submitting.set(true);
    this.interestApi.create({
      ...this.formData,
      planId: this.selectedPlan()!.id,
      userId: this.session.me()?.id,
    }).subscribe({
      next: () => {
        this.toast.showSuccess('Solicitação enviada! Entraremos em contato em breve.');
        this.selectedPlan.set(null);
        this.formData = { name: '', email: '', phone: '' };
        this.submitting.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao enviar solicitação. Tente novamente.');
        this.submitting.set(false);
      }
    });
  }
}
