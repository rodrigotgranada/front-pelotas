import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import List from '@editorjs/list';

import { HistoryApiService } from '../../../../core/services/history-api.service';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { environment } from '../../../../../environments/environment';
import { History } from '../../../../core/models/history.model';
import { ImageCropperDialogComponent } from '../../../../shared/ui/image-cropper/image-cropper-dialog.component';
import { compressImage } from '../../../../shared/utils/image-compress.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-history-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ImageCropperDialogComponent],
  template: `
    <div class="flex flex-col gap-6 max-w-4xl mx-auto pb-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/historia" class="text-slate-500 hover:text-slate-900 border border-slate-200 p-2 rounded-xl bg-white shadow-sm transition hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">{{ isNew() ? 'Nova Seção Histórica' : 'Editar Seção' }}</h1>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50 active:scale-95 flex items-center gap-2"
            (click)="save()"
            [disabled]="loading()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            Salvar
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="flex flex-col gap-6">
        <div class="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1 space-y-4">
              <div>
                <label class="mb-1.5 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Título da Seção</label>
                <input type="text" formControlName="title" class="w-full rounded-2xl border-slate-200 text-slate-900 font-black focus:border-indigo-500 focus:ring-0 py-3 px-5 transition-all border-2" placeholder="Ex: A Fundação (1908)">
              </div>
              
              <div class="flex items-center gap-6 pt-2">
                 <div class="flex items-center gap-3">
                    <label class="text-xs font-black text-slate-900 uppercase tracking-tighter">Visível no Portal</label>
                    <label class="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" formControlName="isActive" class="peer sr-only">
                      <div class="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none ring-offset-2 peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
                    </label>
                 </div>
              </div>
            </div>

            <!-- Cover Image -->
            <div class="w-full md:w-64 shrink-0">
               <label class="mb-1.5 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Imagem de Capa (16:9)</label>
               @if (form.value.coverImageUrl) {
                <div class="relative w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl group aspect-video">
                  <img [src]="form.value.coverImageUrl" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" (click)="removeCover()" class="bg-white text-rose-600 rounded-xl p-3 shadow-lg hover:scale-110 active:scale-95 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              } @else {
                <label class="flex flex-col items-center justify-center w-full aspect-video border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all hover:shadow-lg group">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="h-8 w-8 text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <p class="text-[10px] font-black text-slate-400 uppercase">Enviar Capa</p>
                  </div>
                  <input type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)" />
                </label>
              }
            </div>
          </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm min-h-[500px]">
           <label class="mb-4 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Conteúdo da História</label>
           <div id="editorjs" class="prose max-w-none prose-slate"></div>
        </div>
      </form>
    </div>

    @if (imageSelectedEvent()) {
      <app-image-cropper-dialog
        [imageChangedEvent]="imageSelectedEvent()!"
        [aspectRatio]="1.777"
        [maintainAspectRatio]="true"
        [resizeToWidth]="1200"
        (imageCroppedEvent)="onImageCropped($event)"
        (cancel)="onCropCancel()"
      ></app-image-cropper-dialog>
    }
  `,
  styles: [`
    :host { display: block; }
    .ce-block__content { max-width: 100%; }
  `]
})
export class AdminHistoryEditorComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly historyApi = inject(HistoryApiService);
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly isNew = signal<boolean>(true);
  readonly loading = signal<boolean>(false);
  private editor?: EditorJS;
  
  readonly imageSelectedEvent = signal<Event | null>(null);
  private fileInputElement: HTMLInputElement | null = null;
  private pendingCoverBlob: Blob | null = null;

  readonly form = this.fb.group({
    title: ['', [Validators.required]],
    slug: [''],
    coverImageUrl: [null as string | null],
    isActive: [true],
    format: ['BLOCKS' as 'HTML' | 'BLOCKS']
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isNew.set(false);
        this.loadSection(id);
      } else {
        this.initEditor();
      }
    });
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  private async initEditor(data?: any) {
    // Always destroy previous instance before creating a new one
    if (this.editor) {
      await this.editor.destroy();
      this.editor = undefined;
    }
    // Small delay to ensure the DOM is ready after destroy
    await new Promise(resolve => setTimeout(resolve, 50));
    this.editor = new EditorJS({
      holder: 'editorjs',
      placeholder: 'Conte a história deste período aqui...',
      tools: {
        header: { class: Header as any, shortcut: 'CMD+SHIFT+H' },
        list: { class: List as any, inlineToolbar: true },
        image: {
          class: ImageTool as any,
          config: {
            endpoints: {
              byFile: `${environment.apiBaseUrl}/uploads/news`,
            },
            additionalRequestHeaders: {
               'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          }
        }
      },
      data: data || {},
      minHeight: 300
    });
  }

  private loadSection(id: string) {
    this.loading.set(true);
    this.historyApi.getByIdOrSlug(id).subscribe({
      next: (data: History) => {
        this.form.patchValue({
          title: data.title,
          slug: data.slug,
          coverImageUrl: data.coverImageUrl,
          isActive: data.isActive,
          format: data.format
        });
        
        if (data.format === 'BLOCKS') {
          this.initEditor(data.content);
        } else {
          this.initEditor();
        }
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Não foi possível carregar os dados da seção.');
        this.router.navigate(['/admin/historia']);
      }
    });
  }

  onFileSelected(event: any) {
    this.imageSelectedEvent.set(event);
    this.fileInputElement = event.target;
    // NOTE: do NOT reset input.value here — the cropper reads files from the event.
    // The reset happens in onImageCropped / onCropCancel after the crop is done.
  }

  onImageCropped(file: Blob) {
    this.imageSelectedEvent.set(null);
    if (this.fileInputElement) {
      this.fileInputElement.value = '';
      this.fileInputElement = null;
    }
    // Use createObjectURL (synchronous, inside Angular zone) so the template
    // updates immediately without needing a FileReader async callback
    const objectUrl = URL.createObjectURL(file);
    this.form.patchValue({ coverImageUrl: objectUrl });
    // Store the blob for actual uploading on save
    this.pendingCoverBlob = file;
  }

  onCropCancel() {
    this.imageSelectedEvent.set(null);
    if (this.fileInputElement) {
      this.fileInputElement.value = '';
      this.fileInputElement = null;
    }
  }

  removeCover() {
    this.form.patchValue({ coverImageUrl: null });
  }

  async save() {
    if (this.form.invalid) {
      this.toast.showWarning('Preencha os campos obrigatórios.');
      return;
    }

    this.loading.set(true);
    const id = this.route.snapshot.paramMap.get('id');

    // If a new cover image was cropped, upload it first
    if (this.pendingCoverBlob) {
      try {
        const compressed = await compressImage(this.pendingCoverBlob, 1280, 720, 0.85);
        const file = new File([compressed], 'cover.jpg', { type: 'image/jpeg' });
        const res: any = await firstValueFrom(this.newsApi.uploadImage(file));
        if (res.success && res.file?.url) {
          this.form.patchValue({ coverImageUrl: res.file.url });
          // Release the old blob URL
          URL.revokeObjectURL(this.form.value.coverImageUrl || '');
        }
      } catch {
        this.toast.showError('Erro ao fazer upload da capa.');
        this.loading.set(false);
        return;
      }
      this.pendingCoverBlob = null;
    }

    const editorData = await this.editor?.save();
    const payload = {
      ...this.form.value,
      content: editorData
    };

    const obs = id 
      ? this.historyApi.update(id, payload as any)
      : this.historyApi.create(payload as any);

    obs.subscribe({
      next: (res: History) => {
        this.toast.showSuccess(`Seção histórica ${id ? 'atualizada' : 'criada'} com sucesso!`);
        this.router.navigate(['/admin/historia']);
      },
      error: () => {
        this.toast.showError('Erro ao salvar seção histórica.');
        this.loading.set(false);
      }
    });
  }
}
