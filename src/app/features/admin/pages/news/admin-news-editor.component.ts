import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import List from '@editorjs/list';

import { NewsApiService } from '../../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { AuthTokenService } from '../../../../core/auth/auth-token.service';
import { environment } from '../../../../../environments/environment';
import { News } from '../../../../core/models/news.model';
import { ImageCropperDialogComponent } from '../../../../shared/ui/image-cropper/image-cropper-dialog.component';

@Component({
  selector: 'app-admin-news-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, QuillModule, ImageCropperDialogComponent],
  template: `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/news" class="text-slate-500 hover:text-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">{{ isNew() ? 'Nova Matéria' : 'Editar Matéria' }}</h1>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-300"
            (click)="togglePreview()"
          >
            Ver Prévia (Simulador Mobile)
          </button>
          <button
            type="button"
            class="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 disabled:opacity-50"
            (click)="save('PUBLISHED')"
            [disabled]="loading()"
          >
            {{ currentStatus() === 'PUBLISHED' ? 'Atualizar Publicação' : 'Publicar' }}
          </button>
          <button
            type="button"
            [class]="currentStatus() === 'PUBLISHED' ? 'rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition-all hover:bg-amber-200 disabled:opacity-50' : 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50'"
            (click)="save('DRAFT')"
            [disabled]="loading()"
          >
            {{ currentStatus() === 'PUBLISHED' ? 'Despublicar (Mover p/ Rascunho)' : 'Salvar Rascunho' }}
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="flex flex-col gap-6">
        @if (isNew()) {
          <div class="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <p class="text-sm font-semibold text-indigo-900 mb-3">Escolha como deseja escrever esta matéria:</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-3 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-all flex-1">
                <input type="radio" formControlName="format" value="BLOCKS" class="text-indigo-600 focus:ring-indigo-600 h-4 w-4">
                <div>
                  <p class="font-bold text-slate-900 text-sm">Modo Moderno (Blocos)</p>
                  <p class="text-xs text-slate-500">Ideal para matérias dinâmicas, galerias e embelezamento no site público.</p>
                </div>
              </label>
              
              <label class="flex items-center gap-2 cursor-pointer bg-white px-4 py-3 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-all flex-1">
                <input type="radio" formControlName="format" value="HTML" class="text-indigo-600 focus:ring-indigo-600 h-4 w-4">
                <div>
                  <p class="font-bold text-slate-900 text-sm">Modo Clássico (Word)</p>
                  <p class="text-xs text-slate-500">Editor tradicional simples com barra de formatação no topo.</p>
                </div>
              </label>
            </div>
            <p class="text-xs text-indigo-600 mt-3 font-medium">Atenção: Não é possível alternar os modos livremente após salvar pela primeira vez.</p>
          </div>
        }

        <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-6 mb-2">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Destaque na Página Inicial</h3>
              <p class="text-xs text-slate-500">Ao marcar como destaque, essa notícia aparecerá nos quadros principais (Estilo Globo Esporte)</p>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" formControlName="isFeatured" class="peer sr-only">
              <div class="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300"></div>
            </label>
          </div>

          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <div>
                <label class="mb-1 block text-sm font-semibold text-slate-700">Título da Matéria</label>
                <input type="text" formControlName="title" class="w-full rounded-lg border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 text-xl font-bold py-3" placeholder="Escreva uma chamada forte e atrativa...">
              </div>
              <div class="mt-4">
                <label class="mb-1 block text-sm font-semibold text-slate-700">Subtítulo (Opcional)</label>
                <input type="text" formControlName="subtitle" class="w-full rounded-lg border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Linha fina, resumo ou apoio">
              </div>
            </div>

            <!-- Capa Upload -->
            <div class="w-full md:w-80 shrink-0">
              <label class="mb-1 block text-sm font-semibold text-slate-700">Capa da Matéria</label>
              @if (form.value.coverImageUrl) {
                <div class="relative w-full rounded-xl overflow-hidden border border-slate-200 group">
                  <img [src]="form.value.coverImageUrl" class="w-full h-40 object-cover" />
                  <button type="button" (click)="removeCover()" class="absolute top-2 right-2 bg-slate-900/50 text-white rounded-full p-2 hover:bg-rose-600 transition opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              } @else {
                <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-8 h-8 mb-2 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p class="mb-1 text-xs text-slate-500"><span class="font-semibold">Clique para enviar a Capa</span></p>
                    <p class="text-[10px] text-slate-500">WEBP, PNG, JPG</p>
                  </div>
                  <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onCoverSelected($event)" />
                </label>
              }
            </div>
          </div>

          <!-- Metadata Panel -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <label class="mb-1 block text-sm font-semibold text-slate-700">Autor / Pseudônimo (Opcional)</label>
              <input type="text" formControlName="authorDisplayName" class="w-full rounded-lg border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500" placeholder="Ex: Redação Pelotas">
              <p class="text-xs text-slate-500 mt-1">Se preenchido, oculta seu nome verdadeiro na visualização da página.</p>
            </div>
            
            <div>
              <label class="mb-2 block text-sm font-semibold text-slate-700">Categorias da Matéria</label>
              <div class="flex flex-wrap gap-2">
                @for (cat of availableCategories; track cat) {
                  <label class="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:border-indigo-300 transition">
                    <input type="checkbox" class="text-indigo-600 rounded focus:ring-indigo-500 w-4 h-4" 
                           [checked]="hasCategory(cat)"
                           (change)="toggleCategory(cat)">
                    <span class="text-sm text-slate-700 font-medium">{{ cat }}</span>
                  </label>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm min-h-[500px]">
          @if (form.value.format === 'HTML') {
            <!-- Quill Editor (Word Like) -->
            <quill-editor formControlName="contentHtml" [styles]="{height: '400px'}"></quill-editor>
          } @else {
            <!-- Editor.js (Block Like) -->
            <div id="editorjs" class="prose max-w-none"></div>
          }
        </div>
      </form>
    </div>

    <!-- Drawer de Preview -->
    @if (showPreview()) {
      <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900/60 transition-opacity" aria-hidden="true" (click)="togglePreview()"></div>

          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div class="pointer-events-auto w-screen max-w-2xl transform transition-transform shadow-2xl">
              <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                <div class="px-4 sm:px-6">
                  <div class="flex items-start justify-between">
                    <h2 class="text-base font-semibold leading-6 text-slate-900" id="slide-over-title">Prévia da Matéria (Mobile Simulator)</h2>
                    <div class="ml-3 flex h-7 items-center">
                      <button type="button" class="relative rounded-md bg-white text-slate-400 hover:text-slate-500" (click)="togglePreview()">
                        <span class="absolute -inset-2.5"></span><span class="sr-only">Fechar painel</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="relative mt-6 flex-1 px-4 sm:px-6 bg-slate-100 flex justify-center py-8">
                  <div class="bg-white w-[375px] min-h-[667px] shadow-sm rounded-3xl border-8 border-slate-900 overflow-hidden flex flex-col items-stretch relative">
                    <div class="h-6 w-full bg-slate-900 rounded-t-lg"></div>
                    <div class="p-5 flex-1 overflow-y-auto">
                        <h1 class="text-2xl font-black text-slate-900 leading-tight">{{ form.value.title || 'Título da Matéria' }}</h1>
                        @if (form.value.subtitle) {
                          <p class="mt-2 text-sm text-slate-500 font-medium">{{ form.value.subtitle }}</p>
                        }
                        <div class="mt-5 mb-5 border-t border-slate-200"></div>

                        <div class="prose prose-sm max-w-none break-words">
                          @if (previewLoading()) {
                            <p class="text-center text-slate-400 text-xs py-10">Gerando prévia...</p>
                          } @else {
                            <div [innerHTML]="previewBlocksHtml()"></div>
                          }
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Image Cropper Dialog -->
    @if (imageSelectedEvent()) {
      <app-image-cropper-dialog
        [imageChangedEvent]="imageSelectedEvent()!"
        [aspectRatio]="1.777"
        [maintainAspectRatio]="true"
        [resizeToWidth]="800"
        [roundCropper]="false"
        (imageCroppedEvent)="onImageCropped($event)"
        (cancel)="onCropCancel()"
      ></app-image-cropper-dialog>
    }
  `,
  styles: [`
    :host { display: block; }
    .ce-block__content { max-width: 100%; } /* Overrides native Editor.js constraint */
  `]
})
export class AdminNewsEditorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly tokenService = inject(AuthTokenService);

  readonly isNew = signal(true);
  readonly loading = signal(false);
  readonly showPreview = signal(false);
  readonly previewLoading = signal(false);
  readonly previewBlocksHtml = signal('');
  readonly currentStatus = signal<string>('DRAFT');
  readonly imageSelectedEvent = signal<Event | null>(null);

  readonly availableCategories = [
    'Futebol Profissional',
    'Futebol Feminino',
    'Futebol de Base',
    'Matérias Especiais',
    'Notas Oficiais',
    'Ações Sociais',
    'Loba'
  ];
  
  private newsId: string | null = null;
  private editorJs: EditorJS | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    subtitle: [''],
    format: ['BLOCKS', Validators.required],
    contentHtml: [''],
    coverImageUrl: [null as string | null],
    isFeatured: [false],
    authorDisplayName: [''],
    categories: [[] as string[]]
  });

  ngOnInit() {
    this.newsId = this.route.snapshot.paramMap.get('id');
    
    if (this.newsId && this.newsId !== 'new') {
      this.isNew.set(false);
      this.form.get('format')?.disable(); // Lock the format
      this.loadNews();
    } else {
      setTimeout(() => this.initEditorJs(), 100);
      
      this.form.get('format')?.valueChanges.subscribe(format => {
        if (format === 'BLOCKS') {
          setTimeout(() => this.initEditorJs(), 100);
        } else {
          this.destroyEditorJs();
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroyEditorJs();
  }

  private initEditorJs(initialData?: any) {
    if (this.editorJs) return;
    
    const token = this.tokenService.getToken() || '';

    this.editorJs = new EditorJS({
      holder: 'editorjs',
      placeholder: 'Clique aqui e comece a escrever... (Use / para adicionar imagens ou listas)',
      data: initialData || {},
      tools: {
        header: Header,
        list: List,
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: `${environment.apiBaseUrl}/news/upload-image`,
            },
            additionalRequestHeaders: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      }
    });
  }

  private destroyEditorJs() {
    if (this.editorJs) {
      if (typeof this.editorJs.destroy === 'function') {
        try { this.editorJs.destroy(); } catch (e) {}
      }
      this.editorJs = null;
    }
  }

  private loadNews() {
    if (!this.newsId) return;
    this.loading.set(true);
    
    this.newsApi.findOne(this.newsId).subscribe({
      next: (news: News) => {
        this.form.patchValue({
          title: news.title,
          subtitle: news.subtitle,
          format: news.format,
          coverImageUrl: news.coverImageUrl || null,
          isFeatured: news.isFeatured,
          authorDisplayName: news.authorDisplayName || '',
          categories: news.categories || []
        });
        
        this.currentStatus.set(news.status || 'DRAFT');

        if (news.format === 'HTML') {
          this.form.patchValue({ contentHtml: news.content });
        } else {
          setTimeout(() => this.initEditorJs(news.content), 100);
        }
        
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao carregar matéria');
        this.loading.set(false);
        this.router.navigate(['/admin/news']);
      }
    });
  }

  async save(status: 'DRAFT' | 'PUBLISHED') {
    const rawTitle = this.form.value.title?.trim() || '';

    if (status === 'PUBLISHED' && !rawTitle) {
      this.toast.showWarning('O título é obrigatório para publicar a matéria.');
      return;
    }

    this.loading.set(true);
    const format = this.form.getRawValue().format; // Raw to get disabled format
    let content: any = null;

    if (format === 'HTML') {
      content = this.form.value.contentHtml;
      if (status === 'PUBLISHED' && (!content || String(content).trim() === '')) {
        this.toast.showWarning('O conteúdo da matéria não pode estar vazio para publicar.');
        this.loading.set(false);
        return;
      }
    } else {
      if (!this.editorJs) {
        this.loading.set(false);
        return;
      }
      const outputData: any = await this.editorJs.save();
      if (status === 'PUBLISHED' && (!outputData.blocks || outputData.blocks.length === 0)) {
        this.toast.showWarning('O conteúdo da matéria não pode estar vazio para publicar.');
        this.loading.set(false);
        return;
      }
      content = outputData || { blocks: [] };
    }

    const payload = {
      title: rawTitle || 'Rascunho sem título',
      subtitle: this.form.value.subtitle || undefined,
      format: format as 'HTML' | 'BLOCKS',
      content,
      coverImageUrl: this.form.value.coverImageUrl || undefined,
      isFeatured: this.form.value.isFeatured || false,
      authorDisplayName: this.form.value.authorDisplayName || undefined,
      categories: this.form.value.categories || [],
      status
    };

    const request = this.isNew() 
      ? this.newsApi.create(payload)
      : this.newsApi.update(this.newsId!, payload);

    request.subscribe({
      next: () => {
        this.toast.showSuccess(status === 'PUBLISHED' ? 'Matéria publicada!' : 'Rascunho salvo!');
        this.router.navigate(['/admin/news']);
      },
      error: () => {
        this.toast.showError('Erro ao salvar a matéria.');
        this.loading.set(false);
      }
    });
  }

  async togglePreview() {
    if (this.showPreview()) {
      this.showPreview.set(false);
      return;
    }
    
    this.previewLoading.set(true);
    this.showPreview.set(true);

    if (this.form.value.format === 'HTML') {
      this.previewBlocksHtml.set(this.form.value.contentHtml || '<p class="text-slate-400">Conteúdo vazio</p>');
      this.previewLoading.set(false);
    } else {
      if (!this.editorJs) {
        this.previewLoading.set(false);
        return;
      }
      try {
        const outputData: any = await this.editorJs.save();
        let html = '';
        if (outputData.blocks) {
          for (const block of outputData.blocks) {
            switch (block.type) {
              case 'header':
                html += `<h${block.data.level} class="font-bold text-slate-900 mt-5 mb-2">${block.data.text}</h${block.data.level}>`;
                break;
              case 'paragraph':
                html += `<p class="mb-4">${block.data.text}</p>`;
                break;
              case 'image':
                html += `<figure class="my-5"><img src="${block.data.file.url}" class="rounded-xl w-full object-cover border border-slate-100"><figcaption class="text-xs text-center text-slate-500 mt-2">${block.data.caption || ''}</figcaption></figure>`;
                break;
              case 'list':
                const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                const classlist = block.data.style === 'ordered' ? 'list-decimal pl-5' : 'list-disc pl-5';
                html += `<${tag} class="${classlist} mb-4 text-slate-800">`;
                block.data.items.forEach((li: string) => { html += `<li class="mb-1">${li}</li>`; });
                html += `</${tag}>`;
                break;
            }
          }
        }
        this.previewBlocksHtml.set(html || '<p class="text-slate-400">Conteúdo vazio</p>');
      } catch (e) {
        this.previewBlocksHtml.set('<p class="text-red-500">Erro ao gerar prévia.</p>');
      }
      this.previewLoading.set(false);
    }
  }

  onCoverSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageSelectedEvent.set(event);
  }

  onImageCropped(blob: Blob) {
    this.imageSelectedEvent.set(null);
    this.loading.set(true);
    
    const ext = blob.type === 'image/jpeg' ? 'jpg' : (blob.type.split('/')[1] || 'png');
    const file = new File([blob], `cover.${ext}`, { type: blob.type || 'image/png' });

    this.newsApi.uploadImage(file).subscribe({
      next: (res) => {
        if (res.success && res.file?.url) {
          this.form.patchValue({ coverImageUrl: res.file.url });
        }
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao enviar imagem de capa. Pode ser muito grande.');
        this.loading.set(false);
      }
    });
  }

  onCropCancel() {
    this.imageSelectedEvent.set(null);
  }

  removeCover() {
    this.form.patchValue({ coverImageUrl: null });
  }

  hasCategory(cat: string): boolean {
    return this.form.value.categories?.includes(cat) || false;
  }

  toggleCategory(cat: string) {
    const current = new Set(this.form.value.categories || []);
    if (current.has(cat)) {
      current.delete(cat);
    } else {
      current.add(cat);
    }
    this.form.patchValue({ categories: Array.from(current) });
  }
}
