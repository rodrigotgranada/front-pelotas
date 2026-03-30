import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sponsor } from '../../../../../core/models/sponsor.model';
import { SponsorsService } from '../../../../../core/services/sponsors.service';
import { NewsApiService } from '../../../../../core/services/news-api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-create-sponsor-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-slate-900/60 transition-opacity" aria-hidden="true" (click)="close.emit()"></div>

        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div class="pointer-events-auto w-screen max-w-md transform transition-transform shadow-2xl">
            <div class="flex h-full flex-col overflow-y-auto bg-white py-6 shadow-xl relative">
              <div class="px-4 sm:px-6 border-b border-slate-100 pb-4">
                <div class="flex items-start justify-between">
                  <h2 class="text-base font-bold leading-6 text-slate-900" id="slide-over-title">
                    {{ sponsorToEdit ? 'Editar Patrocinador' : 'Novo Patrocinador' }}
                  </h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button type="button" class="relative rounded-md bg-white text-slate-400 hover:text-slate-500" (click)="close.emit()">
                      <span class="absolute -inset-2.5"></span><span class="sr-only">Fechar painel</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="relative flex-1 px-4 sm:px-6 flex flex-col pt-6 gap-6">
                <!-- FORM -->
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">

                  <div>
                    <label class="block text-sm font-semibold leading-6 text-slate-900">Nome do Patrocinador</label>
                    <div class="mt-2">
                      <input type="text" formControlName="name" placeholder="Ex: Nike, Adidas..." class="block w-full rounded-md border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold leading-6 text-slate-900">Site (opcional)</label>
                    <div class="mt-2">
                      <input type="url" formControlName="websiteUrl" placeholder="Ex: https://www.site.com" class="block w-full rounded-md border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold leading-6 text-slate-900">Ordem na Home</label>
                    <div class="mt-2">
                      <input type="number" formControlName="order" class="block w-full rounded-md border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    </div>
                    <p class="mt-1 text-xs text-slate-500">Números menores aparecem primeiro (0, 1, 2...)</p>
                  </div>

                  <div class="flex items-center gap-3">
                    <input type="checkbox" formControlName="isActive" id="isActive" class="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600">
                    <label for="isActive" class="text-sm font-medium leading-6 text-slate-900">Exibir no Carrossel da Home</label>
                  </div>

                  <div class="border-t border-slate-100 pt-6">
                    <label class="block text-sm font-semibold leading-6 text-slate-900">Logomarca (Original / Colorida)</label>
                    <p class="mt-1 text-xs text-slate-500 mb-3">Envie a logo colorida oficial (idealmente transparente). O sistema aplicará as cores P/B e os efeitos visuais de Hover automaticamente na Home.</p>
                    
                    @if (previewUrl()) {
                      <div class="mb-4 relative h-32 w-full rounded-lg border-2 border-dashed border-slate-300 p-2 flex items-center justify-center bg-slate-50 overflow-hidden group">
                        <img [src]="previewUrl()" alt="Preview" class="max-h-full max-w-full object-contain" />
                        <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" (click)="clearImage()" class="bg-rose-500 text-white rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-rose-600 shadow-sm">Remover Logo</button>
                        </div>
                      </div>
                    } @else {
                      <div class="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
                        <div class="text-center">
                          <svg class="mx-auto h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                          </svg>
                          <div class="mt-4 flex text-sm leading-6 text-slate-600">
                            <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                              <span>Fazer Upload da Imagem</span>
                              <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/*" (change)="onFileSelected($event)">
                            </label>
                          </div>
                          <p class="text-xs leading-5 text-slate-500">PNG, JPG, WEBP transparente</p>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="mt-4 flex gap-3">
                    <button type="button" class="flex-1 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50" (click)="close.emit()">
                      Cancelar
                    </button>
                    <button type="submit" [disabled]="form.invalid || loading() || (!previewUrl() && !selectedFile())" class="flex-1 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50">
                      {{ loading() ? 'Salvando...' : 'Salvar Patrocinador' }}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminCreateSponsorDrawerComponent implements OnInit {
  @Input() sponsorToEdit: Sponsor | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private sponsorsService = inject(SponsorsService);
  private newsApiService = inject(NewsApiService);

  readonly loading = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      websiteUrl: [''],
      order: [0],
      isActive: [true],
    });
  }

  ngOnInit() {
    if (this.sponsorToEdit) {
      this.form.patchValue({
        name: this.sponsorToEdit.name,
        websiteUrl: this.sponsorToEdit.websiteUrl,
        order: this.sponsorToEdit.order,
        isActive: this.sponsorToEdit.isActive,
      });
      this.previewUrl.set(this.sponsorToEdit.logoUrl);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.previewUrl.set(null);
    this.selectedFile.set(null);
  }

  async onSubmit() {
    if (this.form.invalid) return;
    if (!this.previewUrl() && !this.selectedFile()) {
      alert('Por favor, envie uma logo colorida do patrocinador.');
      return;
    }

    this.loading.set(true);

    try {
      let logoUrl = this.sponsorToEdit?.logoUrl || '';
      let logoStorageKey = this.sponsorToEdit?.logoStorageKey || '';

      if (this.selectedFile()) {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          this.newsApiService.uploadImage(this.selectedFile()!).subscribe({
            next: (res) => {
              if (res.success && res.file?.url) {
                resolve({ publicUrl: res.file.url, id: '' });
              } else {
                reject();
              }
            },
            error: () => reject()
          });
        });
        logoUrl = uploadResult.publicUrl;
        logoStorageKey = uploadResult.id || '';
      }

      const formVal = this.form.value;
      const payload: any = {
        name: formVal.name,
        order: formVal.order,
        isActive: formVal.isActive,
        logoUrl,
        logoStorageKey,
      };
      
      if (formVal.websiteUrl && formVal.websiteUrl.trim() !== '') {
        payload.websiteUrl = formVal.websiteUrl.trim();
      }

      if (this.sponsorToEdit) {
        this.sponsorsService.update(this.sponsorToEdit._id, payload).subscribe({
          next: () => {
            this.loading.set(false);
            this.saved.emit();
          },
          error: () => this.loading.set(false)
        });
      } else {
        this.sponsorsService.create(payload).subscribe({
          next: () => {
            this.loading.set(false);
            this.saved.emit();
          },
          error: () => this.loading.set(false)
        });
      }
    } catch (e) {
      this.loading.set(false);
      alert('Ocorreu um erro ao fazer upload da logomarca');
    }
  }
}
