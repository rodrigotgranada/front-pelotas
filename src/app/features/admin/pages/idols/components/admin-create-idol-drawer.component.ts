import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Idol } from '../../../../../core/models/idol.model';
import { IdolsApiService } from '../../../../../core/services/idols-api.service';
import { NewsApiService } from '../../../../../core/services/news-api.service';
import { ToastMessagesService, ToastTitle } from '../../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../../shared/ui/spinner/spinner.component';
import { compressImage } from '../../../../../shared/utils/image-compress.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-create-idol-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-slate-900/60 transition-opacity" aria-hidden="true" (click)="close.emit()"></div>

        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          <div class="pointer-events-auto w-screen max-w-lg transform transition-transform shadow-2xl">
            <div class="flex h-full flex-col overflow-y-auto bg-white shadow-xl relative">
              
              <!-- Header -->
              <div class="px-6 py-6 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                <div class="flex items-start justify-between">
                  <div>
                    <h2 class="text-lg font-bold leading-6 text-slate-900" id="slide-over-title">
                      {{ idolToEdit ? 'Editar Ídolo' : 'Novo Ídolo' }}
                    </h2>
                    <p class="text-sm text-slate-500 mt-1">Preencha os dados e a biografia do homenageado.</p>
                  </div>
                  <div class="ml-3 flex h-7 items-center">
                    <button type="button" class="relative rounded-md bg-white text-slate-400 hover:text-slate-500" (click)="close.emit()">
                      <span class="absolute -inset-2.5"></span><span class="sr-only">Fechar</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="relative flex-1 px-6 py-6 flex flex-col gap-6">
                <!-- FORM -->
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">

                  <div>
                    <label class="block text-sm font-semibold leading-6 text-slate-900">Nome do Ídolo</label>
                    <div class="mt-2">
                      <input type="text" formControlName="name" placeholder="Ex: Claudiomiro" class="block w-full rounded-md border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-semibold leading-6 text-slate-900">História (Biografia)</label>
                    <div class="mt-2">
                      <textarea rows="4" formControlName="description" placeholder="A história deste ídolo no clube..." class="block w-full rounded-md border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <div class="flex flex-col">
                      <label for="isAthlete" class="text-sm font-bold leading-6 text-indigo-900">Este Ídolo é um Atleta?</label>
                      <p class="text-xs text-indigo-700/80">Ao ativar, campos de estatística como Gols e Partidas serão exibidos.</p>
                    </div>
                    <div class="flex items-center">
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" formControlName="isAthlete" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  <!-- Role Field (shown when NOT athlete) -->
                  @if (!form.get('isAthlete')?.value) {
                    <div class="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label class="block text-sm font-semibold leading-6 text-slate-900">Função / Papel <span class="text-slate-400 font-normal text-xs">(opcional)</span></label>
                      <p class="text-xs text-slate-500 mt-0.5 mb-2">Ex: "Funcionário Ilustre", "Torcedor Ilustre", "Presidente Honorário"</p>
                      <input type="text" formControlName="role" placeholder="Ex: Funcionário Ilustre" class="block w-full rounded-md border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                    </div>
                  }

                  <!-- Statistics Container (Conditionally Rendered) -->
                  @if (form.get('isAthlete')?.value) {
                    <div formGroupName="statistics" class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Partidas Jogadas</label>
                          <div class="mt-2 relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-sm">#</span>
                            <input type="number" formControlName="matches" placeholder="0" class="block w-full rounded-md border-0 py-2 pl-8 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm">
                          </div>
                        </div>
                        <div>
                          <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Gols Marcados</label>
                          <div class="mt-2 relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-sm">⚽</span>
                            <input type="number" formControlName="goals" placeholder="0" class="block w-full rounded-md border-0 py-2 pl-9 pr-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm">
                          </div>
                        </div>
                      </div>

                      <div class="border-t border-slate-100 pt-5">
                        <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">Títulos (Tags)</label>
                        <p class="text-xs text-slate-500 mt-1 mb-3">Adicione títulos rápidos para este ídolo.</p>
                        
                        <div class="flex flex-wrap gap-2 mb-3" formArrayName="titles">
                          @for (titleCtrl of titlesFormArray.controls; track $index) {
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                              🏆 {{ titleCtrl.value }}
                              <button type="button" (click)="removeTitle($index)" class="text-amber-500 hover:text-amber-700 focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                              </button>
                            </div>
                          }
                        </div>

                        <div class="flex gap-2">
                          <input #newTitle type="text" placeholder="Ex: Gauchão 1930" (keydown.enter)="addTitle(newTitle.value); newTitle.value=''; $event.preventDefault()" class="block flex-1 rounded-md border-0 py-1.5 px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600">
                          <button type="button" (click)="addTitle(newTitle.value); newTitle.value=''" class="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">Adicionar</button>
                        </div>
                      </div>
                    </div>
                  }

                  <div class="border-t border-slate-100 pt-6">
                    <label class="block text-sm font-semibold leading-6 text-slate-900">Foto Heroica</label>
                    <p class="mt-1 text-xs text-slate-500 mb-3">Envie a foto do indivíduo (idealmente de corpo ou peito, fundo transparente ou limpo).</p>
                    
                    @if (previewUrl()) {
                      <div class="mb-4 relative h-48 w-full rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden group">
                        <img [src]="previewUrl()" alt="Preview" class="h-full w-full object-cover sm:object-contain object-top" />
                        <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" (click)="clearImage()" class="bg-rose-500 text-white rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-rose-600 shadow-sm">Remover Foto</button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
                        <div class="text-center">
                          <svg class="mx-auto h-12 w-12 text-slate-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                          </svg>
                          <div class="mt-4 flex justify-center text-sm leading-6 text-slate-600">
                            <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                              <span>Fazer Upload</span>
                              <input id="file-upload" type="file" class="sr-only" accept="image/*" (change)="onFileSelected($event)">
                            </label>
                          </div>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="flex items-center gap-3">
                    <input type="checkbox" formControlName="isActive" id="isActive" class="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600">
                    <label for="isActive" class="text-sm font-medium leading-6 text-slate-900">Visível publicamente na página inicial</label>
                  </div>

                </form>
              </div>

              <!-- Footer Buttons -->
              <div class="border-t border-slate-200 px-6 py-4 bg-slate-50 sticky bottom-0 z-20 flex gap-3">
                <button type="button" class="flex-1 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50" (click)="close.emit()">
                  Cancelar
                </button>
                <button type="button" (click)="onSubmit()" [disabled]="form.invalid || loading() || (!previewUrl() && !selectedFile())" class="flex-1 flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-50">
                  @if (loading()) { <app-spinner size="sm" color="white" /> Salvando... }
                  @else { Salvar Ídolo }
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminCreateIdolDrawerComponent implements OnInit {
  @Input() idolToEdit: Idol | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private idolsApi = inject(IdolsApiService);
  private newsApi = inject(NewsApiService);
  private toast = inject(ToastMessagesService);

  readonly loading = signal(false);
  readonly previewUrl = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    isAthlete: [false],
    role: [''],
    isActive: [true],
    order: [0],
    statistics: this.fb.group({
      matches: [0],
      goals: [0],
      titles: this.fb.array<string>([]),
    })
  });

  ngOnInit() {
    if (this.idolToEdit) {
      this.form.patchValue({
        name: this.idolToEdit.name,
        description: this.idolToEdit.description,
        isAthlete: this.idolToEdit.isAthlete,
        role: this.idolToEdit.role || '',
        isActive: this.idolToEdit.isActive,
        order: this.idolToEdit.order,
      });

      if (this.idolToEdit.statistics) {
        this.form.get('statistics')?.patchValue({
          matches: this.idolToEdit.statistics.matches || 0,
          goals: this.idolToEdit.statistics.goals || 0,
        } as any);
        
        const titles = this.idolToEdit.statistics.titles || [];
        titles.forEach(t => this.titlesFormArray.push(this.fb.control(t)));
      }

      this.previewUrl.set(this.idolToEdit.photoUrl);
    }
  }

  get titlesFormArray(): FormArray {
    return this.form.get('statistics.titles') as FormArray;
  }

  addTitle(value: string) {
    if (value.trim()) {
      this.titlesFormArray.push(this.fb.control(value.trim()));
    }
  }

  removeTitle(index: number) {
    this.titlesFormArray.removeAt(index);
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
    // Reset so same file can be picked again without double-click
    event.target.value = '';
  }

  clearImage() {
    this.previewUrl.set(null);
    this.selectedFile.set(null);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toast.showWarning('Preencha os campos obrigatórios corretamente.', ToastTitle.Warning);
      return;
    }

    if (!this.previewUrl() && !this.selectedFile()) {
      this.toast.showWarning('Por favor, envie a foto do ídolo.', ToastTitle.Warning);
      return;
    }

    this.loading.set(true);

    try {
      let photoUrl = this.idolToEdit?.photoUrl || '';
      let photoStorageKey = this.idolToEdit?.photoStorageKey || '';

      if (this.selectedFile()) {
        // Compress before upload (max 1280px, JPEG 82%)
        const compressed = await compressImage(this.selectedFile()!) as File;
        const compressedFile = new File([compressed], 'idol.jpg', { type: 'image/jpeg' });
        const uploadResult: any = await firstValueFrom(this.newsApi.uploadImage(compressedFile));
        if (uploadResult.success && uploadResult.file?.url) {
          photoUrl = uploadResult.file.url;
          photoStorageKey = uploadResult.file.id || uploadResult.id || '';
        } else {
          throw new Error('Upload retornado sem URL');
        }
      }

      const formVal = this.form.value;
      const basePayload: any = {
        name: formVal.name,
        description: formVal.description,
        isAthlete: formVal.isAthlete,
        role: formVal.isAthlete ? undefined : (formVal.role?.trim() || undefined),
        isActive: formVal.isActive,
        order: formVal.order,
        photoUrl,
        photoStorageKey,
      };

      if (formVal.isAthlete) {
        basePayload.statistics = {
          matches: formVal.statistics?.matches || 0,
          goals: formVal.statistics?.goals || 0,
          titles: formVal.statistics?.titles || [],
        };
      } else {
        basePayload.statistics = undefined;
      }

      if (this.idolToEdit) {
        await firstValueFrom(this.idolsApi.update(this.idolToEdit._id, basePayload));
        this.toast.showSuccess('Ídolo atualizado!', ToastTitle.Success);
      } else {
        await firstValueFrom(this.idolsApi.create(basePayload));
        this.toast.showSuccess('Ídolo criado!', ToastTitle.Success);
      }

      this.saved.emit();
    } catch (error) {
      this.toast.showApiError(error, 'Falha ao salvar ídolo.');
    } finally {
      this.loading.set(false);
    }
  }
}
