import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../../core/services/matches-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { Match, MatchGoal, Team, Competition } from '../../../../core/models/match.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-match-live',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div class="max-w-4xl mx-auto flex flex-col gap-8">
        
        <!-- Header -->
        <header class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <a routerLink="/admin/jogos" class="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </a>
            <div>
              <h1 class="text-xl font-black uppercase tracking-tighter">War Room: Placar ao Vivo</h1>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">{{ competitionName() }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
             @if (match()?.status === 'SCHEDULED') {
               <button (click)="changeStatus('LIVE')" class="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all">Iniciar Partida</button>
             } @else if (match()?.status === 'LIVE') {
               <button (click)="finishMatch()" class="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">Finalizar Partida</button>
               <div class="flex items-center gap-2 px-3 py-1.5 bg-rose-500/20 border border-rose-500/50 rounded-full animate-pulse">
                  <div class="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span class="text-[10px] font-black uppercase text-rose-400">AO VIVO</span>
               </div>
             }
          </div>
        </header>

        <!-- Placar Central -->
        <main class="bg-slate-800 rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
           
           <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              <!-- Pelotas -->
              <div class="flex flex-col items-center gap-6 flex-1 order-2 md:order-1">
                 <div class="w-24 h-24 bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center justify-center">
                    <img src="https://s.sde.globo.com/media/organizations/2019/01/03/Pelotas-01.svg" class="w-full h-full object-contain">
                 </div>
                 <span class="text-lg font-black uppercase tracking-widest">PELOTAS</span>
                 <button (click)="openGoalModal('PELOTAS')" class="w-full py-4 bg-white/5 hover:bg-indigo-600 text-white border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all group">
                    <span class="group-hover:scale-110 inline-block transition-transform">+ GOL PELOTAS</span>
                 </button>
              </div>

              <!-- Placar Numérico -->
              <div class="flex items-center gap-4 md:gap-8 order-1 md:order-2">
                 <div class="text-[120px] md:text-[160px] font-black leading-none tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {{ match()?.isHome ? match()?.homeScore : match()?.awayScore }}
                 </div>
                 <div class="text-4xl md:text-6xl font-black text-slate-600 italic">X</div>
                 <div class="text-[120px] md:text-[160px] font-black leading-none tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    {{ match()?.isHome ? match()?.awayScore : match()?.homeScore }}
                 </div>
              </div>

              <!-- Adversário -->
              <div class="flex flex-col items-center gap-6 flex-1 order-3">
                 <div class="w-24 h-24 bg-white/5 rounded-3xl p-4 border border-white/10 flex items-center justify-center">
                    <img [src]="opponentLogo()" class="w-full h-full object-contain">
                 </div>
                 <span class="text-lg font-black uppercase tracking-widest truncate max-w-full">{{ opponentName() }}</span>
                 <button (click)="openGoalModal('OPPONENT')" class="w-full py-4 bg-white/5 hover:bg-rose-600 text-white border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all group">
                    <span class="group-hover:scale-110 inline-block transition-transform">+ GOL ADV</span>
                 </button>
              </div>
           </div>
        </main>

        <!-- Cronologia de Gols -->
        <section class="space-y-6">
           <h3 class="text-sm font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4">
              Cronologia da Partida
              <div class="h-px bg-white/5 flex-1"></div>
           </h3>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (goal of (match()?.goals || []); track $index) {
                <div class="bg-slate-800/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:bg-slate-800 transition-all">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-indigo-400">
                      {{ goal.minute }}'
                    </div>
                    <div>
                      <p class="font-black text-sm uppercase">{{ goal.scorer }}</p>
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ goal.team === 'PELOTAS' ? 'Pelotas' : opponentName() }}</p>
                    </div>
                  </div>
                  <button (click)="removeGoal($index)" class="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              } @empty {
                <div class="col-span-full py-12 text-center text-slate-600 italic font-bold">Aguardando bola rolar...</div>
              }
           </div>
        </section>
      </div>

      <!-- Modal de Gol Rápido -->
      @if (showGoalModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div class="bg-slate-800 border border-white/10 p-8 rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 class="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                 ⚽ Registrar Gol para o {{ selectedTeam() === 'PELOTAS' ? 'Pelotas' : 'Adversário' }}
              </h2>
              
              <form [formGroup]="goalForm" (ngSubmit)="saveGoal()" class="space-y-6">
                 <div class="grid grid-cols-3 gap-4 text-white">
                    <div class="space-y-2">
                       <label class="text-[10px] font-black text-slate-500 uppercase">Minuto</label>
                       <input type="number" formControlName="minute" class="w-full bg-slate-900 border-white/10 rounded-xl p-3 font-black text-center text-xl focus:ring-indigo-500" placeholder="00" autofocus>
                    </div>
                    <div class="col-span-2 space-y-2">
                       <label class="text-[10px] font-black text-slate-500 uppercase">Marcador (Nome)</label>
                       <input type="text" formControlName="scorer" class="w-full bg-slate-900 border-white/10 rounded-xl p-3 font-bold focus:ring-indigo-500" placeholder="Nome do jogador">
                    </div>
                 </div>

                 <div class="flex gap-4 pt-4 text-white">
                    <button type="button" (click)="showGoalModal.set(false)" class="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Cancelar</button>
                    <button type="submit" [disabled]="goalForm.invalid || loading()" class="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20">Registrar Gol</button>
                 </div>
              </form>
           </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMatchLiveComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly matchesApi = inject(MatchesApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly match = signal<Match | null>(null);
  readonly loading = signal(false);
  readonly showGoalModal = signal(false);
  readonly selectedTeam = signal<'PELOTAS' | 'OPPONENT'>('PELOTAS');

  readonly goalForm = this.fb.group({
    minute: [null as number | null, [Validators.required, Validators.min(0), Validators.max(130)]],
    scorer: ['', Validators.required]
  });

  readonly competitionName = computed(() => {
    const comp = this.match()?.competitionId;
    return typeof comp === 'string' ? 'Competição' : (comp as Competition)?.name;
  });

  readonly opponentName = computed(() => {
    const team = this.match()?.opponentId;
    return typeof team === 'string' ? 'Adversário' : (team as Team)?.name;
  });

  readonly opponentLogo = computed(() => {
    const team = this.match()?.opponentId;
    return typeof team === 'string' ? null : (team as Team)?.logoUrl;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.matchesApi.getMatch(id).subscribe({
      next: (data) => {
        this.match.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao carregar partida');
        this.router.navigate(['/admin/jogos']);
      }
    });
  }

  openGoalModal(team: 'PELOTAS' | 'OPPONENT') {
    this.selectedTeam.set(team);
    this.goalForm.reset({ team: team as any } as any);
    this.showGoalModal.set(true);
  }

  saveGoal() {
    if (this.goalForm.invalid || !this.match()) return;

    const currentMatch = this.match()!;
    const newGoal: MatchGoal = {
      minute: this.goalForm.value.minute!,
      scorer: this.goalForm.value.scorer!,
      team: this.selectedTeam()
    };

    const goals = [...(currentMatch.goals || []), newGoal];
    this.updateMatchData({ goals });
    this.showGoalModal.set(false);
  }

  removeGoal(index: number) {
    if (!confirm('Remover este gol?') || !this.match()) return;
    const goals = [...(this.match()!.goals || [])];
    goals.splice(index, 1);
    this.updateMatchData({ goals });
  }

  changeStatus(status: string) {
    this.updateMatchData({ status: status as any });
  }

  private updateMatchData(data: { goals?: MatchGoal[], status?: any }) {
    const current = this.match();
    if (!current) return;

    this.loading.set(true);
    
    // Calculate new scores from goals if goals are being updated
    let homeScore = current.homeScore;
    let awayScore = current.awayScore;

    if (data.goals) {
      const pelotasG = data.goals.filter(g => g.team === 'PELOTAS').length;
      const opponentG = data.goals.filter(g => g.team === 'OPPONENT').length;
      homeScore = current.isHome ? pelotasG : opponentG;
      awayScore = current.isHome ? opponentG : pelotasG;
    }

    const payload = {
      competitionId: typeof current.competitionId === 'string' ? current.competitionId : (current.competitionId as Competition).id,
      opponentId: typeof current.opponentId === 'string' ? current.opponentId : (current.opponentId as Team).id,
      date: current.date,
      stadium: current.stadium,
      isHome: current.isHome,
      homeScore,
      awayScore,
      status: data.status || current.status,
      goals: data.goals || current.goals,
      ticketsUrl: current.ticketsUrl
    };

    this.matchesApi.updateMatch(current.id, payload as any)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updated) => {
          this.match.set(updated);
          this.toast.showSuccess('Placar atualizado!');
        },
        error: (err) => this.toast.showApiError(err, 'Erro ao atualizar')
      });
  }

  finishMatch() {
    if (!confirm('Deseja finalizar o jogo e criar o relato?')) return;
    
    this.loading.set(true);
    this.matchesApi.finishMatch(this.match()!.id).subscribe({
      next: () => {
        const m = this.match()!;
        const pScore = m.isHome ? m.homeScore : m.awayScore;
        const oScore = m.isHome ? m.awayScore : m.homeScore;
        const oName = this.opponentName();
        
        const title = `PÓS-JOGO: ${pScore} X ${oScore} - Pelotas vs ${oName}`;
        this.router.navigate(['/admin/news/editor/new'], { 
          queryParams: { title, categories: 'Pós-Jogo' } 
        });
      },
      error: () => this.loading.set(false)
    });
  }
}
