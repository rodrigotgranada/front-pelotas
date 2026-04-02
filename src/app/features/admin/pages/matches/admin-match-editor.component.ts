import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../../core/services/matches-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { Competition, Team, MatchStatus, MatchGoal } from '../../../../core/models/match.model';
import { finalize } from 'rxjs';
import { AdminTeamDrawerComponent } from '../teams/components/admin-team-drawer.component';

@Component({
  selector: 'app-admin-match-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, AdminTeamDrawerComponent],
  template: `
    <div class="flex flex-col gap-6 max-w-4xl mx-auto pb-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/jogos" class="text-slate-500 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">
            {{ isNew() ? 'Agendar Novo Jogo' : 'Editar Jogo' }}
          </h1>
        </div>
        <div class="flex gap-3">
           @if (!isNew() && form.value.status !== 'FINISHED') {
             <button
                type="button"
                (click)="showFinishConfirm.set(true)"
                [disabled]="loading()"
                class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                Finalizar e Relatar Jogo
              </button>
           }
          <button
            type="button"
            (click)="save()"
            [disabled]="loading() || form.invalid"
            class="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {{ loading() ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="space-y-6">
        <!-- Informações Básicas -->
        <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Campeonato -->
            <div class="space-y-2">
              <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Campeonato / Competição</label>
              <select formControlName="competitionId" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 font-bold transition-all">
                <option value="">Selecione a competição...</option>
                @for (comp of competitions(); track comp.id) {
                  <option [value]="comp.id">{{ comp.name }} ({{ comp.season }})</option>
                }
              </select>
            </div>

            <!-- Adversário com Busca -->
            <div class="space-y-2 relative">
              <div class="flex items-center justify-between">
                <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Adversário</label>
                <button type="button" (click)="showTeamDrawer.set(true)" class="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">+ Novo Time</button>
              </div>
              
              <!-- Searchable Select Emulado -->
              <div class="relative group">
                <div 
                  (click)="showDropdown.set(!showDropdown())"
                  class="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between font-bold transition-all hover:border-slate-300"
                  [class.ring-2.ring-indigo-500.border-indigo-500]="showDropdown()"
                >
                  <span [class.text-slate-400]="!selectedTeamName()">
                    {{ selectedTeamName() || 'Selecione o adversário...' }}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                </div>

                @if (showDropdown()) {
                  <div class="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div class="relative mb-2">
                      <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <input 
                        #searchInput
                        type="text" 
                        class="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Buscar time..."
                        [(ngModel)]="teamSearch"
                        [ngModelOptions]="{standalone: true}"
                        (click)="$event.stopPropagation()"
                      >
                    </div>
                    <div class="max-h-60 overflow-y-auto custom-scrollbar">
                      @for (team of filteredTeams(); track team.id) {
                        <button 
                          type="button"
                          (click)="selectTeam(team)"
                          class="w-full text-left px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                        >
                          <img [src]="team.logoUrl || 'assets/placeholder-team.png'" class="w-6 h-6 object-contain grayscale group-hover:grayscale-0">
                          <span class="text-sm font-bold text-slate-700 group-hover:text-slate-900">{{ team.name }}</span>
                        </button>
                      } @empty {
                        <div class="py-4 text-center text-xs font-bold text-slate-400 uppercase italic">Nenhum time encontrado</div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Data e Hora -->
            <div class="space-y-2">
              <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Data e Horário</label>
              <input type="datetime-local" formControlName="date" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 font-bold transition-all">
            </div>

            <!-- Local -->
            <div class="space-y-2">
              <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Local / Estádio</label>
              <input type="text" formControlName="stadium" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 font-bold transition-all" placeholder="Ex: Boca do Lobo">
            </div>

            <!-- Status do Jogo -->
            <div class="space-y-2">
              <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Status</label>
              <select formControlName="status" class="w-full rounded-xl border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-indigo-500 font-bold transition-all">
                <option value="SCHEDULED">Agendado</option>
                <option value="LIVE">Em Andamento (Ao Vivo)</option>
                <option value="FINISHED">Finalizado</option>
                <option value="POSTPONED">Adiado</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <div class="flex items-center gap-3">
                <label class="text-sm font-bold text-slate-700">Mando de Campo:</label>
                <div class="flex bg-white rounded-lg p-1 border border-slate-200">
                  <button type="button" (click)="form.patchValue({isHome: true})" [class]="form.value.isHome ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'" class="px-4 py-1.5 rounded-md text-xs font-black uppercase transition-all">
                    Pelotas em Casa
                  </button>
                  <button type="button" (click)="form.patchValue({isHome: false})" [class]="!form.value.isHome ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'" class="px-4 py-1.5 rounded-md text-xs font-black uppercase transition-all">
                    Fora de Casa
                  </button>
                </div>
             </div>
             
             <div class="h-6 w-px bg-slate-200"></div>

             <div class="flex-1">
                <label class="text-xs font-bold text-slate-500 block mb-1">Transmissão Ao Vivo (Link)</label>
                <input type="text" formControlName="transmissionUrl" class="w-full rounded-lg border-slate-200 text-xs bg-white focus:ring-indigo-500" placeholder="Ex: YouTube">
             </div>
          </div>
        </div>

        <!-- Placar e Gols -->
        <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">
           <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                Placar e Marcadores
              </h3>

              <div class="flex items-center justify-center gap-10 py-6">
                <div class="flex flex-col items-center gap-4">
                  <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Pelotas</span>
                  <div class="relative group">
                    <input type="number" formControlName="pelotasScore" readonly class="w-24 text-center text-5xl font-black rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-all opacity-80 cursor-default focus:ring-0">
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Calculado Automaticamente">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                    </div>
                  </div>
                </div>
                
                <span class="text-3xl font-black text-slate-200 mt-6 italic">VS</span>

                <div class="flex flex-col items-center gap-4">
                  <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Adversário</span>
                  <div class="relative group">
                    <input type="number" formControlName="opponentScore" readonly class="w-24 text-center text-5xl font-black rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 transition-all opacity-80 cursor-default focus:ring-0">
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Calculado Automaticamente">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                    </div>
                  </div>
                </div>
              </div>
           </div>

           <!-- Lista de Gols -->
           <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-slate-50 pb-4">
                <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Cronologia de Gols</span>
                <button type="button" (click)="addGoal()" class="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-tight">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Adicionar Gol
                </button>
              </div>

              <div formArrayName="goals" class="space-y-3">
                @for (goal of goalGroups.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div class="w-16 shrink-0">
                      <input type="number" formControlName="minute" class="w-full rounded-lg border-slate-200 text-center text-sm font-black" placeholder="Min'">
                    </div>
                    
                    <div class="flex-1">
                      <input type="text" formControlName="scorer" class="w-full rounded-lg border-slate-200 text-sm font-bold" placeholder="Nome do Jogador">
                    </div>

                    <div class="w-32 shrink-0">
                      <select formControlName="team" class="w-full rounded-lg border-slate-200 text-[10px] font-black uppercase">
                        <option value="PELOTAS">Pelotas</option>
                        <option value="OPPONENT">Adversário</option>
                      </select>
                    </div>

                    <button type="button" (click)="removeGoal(i)" class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                } @empty {
                  <div class="text-center py-8 text-slate-300 italic text-sm">Nenhum marcador registrado.</div>
                }
              </div>
           </div>
        </div>
      </form>
    </div>

    <!-- Modal de Finalização Personalizada -->
    @if (showFinishConfirm()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl p-8 animate-in zoom-in-95 duration-300">
          <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          
          <h2 class="text-2xl font-black text-slate-900 leading-tight mb-2">Finalizar Partida?</h2>
          <p class="text-slate-500 font-bold mb-8">
            Iso marcará o jogo como encerrado e abrirá o editor de notícias para você criar o relato pós-jogo com o placar final.
          </p>

          <div class="flex gap-3">
            <button 
              (click)="showFinishConfirm.set(false)"
              class="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all active:scale-95"
            >
              CANCELAR
            </button>
            <button 
              (click)="finishMatch()"
              class="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all active:scale-95"
            >
              CONFIRMAR
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Drawer de Times para Cadastro Instantâneo -->
    <app-admin-team-drawer
      [isOpen]="showTeamDrawer()"
      (closed)="onTeamDrawerClosed($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMatchEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly matchesApi = inject(MatchesApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly isNew = signal(true);
  readonly loading = signal(false);
  readonly competitions = signal<Competition[]>([]);
  readonly teams = signal<Team[]>([]);
  
  // States para a UX aprimorada
  readonly showDropdown = signal(false);
  readonly teamSearch = signal('');
  readonly showTeamDrawer = signal(false);
  readonly showFinishConfirm = signal(false);

  // Filtro de times buscável
  readonly filteredTeams = computed(() => {
    const search = this.teamSearch().toLowerCase();
    return this.teams()
      .filter(t => !t.isPelotas)
      .filter(t => t.name.toLowerCase().includes(search) || (t.shortName?.toLowerCase().includes(search)));
  });

  readonly selectedTeamName = computed(() => {
    const id = this.form.get('opponentId')?.value;
    return this.teams().find(t => t.id === id)?.name || '';
  });

  private matchId: string | null = null;

  form = this.fb.group({
    competitionId: ['', Validators.required],
    opponentId: ['', Validators.required],
    date: ['', Validators.required],
    stadium: ['', Validators.required],
    isHome: [true, Validators.required],
    pelotasScore: [0, [Validators.required, Validators.min(0)]],
    opponentScore: [0, [Validators.required, Validators.min(0)]],
    status: ['SCHEDULED' as MatchStatus, Validators.required],
    transmissionUrl: [''],
    goals: this.fb.array<MatchGoal>([])
  });

  get goalGroups() {
    return this.form.get('goals') as FormArray;
  }

  ngOnInit() {
    this.matchId = this.route.snapshot.paramMap.get('id');
    this.loadPrerequisites();

    if (this.matchId && this.matchId !== 'new') {
      this.isNew.set(false);
      this.loadMatch();
    }

    this.setupScoreAutomation();
  }

  private setupScoreAutomation() {
    this.goalGroups.valueChanges.subscribe((goals: MatchGoal[]) => {
      const pelotasScore = (goals || []).filter(g => g.team === 'PELOTAS').length;
      const opponentScore = (goals || []).filter(g => g.team === 'OPPONENT').length;
      
      this.form.patchValue({
        pelotasScore,
        opponentScore
      }, { emitEvent: false });
    });
  }

  private loadPrerequisites() {
    this.matchesApi.listCompetitions().subscribe(data => this.competitions.set(data));
    this.matchesApi.listTeams().subscribe(data => this.teams.set(data));
  }

  private loadMatch() {
    if (!this.matchId) return;
    this.loading.set(true);
    this.matchesApi.getMatch(this.matchId).subscribe({
      next: (match) => {
        let dateStr = '';
        if (match.date) {
            const d = new Date(match.date);
            const offset = d.getTimezoneOffset() * 60000;
            const localDate = new Date(d.getTime() - offset);
            dateStr = localDate.toISOString().slice(0, 16);
        }
        
        this.form.patchValue({
          competitionId: typeof match.competitionId === 'string' ? match.competitionId : (match.competitionId as Competition).id,
          opponentId: typeof match.opponentId === 'string' ? match.opponentId : (match.opponentId as Team).id,
          date: dateStr,
          stadium: match.stadium,
          isHome: match.isHome,
          pelotasScore: match.isHome ? match.homeScore : match.awayScore,
          opponentScore: match.isHome ? match.awayScore : match.homeScore,
          status: match.status,
          transmissionUrl: match.transmissionUrl || ''
        });

        this.goalGroups.clear();
        (match.goals || []).forEach(g => this.addGoal(g));
        
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao carregar dados do jogo');
        this.router.navigate(['/admin/jogos']);
      }
    });
  }

  selectTeam(team: Team) {
    this.form.patchValue({ opponentId: team.id });
    this.showDropdown.set(false);
    this.teamSearch.set('');
  }

  onTeamDrawerClosed(team: Team | null) {
    this.showTeamDrawer.set(false);
    if (team) {
      // Refresh teams list and select the new one
      this.matchesApi.listTeams().subscribe(data => {
        this.teams.set(data);
        this.form.patchValue({ opponentId: team.id });
      });
    }
  }

  addGoal(goal?: MatchGoal) {
    const group = this.fb.group({
      minute: [goal?.minute || null, [Validators.required, Validators.min(0), Validators.max(130)]],
      scorer: [goal?.scorer || '', Validators.required],
      team: [goal?.team || 'PELOTAS', Validators.required]
    });
    this.goalGroups.push(group);
  }

  removeGoal(index: number) {
    this.goalGroups.removeAt(index);
  }

  save() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.getRawValue();
    
    const payload = {
      competitionId: formValue.competitionId!,
      opponentId: formValue.opponentId!,
      date: new Date(formValue.date!).toISOString(),
      stadium: formValue.stadium!,
      isHome: formValue.isHome!,
      homeScore: formValue.isHome ? (formValue.pelotasScore || 0) : (formValue.opponentScore || 0),
      awayScore: formValue.isHome ? (formValue.opponentScore || 0) : (formValue.pelotasScore || 0),
      status: formValue.status!,
      goals: formValue.goals as MatchGoal[],
      transmissionUrl: formValue.transmissionUrl || undefined
    };

    const request = this.isNew() 
      ? this.matchesApi.createMatch(payload)
      : this.matchesApi.updateMatch(this.matchId!, payload);

    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.toast.showSuccess(this.isNew() ? 'Jogo agendado com sucesso!' : 'Jogo atualizado!');
        this.router.navigate(['/admin/jogos']);
      },
      error: (err) => this.toast.showApiError(err, 'Erro ao salvar jogo')
    });
  }

  finishMatch() {
    this.showFinishConfirm.set(false);
    this.loading.set(true);
    
    const formValue = this.form.getRawValue();
    const pelotasScore = formValue.pelotasScore || 0;
    const opponentScore = formValue.opponentScore || 0;
    const opponentName = this.teams().find(t => t.id === formValue.opponentId)?.name || 'Adversário';

    this.matchesApi.finishMatch(this.matchId!).subscribe({
        next: () => {
            const title = `PÓS-JOGO: ${pelotasScore} X ${opponentScore} - Pelotas vs ${opponentName}`;
            const queryParams = { 
                title, 
                categories: 'Pós-Jogo, Futebol Profissional',
                tags: 'gauchão, lobo, placar'
            };
            this.toast.showSuccess('Jogo finalizado! Redirecionando para as notícias...');
            this.router.navigate(['/admin/news/editor/new'], { queryParams });
        },
        error: (err) => {
            this.toast.showApiError(err, 'Erro ao finalizar jogo');
            this.loading.set(false);
        }
    });
  }
}
