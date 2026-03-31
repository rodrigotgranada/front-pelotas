import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AthletesApiService, Athlete } from '../../../../../core/services/athletes-api.service';
import { ToastMessagesService } from '../../../../../core/notifications/toast-messages.service';
import { ImageCropperDialogComponent } from '../../../../../shared/ui/image-cropper/image-cropper-dialog.component';
import { compressImage } from '../../../../../shared/utils/image-compress.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-athlete-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperDialogComponent],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-hidden">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="onClose()"></div>
        
        <div class="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
          <header class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 class="text-lg font-black text-slate-900">{{ athlete ? 'Editar Atleta' : 'Novo Atleta' }}</h2>
              <p class="text-xs text-slate-500">Preencha os dados do jogador ou comissão</p>
            </div>
            <button (click)="onClose()" class="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </header>

          <form [formGroup]="athleteForm" (ngSubmit)="onSubmit()" class="flex-1 overflow-y-auto p-6 space-y-8">
            <!-- Photo Upload Section -->
            <section class="flex flex-col items-center gap-4">
              <div class="relative group">
                <div class="h-32 w-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center transition-all group-hover:border-brand-400">
                  @if (photoPreview()) {
                    <img [src]="photoPreview()!" class="h-full w-full object-cover">
                  } @else {
                    <div class="flex flex-col items-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <span class="text-[10px] font-bold mt-1 uppercase">Foto</span>
                    </div>
                  }
                </div>
                <button 
                  type="button"
                  (click)="fileInput.click()"
                  class="absolute -bottom-2 -right-2 bg-brand-600 text-white p-2 rounded-xl shadow-lg hover:bg-brand-700 transition-transform active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                </button>
                <input #fileInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
              </div>
              <p class="text-[10px] text-slate-400 text-center max-w-[200px]">Recomendado: 400x400px (JPG/PNG)</p>
            </section>

            <!-- Basic Info -->
            <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input 
                  formControlName="name"
                  type="text" 
                  placeholder="Ex: Rodrigo Granada" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm"
                >
              </div>

              <div>
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Apelido</label>
                <input 
                  formControlName="nickname"
                  type="text" 
                  placeholder="Ex: Granada" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm"
                >
              </div>

              <div>
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Data de Nascimento</label>
                <input 
                  formControlName="dateOfBirth"
                  type="date" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm"
                >
              </div>

              <div>
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Altura (cm)</label>
                <input 
                  formControlName="height"
                  type="number" 
                  placeholder="Ex: 185" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm"
                >
              </div>

              <div>
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Pé Preferencial</label>
                <select formControlName="preferredFoot" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm">
                  <option value="">Selecione...</option>
                  <option value="Destro">Destro</option>
                  <option value="Canhoto">Canhoto</option>
                  <option value="Ambidestro">Ambidestro</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Naturalidade (Cidade/UF)</label>
                <input 
                  formControlName="hometown"
                  type="text" 
                  placeholder="Ex: Pelotas - RS" 
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm"
                >
              </div>
            </section>

            <!-- Positions / Staff Role -->
            <section class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Posições / Atribuições</label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" formControlName="isStaff" class="hidden peer">
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Membro da Comissão?</span>
                  <div class="w-10 h-5 bg-slate-200 rounded-full relative transition-colors peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5">
                  </div>
                </label>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (pos of availablePositions; track pos) {
                  <button 
                    type="button"
                    (click)="togglePosition(pos)"
                    [class]="isPositionSelected(pos) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300'"
                    class="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    {{ pos }}
                  </button>
                }
              </div>
            </section>

            <!-- Previous Clubs -->
            <section class="space-y-4">
              <div class="flex items-center justify-between">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Histórico de Clubes</label>
                <button 
                  type="button"
                  (click)="addClub()"
                  class="text-[10px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-wider"
                >
                  + Adicionar Clube
                </button>
              </div>
              
              <div formArrayName="previousClubs" class="space-y-3">
                @for (club of clubs.controls; track $index) {
                  <div [formGroupName]="$index" class="flex gap-2 group">
                    <input 
                      formControlName="club"
                      type="text" 
                      placeholder="Nome do Clube" 
                      class="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-brand-500 outline-none transition-all"
                    >
                    <select 
                      formControlName="yearStart"
                      class="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:border-brand-500 outline-none transition-all"
                    >
                      <option [value]="null">Início</option>
                      @for (y of yearOptions; track y) {
                        <option [value]="y">{{ y }}</option>
                      }
                    </select>

                    <select 
                      formControlName="yearEnd"
                      class="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:border-brand-500 outline-none transition-all disabled:opacity-30"
                    >
                      <option [value]="null">Fim</option>
                      @for (y of getFilteredEndYears(club.get('yearStart')?.value); track y) {
                        <option [value]="y">{{ y }}</option>
                      }
                    </select>
                    <button 
                      type="button"
                      (click)="removeClub($index)"
                      class="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                }
                @if (clubs.length === 0) {
                  <div class="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p class="text-[10px] text-slate-400 uppercase font-black">Nenhum clube anterior registrado</p>
                  </div>
                }
              </div>
            </section>

            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" formControlName="isActive" class="hidden peer">
                <div class="w-10 h-5 bg-slate-200 rounded-full relative transition-colors peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-5">
                </div>
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Atleta Ativo?</span>
              </label>
            </div>
          </form>

          <footer class="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button 
              type="button"
              (click)="onClose()"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              (click)="onSubmit()"
              [disabled]="loading() || athleteForm.invalid"
              class="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              } @else {
                Confirmar
              }
            </button>
          </footer>
        </div>
      </div>
    }

    @if (imageSelectedEvent()) {
      <app-image-cropper-dialog
        [imageChangedEvent]="imageSelectedEvent()!"
        [aspectRatio]="1"
        [maintainAspectRatio]="true"
        [resizeToWidth]="400"
        (imageCroppedEvent)="onImageCropped($event)"
        (cancel)="onCropCancel()"
      ></app-image-cropper-dialog>
    }
  `
})
export class AdminAthleteDrawerComponent implements OnChanges {
  @Input() athlete: Athlete | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly athletesApi = inject(AthletesApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly loading = signal(false);
  readonly photoPreview = signal<string | null>(null);
  readonly imageSelectedEvent = signal<Event | null>(null);
  private pendingPhotoBlob: Blob | null = null;
  
  readonly availablePositions = [
    'Goleiro', 'Lateral Direito', 'Lateral Esquerdo', 'Zagueiro', 
    'Volante', 'Meia', 'Ponta', 'Atacante', 'Treinador', 
    'Auxiliar Técnico', 'Prep. Físico', 'Médico'
  ];

  readonly yearOptions = Array.from({ length: new Date().getFullYear() - 1939 }, (_, i) => new Date().getFullYear() - i);

  readonly athleteForm = this.fb.group({
    name: ['', [Validators.required]],
    nickname: [''],
    photoUrl: ['', [Validators.required]],
    positions: [[] as string[]],
    dateOfBirth: [''],
    height: [null as number | null],
    hometown: [''],
    preferredFoot: [''],
    previousClubs: this.fb.array([]),
    isStaff: [false],
    isActive: [true]
  });

  get clubs() {
    return this.athleteForm.get('previousClubs') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      if (this.athlete) {
        this.populateForm(this.athlete);
      } else {
        this.resetForm();
      }
    }
  }

  resetForm(): void {
    this.athleteForm.reset({
      isActive: true,
      isStaff: false,
      positions: []
    });
    this.clubs.clear();
    this.photoPreview.set(null);
    this.imageSelectedEvent.set(null);
  }

  populateForm(athlete: Athlete): void {
    this.athleteForm.patchValue({
      name: athlete.name,
      nickname: athlete.nickname,
      photoUrl: athlete.photoUrl,
      positions: athlete.positions,
      dateOfBirth: athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toISOString().split('T')[0] : '',
      height: athlete.height,
      hometown: athlete.hometown,
      preferredFoot: athlete.preferredFoot,
      isStaff: athlete.isStaff,
      isActive: athlete.isActive
    });

    this.clubs.clear();
    athlete.previousClubs?.forEach(club => this.addClub(club));
    this.photoPreview.set(athlete.photoUrl);
  }

  addClub(club: any = { club: '', yearStart: null, yearEnd: null }): void {
    const clubGroup = this.fb.group({
      club: [club.club, Validators.required],
      yearStart: [club.yearStart || club.years?.split('-')[0], [Validators.required, Validators.min(1900)]],
      yearEnd: [{ 
        value: club.yearEnd || club.years?.split('-')[1], 
        disabled: !(club.yearStart || club.years) 
      }, [Validators.min(1900)]]
    });

    clubGroup.get('yearStart')?.valueChanges.subscribe(val => {
      const endCtrl = clubGroup.get('yearEnd');
      if (val) endCtrl?.enable();
      else {
        endCtrl?.disable();
        endCtrl?.setValue(null);
      }
    });

    this.clubs.push(clubGroup);
  }

  getFilteredEndYears(startYear: any): number[] {
    if (!startYear) return [];
    return this.yearOptions.filter(y => y >= +startYear);
  }

  removeClub(index: number): void {
    this.clubs.removeAt(index);
  }

  togglePosition(pos: string): void {
    const current = this.athleteForm.get('positions')?.value || [];
    const index = current.indexOf(pos);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(pos);
    }
    this.athleteForm.patchValue({ positions: [...current] });
  }

  isPositionSelected(pos: string): boolean {
    return (this.athleteForm.get('positions')?.value || []).includes(pos);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageSelectedEvent.set(event);
    }
  }

  onImageCropped(file: Blob): void {
    this.imageSelectedEvent.set(null);
    const objectUrl = URL.createObjectURL(file);
    this.photoPreview.set(objectUrl);
    this.athleteForm.patchValue({ photoUrl: objectUrl });
    this.pendingPhotoBlob = file;
  }

  onCropCancel(): void {
    this.imageSelectedEvent.set(null);
  }

  onClose(): void {
    this.close.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.athleteForm.invalid) return;

    // Validate clubs years logic
    const clubsData = this.athleteForm.value.previousClubs as any[];
    const invalidClub = clubsData?.find(c => c.yearEnd && c.yearEnd < c.yearStart);
    
    if (invalidClub) {
      this.toast.showError(`O ano de saída do ${invalidClub.club} não pode ser menor que o de entrada.`);
      return;
    }

    this.loading.set(true);

    try {
      const data = { ...this.athleteForm.getRawValue() } as any;

      // 1. Handle Image Upload if needed
      if (this.pendingPhotoBlob) {
        try {
          const compressed = await compressImage(this.pendingPhotoBlob, 600, 600, 0.8);
          const file = new File([compressed], 'athlete-photo.jpg', { type: 'image/jpeg' });
          const res = await firstValueFrom(this.athletesApi.uploadImage(file));
          if (res.success && res.file?.url) {
            data.photoUrl = res.file.url;
          }
        } catch (err) {
          this.toast.showError('Erro ao fazer upload da foto.');
          this.loading.set(false);
          return;
        }
      }

      // 2. Ensure numeric types for backend
      if (data.height) data.height = Number(data.height);
      if (data.previousClubs) {
        data.previousClubs = data.previousClubs.map((c: any) => ({
          ...c,
          yearStart: c.yearStart ? Number(c.yearStart) : null,
          yearEnd: c.yearEnd ? Number(c.yearEnd) : null
        }));
      }

      // 3. Save Athlete
      const request = this.athlete 
        ? this.athletesApi.update((this.athlete as any)._id, data)
        : this.athletesApi.create(data);

      await firstValueFrom(request);
      
      this.toast.showSuccess(this.athlete ? 'Atleta atualizado' : 'Atleta criado');
      this.save.emit();
      this.pendingPhotoBlob = null;
    } catch (err: any) {
      this.toast.showApiError(err, 'Erro ao salvar atleta');
    } finally {
      this.loading.set(false);
    }
  }
}
