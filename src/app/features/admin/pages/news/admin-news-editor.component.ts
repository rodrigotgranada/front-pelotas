import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-news-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="max-w-4xl mx-auto">
      <header class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900">{{ isEdit ? 'Editar Matéria' : 'Nova Matéria' }}</h1>
          <p class="text-slate-500">Preencha as informações para publicar no portal.</p>
        </div>
        <button 
          routerLink="/admin/news"
          class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Cancelar
        </button>
      </header>
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-widest text-slate-400">Título da Matéria</label>
            <input type="text" formControlName="title" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-lg font-bold placeholder:text-slate-300 transition-all">
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black uppercase tracking-widest text-slate-400">Conteúdo</label>
            <textarea formControlName="content" rows="10" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-base font-medium transition-all resize-none"></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">URL da Imagem de Capa</label>
              <input type="text" formControlName="coverImageUrl" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold transition-all">
            </div>
            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-400">Categorias (separadas por vírgula)</label>
              <input type="text" formControlName="categoriesString" class="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold transition-all">
            </div>
          </div>
          <div class="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-4">
               <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" formControlName="isFeatured" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-indigo-600"></div>
                <span class="ms-3 text-sm font-bold text-slate-600">Destaque</span>
              </label>
            </div>
            <div class="flex gap-3">
              <button type="button" (click)="onSaveDraft()" [disabled]="loading()" class="px-6 py-3 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50">Salvar Rascunho</button>
              <button type="submit" [disabled]="form.invalid || loading()" class="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center">
                @if (loading()) { <app-spinner class="mr-2" /> }
                {{ isEdit ? 'Atualizar' : 'Publicar' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AdminNewsEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly form: FormGroup;
  readonly loading = signal(false);
  isEdit = false;
  newsId: string | null = null;
  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required]],
      coverImageUrl: [''],
      categoriesString: [''],
      isFeatured: [false],
      status: ['PUBLISHED']
    });
  }
  ngOnInit() {
    this.newsId = this.route.snapshot.paramMap.get('id');
    if (this.newsId && this.newsId !== 'new') {
      this.isEdit = true;
      this.loadNews();
    }
  }
  loadNews() {
    if (!this.newsId) return;
    this.loading.set(true);
    this.newsApi.findOne(this.newsId).subscribe({
      next: (news) => {
        this.form.patchValue({
          title: news.title,
          content: news.content,
          coverImageUrl: news.coverImageUrl,
          categoriesString: news.categories?.join(', '),
          isFeatured: news.isFeatured,
          status: news.status
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.showApiError(err, 'Falha ao carregar');
        this.router.navigate(['/admin/news']);
      }
    });
  }
  onSubmit() {
    if (this.form.invalid) return;
    const rawValue = this.form.getRawValue();
    const categories = rawValue.categoriesString.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    const payload = { ...rawValue, categories, status: 'PUBLISHED' };
    delete payload.categoriesString;
    this.save(payload);
  }
  onSaveDraft() {
    const rawValue = this.form.getRawValue();
    const categories = rawValue.categoriesString.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    const payload = { ...rawValue, categories, status: 'DRAFT' };
    delete payload.categoriesString;
    this.save(payload);
  }
  private save(payload: any) {
    this.loading.set(true);
    const request = this.isEdit && this.newsId ? this.newsApi.update(this.newsId, payload) : this.newsApi.create(payload);
    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.toast.showSuccess('Sucesso!', 'Salvo');
        this.router.navigate(['/admin/news']);
      },
      error: (err) => this.toast.showApiError(err, 'Erro ao salvar')
    });
  }
}
