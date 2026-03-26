import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MembershipService, MembershipPlan } from '../../../../shared/master-bypass-v2';
import { finalize } from 'rxjs';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-admin-plan-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4">
      <header class="flex items-center gap-4 mb-8">
        <button 
          routerLink="/admin/socio/planos"
          class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">{{ isEdit ? 'Editar Plano' : 'Novo Plano' }}</h1>
          <p class="text-slate-500 font-medium">Configure os detalhes do plano de sócio.</p>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-8">
        <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2 space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">Nome do Plano</label>
              <input type="text" formControlName="name" class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold">
            </div>
            <div class="md:col-span-2 space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">Slug (URL Amigável)</label>
              <input type="text" formControlName="slug" class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-base font-bold text-indigo-600">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">A URL será: /socio/assinar/{{ form.get('slug')?.value || 'nome-do-plano' }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">Preço (R$)</label>
              <input type="number" formControlName="price" class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold">
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">Intervalo de Cobrança</label>
              <select formControlName="interval" class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-base font-bold">
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">Status</label>
              <select formControlName="isActive" class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-base font-bold">
                <option [ngValue]="true">Ativo</option>
                <option [ngValue]="false">Inativo</option>
              </select>
            </div>
            <div class="md:col-span-2 space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">Descrição Curta</label>
              <textarea formControlName="description" rows="3" class="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-base font-medium resize-none"></textarea>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black uppercase tracking-widest text-slate-400">Benefícios do Plano</h2>
            <button type="button" (click)="addBenefit()" class="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Adicionar</button>
          </div>
          
          <div formArrayName="benefits" class="space-y-3">
            @for (control of benefits.controls; track control; let i = $index) {
              <div class="flex gap-2">
                <input [formControlName]="i" type="text" class="flex-1 px-5 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold">
                <button type="button" (click)="removeBenefit(i)" class="p-3 text-slate-300 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button routerLink="/admin/socio/planos" type="button" class="px-8 py-3 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all">Cancelar</button>
          <button type="submit" [disabled]="form.invalid || loading()" class="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center">
            @if (loading()) { <app-spinner class="mr-2" /> }
            {{ isEdit ? 'Salvar Alterações' : 'Criar Plano' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class AdminPlanEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly membershipApi = inject(MembershipService);
  private readonly toast = inject(ToastMessagesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form: FormGroup;
  readonly loading = signal(false);
  isEdit = false;
  planId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      interval: ['monthly', Validators.required],
      isActive: [true],
      benefits: this.fb.array([])
    });

    // Auto-slug logic
    this.form.get('name')?.valueChanges.subscribe(name => {
      if (!this.isEdit && name) {
        const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        this.form.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  get benefits() { return this.form.get('benefits') as FormArray; }

  ngOnInit() {
    this.planId = this.route.snapshot.paramMap.get('id');
    if (this.planId && this.planId !== 'new') {
      this.isEdit = true;
      this.loadPlan();
    } else {
      this.addBenefit();
    }
  }

  loadPlan() {
    if (!this.planId) return;
    this.loading.set(true);
    this.membershipApi.getPlan(this.planId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (plan) => {
          this.form.patchValue({
            name: plan.name,
            slug: plan.slug,
            description: plan.description,
            price: plan.price,
            interval: plan.interval,
            isActive: plan.isActive
          });
          while (this.benefits.length) this.benefits.removeAt(0);
          plan.benefits.forEach(b => this.addBenefit(b));
        },
        error: (err) => {
          this.toast.showApiError(err, 'Erro ao carregar');
          this.router.navigate(['/admin/socio/planos']);
        }
      });
  }

  addBenefit(value = '') {
    this.benefits.push(this.fb.control(value, Validators.required));
  }

  removeBenefit(index: number) {
    this.benefits.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    const payload = this.form.value;
    const request = this.isEdit && this.planId 
      ? this.membershipApi.updatePlan(this.planId, payload) 
      : this.membershipApi.createPlan(payload);

    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.toast.showSuccess('Sucesso!', 'Plano salvo com sucesso');
        this.router.navigate(['/admin/socio/planos']);
      },
      error: (err) => this.toast.showApiError(err, 'Erro ao salvar')
    });
  }
}
