import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SquadsApiService, Squad } from '../../../../../core/services/squads-api.service';
import { AthletesApiService, Athlete } from '../../../../../core/services/athletes-api.service';
import { ToastMessagesService } from '../../../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-admin-squad-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 overflow-hidden">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="onClose()"></div>
        
        <div class="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
          <header class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 class="text-lg font-black text-slate-900">{{ squad ? 'Editar Elenco' : 'Novo Elenco' }}</h2>
              <p class="text-xs text-slate-500">Defina a temporada e escale os atletas</p>
            </div>
            <button (click)="onClose()" class="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </header>

          <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
            <!-- Left Side: Squad Info & Members -->
            <form [formGroup]="squadForm" class="flex-1 overflow-y-auto p-6 space-y-8 border-r border-slate-100">
              <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Ano (Temporada)</label>
                  <input 
                    formControlName="year"
                    type="number" 
                    placeholder="2026" 
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 outline-none transition-all text-sm"
                  >
                </div>
                <div class="md:col-span-2">
                  <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Competição</label>
                  <input 
                    formControlName="competition"
                    type="text" 
                    placeholder="Ex: Gauchão 2026" 
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 outline-none transition-all text-sm"
                  >
                </div>
                <div class="md:col-span-3">
                  <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Categoria</label>
                  <select formControlName="category" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 outline-none transition-all text-sm">
                    <option value="Profissional">Profissional Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Sub-20">Categorias de Base (Sub-20)</option>
                    <option value="Sub-17">Categorias de Base (Sub-17)</option>
                    <option value="Sub-15">Categorias de Base (Sub-15)</option>
                    <option value="Sub-13">Categorias de Base (Sub-13)</option>
                    <option value="Outros">Outras Categorias</option>
                  </select>
                </div>
              </section>

              <section class="space-y-4">
                <div class="flex items-center justify-between">
                  <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Atletas Selecionados ({{ members.length }})</label>
                </div>

                <div formArrayName="members" class="space-y-2">
                  @for (member of members.controls; track $index) {
                    <div [formGroupName]="$index" class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <div class="h-10 w-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                         @if (getAthletePhoto(member.get('athleteId')?.value)) {
                           <img [src]="getAthletePhoto(member.get('athleteId')?.value)" class="w-full h-full object-cover">
                         } @else {
                           <div class="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                               {{ $index + 1 }}
                           </div>
                         }
                      </div>
                      
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-slate-900 truncate">{{ getAthleteName(member.get('athleteId')?.value) }}</p>
                        <p class="text-[10px] text-slate-500 truncate">{{ getAthletePositions(member.get('athleteId')?.value) }}</p>
                      </div>


                      <button 
                        (click)="removeMember($index)"
                        class="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                  } @empty {
                    <div class="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                       <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum atleta vinculado</p>
                       <p class="text-[9px] text-slate-400 mt-1">Busque e adicione atletas ao lado –></p>
                    </div>
                  }
                </div>
              </section>
            </form>

            <!-- Right Side: Athlete Registry Picker -->
            <aside class="w-full md:w-80 bg-slate-50/50 flex flex-col p-4">
              <div class="mb-4">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Buscar no Banco de Dados</label>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input 
                    type="text" 
                    placeholder="Nome do atleta..." 
                    (input)="onSearch($event)"
                    class="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                  >
                </div>
              </div>

              <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                @for (athlete of availableAthletes(); track athlete._id) {
                  <div class="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 transition-all hover:border-brand-300 group">
                    <img [src]="athlete.photoUrl" class="h-10 w-10 rounded-xl object-cover shrink-0">
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-bold text-slate-900 truncate leading-tight">{{ athlete.name }}</p>
                      <p class="text-[9px] text-slate-400 uppercase font-black truncate">{{ athlete.positions.join(', ') }}</p>
                    </div>
                    <button 
                      (click)="addMember(athlete)"
                      [disabled]="isMember(athlete._id)"
                      class="p-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-600 hover:text-white disabled:opacity-30 disabled:bg-slate-100 disabled:text-slate-400 transition-all font-bold text-lg leading-none"
                    >
                      {{ isMember(athlete._id) ? '✓' : '+' }}
                    </button>
                  </div>
                }
              </div>
            </aside>
          </div>

          <footer class="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
            <button 
              type="button"
              (click)="onClose()"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="button"
              (click)="onSubmit()"
              [disabled]="loading() || squadForm.invalid"
              class="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <div class="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Salvando...
              } @else {
                Salvar Elenco
              }
            </button>
          </footer>
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
  `]
})
export class AdminSquadDrawerComponent implements OnChanges {
  @Input() squad: Squad | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly squadsApi = inject(SquadsApiService);
  private readonly athletesApi = inject(AthletesApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly loading = signal(false);
  readonly availableAthletes = signal<Athlete[]>([]);
  
  readonly squadForm = this.fb.group({
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    competition: ['', [Validators.required]],
    category: ['Profissional', [Validators.required]],
    members: this.fb.array([])
  });

  get members() {
    return this.squadForm.get('members') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue) {
      if (this.squad) {
        this.populateForm(this.squad);
      } else {
        this.resetForm();
      }
      this.loadAvailableAthletes();
    }
  }

  resetForm(): void {
    this.squadForm.reset({
      year: new Date().getFullYear(),
      category: 'Profissional'
    });
    this.members.clear();
  }

  loadAvailableAthletes(search: string = ''): void {
    this.athletesApi.findAll({ search, limit: 50 }).subscribe({
      next: (data) => this.availableAthletes.set(data),
      error: () => this.toast.showError('Erro ao buscar catálogo de atletas')
    });
  }

  onSearch(event: any): void {
    const query = event.target.value;
    this.loadAvailableAthletes(query);
  }

  populateForm(squad: Squad): void {
    this.squadForm.patchValue({
      year: squad.year,
      competition: squad.competition,
      category: squad.category
    });

    this.members.clear();
    squad.members.forEach((m: any) => {
      // Correctly handle populated vs ID-only member
      const athleteId = typeof m.athleteId === 'string' ? m.athleteId : (m.athleteId as any)._id;
      this.addMemberToForm({
        athleteId
      }, m.athleteId);
    });
  }

  addMember(athlete: Athlete): void {
    this.addMemberToForm({
      athleteId: athlete._id
    }, athlete);
  }

  addMemberToForm(data: any, athleteContext: any = null): void {
    const group = this.fb.group({
      athleteId: [data.athleteId, Validators.required],
      // Context properties for display only
      _athlete: [athleteContext] 
    });
    this.members.push(group);
  }

  removeMember(index: number): void {
    this.members.removeAt(index);
  }

  isMember(athleteId: string): boolean {
    return this.members.controls.some(m => m.get('athleteId')?.value === athleteId);
  }

  getAthleteName(athleteId: string): string {
    const member = this.members.controls.find(m => m.get('athleteId')?.value === athleteId);
    const context = member?.get('_athlete')?.value as any;
    return context?.nickname || context?.name || 'Carregando...';
  }

  getAthletePhoto(athleteId: string): string {
    const member = this.members.controls.find(m => m.get('athleteId')?.value === athleteId);
    const context = member?.get('_athlete')?.value as any;
    return context?.photoUrl || '';
  }

  getAthletePositions(athleteId: string): string {
    const member = this.members.controls.find(m => m.get('athleteId')?.value === athleteId);
    const context = member?.get('_athlete')?.value as any;
    if (!context?.positions) return '';
    return Array.isArray(context.positions) ? context.positions.join(', ') : '';
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.squadForm.invalid) return;

    this.loading.set(true);
    const rawValue = this.squadForm.value as any;
    
    // Clean members for API (internal _athlete is only for UI)
    const data = {
      ...rawValue,
      members: rawValue.members.map((m: any) => ({
        athleteId: m.athleteId
      }))
    };

    const request = this.squad 
      ? this.squadsApi.update((this.squad as any)._id, data)
      : this.squadsApi.create(data);

    request.subscribe({
      next: () => {
        this.toast.showSuccess(this.squad ? 'Elenco atualizado' : 'Elenco criado');
        this.save.emit();
      },
      error: (err: any) => {
        this.toast.showApiError(err, 'Erro ao salvar elenco');
        this.loading.set(false);
      }
    });
  }
}
