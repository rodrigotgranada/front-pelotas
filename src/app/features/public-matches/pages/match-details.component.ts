import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../core/services/matches-api.service';
import { Match, Team, Competition } from '../../../core/models/match.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { FallbackImgDirective } from '../../../shared/directives/fallback-img.directive';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-match-details',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, DatePipe, FallbackImgDirective],
  template: `
    <div class="min-h-screen bg-slate-50 pb-20">
      @if (loading()) {
        <div class="fixed inset-0 z-50 bg-indigo-900/10 backdrop-blur-sm flex items-center justify-center">
           <app-spinner size="lg" />
        </div>
      }

      <!-- Header Seccional -->
      <div class="bg-indigo-900 pt-32 pb-24 px-4 text-center relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        
        <div class="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-12">
           <!-- Status e Competição -->
           <div class="flex flex-col items-center gap-2">
              <span class="text-xs font-black text-indigo-300 uppercase tracking-[0.3em]">{{ getCompetitionName() }}</span>
              @if (match()?.status === 'LIVE') {
                <span class="px-4 py-1.5 bg-rose-600 rounded-full text-[10px] font-black uppercase text-white tracking-widest border border-rose-500 animate-pulse shadow-lg shadow-rose-900/40">AO VIVO</span>
              } @else if (match()?.status === 'FINISHED') {
                <span class="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase text-indigo-100 tracking-widest border border-white/10 italic">Partida Encerrada</span>
              } @else {
                 <span class="px-4 py-1.5 bg-indigo-700/50 rounded-full text-[10px] font-black uppercase text-indigo-300 tracking-widest border border-indigo-500/30">Próximo Jogo</span>
              }
           </div>

           <!-- Placar Central -->
           <div class="flex items-center justify-center gap-8 md:gap-16 w-full">
              <!-- Pelotas -->
              <div class="flex flex-col items-center gap-4 flex-1">
                 <div class="w-20 md:w-32 h-20 md:h-32 bg-white/10 backdrop-blur-xl rounded-[40px] p-4 md:p-6 border border-white/20 flex items-center justify-center shadow-2xl">
                    <img src="https://s.sde.globo.com/media/organizations/2019/01/03/Pelotas-01.svg" class="w-full h-full object-contain drop-shadow-2xl">
                 </div>
                 <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Pelotas</h2>
              </div>

              <!-- Pontuação -->
              <div class="flex items-center gap-2 md:gap-4">
                 @if (match()?.status === 'SCHEDULED') {
                    <div class="flex flex-col items-center">
                       <span class="text-4xl md:text-6xl font-black text-white italic">VS</span>
                       <span class="text-xs font-bold text-indigo-400 mt-2 font-mono">{{ match()?.date | date:'dd/MM/yyyy' }} • {{ match()?.date | date:'HH:mm' }}</span>
                    </div>
                 } @else {
                    <div class="flex flex-col items-center gap-4">
                       <div class="flex items-center gap-2 md:gap-4">
                          <span class="text-7xl md:text-9xl font-black text-white tabular-nums drop-shadow-2xl">{{ match()?.isHome ? match()?.homeScore : match()?.awayScore }}</span>
                          <span class="text-3xl md:text-5xl font-black text-indigo-500 italic">X</span>
                          <span class="text-7xl md:text-9xl font-black text-white tabular-nums drop-shadow-2xl">{{ match()?.isHome ? match()?.awayScore : match()?.homeScore }}</span>
                       </div>
                       @if (match()?.transmissionUrl && match()?.status === 'LIVE') {
                          <a [href]="match()?.transmissionUrl" target="_blank" class="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all animate-bounce">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                             Assistir Transmissão Ao Vivo
                          </a>
                       }
                    </div>
                 }
              </div>

              <!-- Adversário -->
              <div class="flex flex-col items-center gap-4 flex-1">
                 <div class="w-20 md:w-32 h-20 md:h-32 bg-white/10 backdrop-blur-xl rounded-[40px] p-4 md:p-6 border border-white/20 flex items-center justify-center shadow-2xl">
                    <img [src]="getOpponentLogo()" appFallbackImg="team" class="w-full h-full object-contain drop-shadow-2xl">
                 </div>
                 <h2 class="text-xl md:text-2xl font-black text-white uppercase tracking-tighter text-center max-w-[200px]">{{ getOpponentName() }}</h2>
              </div>
           </div>
        </div>
      </div>

      <!-- Detalhes e Cronologia -->
      <div class="max-w-4xl mx-auto px-4 -mt-12 relative z-20">
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Sidebar Info -->
            <div class="lg:col-span-1 space-y-6">
               <div class="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
                  <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Informações</h4>
                  <div class="space-y-6">
                     <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="12" r="3"/></svg>
                        </div>
                        <div>
                           <p class="text-xs font-bold text-slate-500 grayscale">Local da Partida</p>
                           <p class="font-black text-slate-900">{{ match()?.stadium }}</p>
                        </div>
                     </div>
                     <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y2="4" y1="2"/><line x1="8" y2="4" y1="2"/><line x1="3" y2="10" y1="10"/></svg>
                        </div>
                        <div>
                           <p class="text-xs font-bold text-slate-500">Data e Horário</p>
                           <p class="font-black text-slate-900 capitalize font-mono">{{ match()?.date | date:'dd/MM/yyyy' }} • {{ match()?.date | date:'HH:mm' }}</p>
                        </div>
                     </div>
                     <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                        </div>
                        <div>
                           <p class="text-xs font-bold text-slate-500">Competição</p>
                           <p class="font-black text-slate-900">{{ getCompetitionName() }}</p>
                        </div>
                     </div>
                  </div>

                  @if (match()?.newsId) {
                    <a [routerLink]="['/noticias', match()?.newsId]" class="mt-8 block w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest text-center shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95">Ler Relato Completo</a>
                  }
               </div>
            </div>

            <!-- Goal Timeline -->
            <div class="lg:col-span-2">
               <div class="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 min-h-[400px]">
                  <h3 class="text-xl font-black text-slate-900 tracking-tighter uppercase mb-10 flex items-center gap-4">
                     Cronologia de Gols
                     <div class="h-px bg-slate-100 flex-1"></div>
                  </h3>

                  @if (match()?.goals?.length) {
                     <div class="relative space-y-12">
                        <!-- Linha Vertical -->
                        <div class="absolute left-6 md:left-[51px] top-4 bottom-4 w-px bg-slate-200 dashed"></div>

                        @for (goal of (match()?.goals || []); track $index) {
                           <div class="relative flex items-center gap-6 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500" [style.animation-delay]="$index * 100 + 'ms'">
                              <!-- Minuto do Gol -->
                              <div class="relative z-10 w-12 md:w-16 h-12 md:h-16 rounded-full bg-slate-50 border-2 border-white shadow-xl flex items-center justify-center font-black text-indigo-600 text-sm md:text-lg">
                                 {{ goal.minute }}'
                              </div>

                              <div class="flex-1 flex items-center justify-between gap-4">
                                 <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                                    </div>
                                    <div>
                                       <h5 class="text-lg font-black text-slate-900 uppercase leading-none mb-1">{{ goal.scorer }}</h5>
                                       <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ goal.team === 'PELOTAS' ? 'Pelotas' : getOpponentName() }}</p>
                                    </div>
                                 </div>
                                 
                                 <img [src]="goal.team === 'PELOTAS' ? 'https://s.sde.globo.com/media/organizations/2019/01/03/Pelotas-01.svg' : getOpponentLogo()" 
                                      appFallbackImg="team" class="w-8 h-8 object-contain grayscale opacity-50">
                              </div>
                           </div>
                        }
                     </div>
                  } @else {
                     <div class="py-20 flex flex-col items-center justify-center text-slate-300">
                        <svg class="mb-4 opacity-20" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                        <p class="font-bold italic uppercase text-xs tracking-widest">Nenhum marcador registrado ainda.</p>
                     </div>
                  }
               </div>
            </div>

         </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly matchesApi = inject(MatchesApiService);
  private readonly socket = inject(SocketService);
  
  readonly match = signal<Match | null>(null);
  readonly loading = signal(true);

  ngOnInit() {
    this.loadMatch();

    // Sincronização em tempo real (caso alguém mude o placar enquanto o usuário vê o detalhe)
    this.socket.onMatchUpdated().subscribe(() => {
      this.loadMatch();
    });
  }

  loadMatch() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.matchesApi.getMatch(id).subscribe({
      next: (data) => {
        this.match.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getOpponentName(): string {
    const team = this.match()?.opponentId;
    return typeof team === 'string' ? 'Adversário' : (team as Team)?.name || 'Adversário';
  }

  getOpponentLogo(): string | null {
    const team = this.match()?.opponentId;
    return typeof team === 'string' ? null : (team as Team)?.logoUrl || null;
  }

  getCompetitionName(): string {
    const comp = this.match()?.competitionId;
    return typeof comp === 'string' ? 'Competição' : (comp as Competition)?.name || 'Competição';
  }
}
