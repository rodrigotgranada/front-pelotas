import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../core/services/matches-api.service';
import { Match, Team, Competition } from '../../../core/models/match.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { FallbackImgDirective } from '../../../shared/directives/fallback-img.directive';
import { SocketService } from '../../../core/services/socket.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';

@Component({
  selector: 'app-match-details',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, DatePipe, FallbackImgDirective],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 font-sans selection:bg-amber-400 selection:text-slate-900 pb-20 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none z-0"></div>

      @if (loading()) {
        <div class="fixed inset-0 z-[100] bg-indigo-950/40 backdrop-blur-md flex items-center justify-center">
           <app-spinner size="lg" />
        </div>
      }

      <!-- Barra de Resumo Topo (Destaque Mobile) -->
      <div class="lg:hidden bg-slate-950/60 backdrop-blur-md border-b border-white/5 py-3 px-4 relative z-30">
        <div class="flex items-center justify-between gap-4">
          <!-- Lado Esquerdo: Local (Prioridade de Espaço) -->
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400 shrink-0"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="12" r="3"/></svg>
            <span class="text-[9px] font-black text-white/80 uppercase tracking-widest truncate italic">{{ match()?.stadium }}</span>
          </div>

          <!-- Lado Direito: Data e Hora unificados -->
          <div class="flex items-center gap-2 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y2="4" y1="2"/><line x1="8" y2="4" y1="2"/><line x1="3" y2="10" y1="10"/></svg>
            <span class="text-[9px] font-black text-white/60 uppercase tracking-widest font-mono italic">{{ match()?.date | date:'dd/MM/yy HH:mm' }}</span>
          </div>
        </div>
      </div>

      <!-- Header Seccional: O Estádio Digital Dinâmico -->
      <div class="bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 pt-16 lg:pt-24 pb-20 lg:pb-28 px-4 text-center relative overflow-hidden group border-b border-white/5">
        <!-- Campo de Futebol Realista (Planta Baixa - Sintonizada) -->
        <div class="absolute inset-0 opacity-20 pointer-events-none">
          <!-- Linhas de Fundo e Laterais (Contorno) -->
          <div class="absolute inset-8 border border-white/30"></div>
          
          <!-- Linha Central -->
          <div class="absolute top-0 left-1/2 h-full w-px bg-white/30"></div>
          
          <!-- Círculo Central -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border border-white/30 rounded-full"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full"></div>

          <!-- Áreas (Lado Esquerdo - Pelotas) -->
          <div class="absolute top-1/2 left-8 -translate-y-1/2 w-36 h-72 border border-white/20 border-l-0"></div>
          <div class="absolute top-1/2 left-8 -translate-y-1/2 w-14 h-36 border border-white/20 border-l-0"></div>

          <!-- Áreas (Lado Direito - Adversário) -->
          <div class="absolute top-1/2 right-8 -translate-y-1/2 w-36 h-72 border border-white/20 border-r-0"></div>
          <div class="absolute top-1/2 right-8 -translate-y-1/2 w-14 h-36 border border-white/20 border-r-0"></div>
        </div>

        <!-- Micro-animação: A Bola Rola -->
        <div class="absolute z-0 ball-animation opacity-30 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white" class="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 2a8 8 0 0 1 4.7 1.5l-2.4 2.4-2.3-1.1-2.3 1.1-2.4-2.4A7.9 7.9 0 0 1 12 4zm-6.5 3.1 2.4 2.4-1.1 2.3 1.1 2.3-2.4 2.4a7.9 7.9 0 0 1 0-9.4zm3.1 9.4 2.4-2.4 2.3 1.1 2.3-1.1 2.4 2.4a7.9 7.9 0 0 1-9.4 0zm9.4-3.1-2.4-2.4 1.1-2.3-1.1-2.3 2.4-2.4a7.9 7.9 0 0 1 0 9.4zM12 14.3l-2.1-1.1.1-2.4 2-1.1 2 1.1.1 2.4-2.1 1.1z"/>
          </svg>
        </div>
        
        <div class="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-6 lg:gap-8">
           <!-- Status e Competição -->
           <div class="flex flex-col items-center gap-3">
              <span class="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] italic">{{ getCompetitionName() }}</span>
              @if (match()?.status === 'LIVE') {
                <span class="px-5 py-2 bg-rose-600/20 rounded-xl text-[10px] font-black uppercase text-rose-400 tracking-widest border border-rose-500/40 animate-pulse shadow-lg shadow-rose-900/20 italic">AO VIVO</span>
              } @else if (match()?.status === 'FINISHED') {
                <span class="px-5 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-slate-400 tracking-widest border border-white/10 italic">Encerrada</span>
              } @else {
                 <span class="px-5 py-2 bg-indigo-700/20 rounded-xl text-[10px] font-black uppercase text-indigo-300 tracking-widest border border-indigo-500/20 italic">Programada</span>
              }
           </div>

           <!-- Placar Central -->
           <div class="flex items-center justify-center gap-4 md:gap-16 w-full">
              <!-- Pelotas -->
               <div class="flex flex-col items-center gap-4 md:gap-5 flex-1">
                 <div class="w-20 md:w-36 h-20 md:h-36 bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-8 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-[1.03] transition-transform duration-700 group-hover:border-amber-400/20">
                    <img [src]="appSettings.badgeUrl() || '/assets/placeholder-team.png'" appFallbackImg="team" class="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                 </div>
                 <h2 class="text-lg md:text-3xl font-black text-white uppercase tracking-tighter italic">PELOTAS</h2>
              </div>

              <!-- Pontuação -->
               <div class="flex items-center gap-2 md:gap-6">
                 @if (match()?.status === 'SCHEDULED') {
                    <div class="flex flex-col items-center">
                       <span class="text-4xl md:text-8xl font-black text-white/10 italic tracking-tighter">VS</span>
                    </div>
                 } @else {
                    <div class="flex flex-col items-center gap-4 md:gap-6">
                       <div class="flex items-center gap-2 md:gap-4">
                          <span class="text-5xl md:text-[10rem] font-black text-white tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] italic tracking-tighter leading-none">{{ match()?.isHome ? match()?.homeScore : match()?.awayScore }}</span>
                          <span class="text-2xl md:text-5xl font-black text-amber-400 italic mx-1 md:mx-2">x</span>
                          <span class="text-5xl md:text-[10rem] font-black text-white tabular-nums drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] italic tracking-tighter leading-none">{{ match()?.isHome ? match()?.awayScore : match()?.homeScore }}</span>
                       </div>
                        @if (match()?.transmissionUrl) {
                           <a [href]="match()?.transmissionUrl" target="_blank" class="group/button relative px-6 lg:px-8 py-2.5 lg:py-3 bg-amber-400 text-indigo-950 rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 lg:gap-3 shadow-[0_15px_40px_rgba(250,204,21,0.2)] hover:bg-white transition-all active:scale-95 italic overflow-hidden">
                              <span class="relative z-10 flex items-center gap-2 opacity-90 lg:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lg:w-4 lg:h-4"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                                {{ match()?.status === 'LIVE' ? 'Ao Vivo' : 'Transmissão Master' }}
                              </span>
                              <div class="absolute inset-0 bg-white translate-y-full group-hover/button:translate-y-0 transition-transform duration-500"></div>
                           </a>
                        }
                    </div>
                 }
              </div>

              <!-- Adversário -->
               <div class="flex flex-col items-center gap-4 md:gap-5 flex-1">
                 <div class="w-20 md:w-36 h-20 md:h-36 bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-8 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-[1.03] transition-transform duration-700 group-hover:border-white/20">
                    <img [src]="getOpponentLogo()" appFallbackImg="team" class="w-full h-full object-contain drop-shadow-2xl">
                 </div>
                 <h2 class="text-lg md:text-3xl font-black text-slate-400 uppercase tracking-tighter text-center max-w-[240px] italic">{{ getOpponentName() }}</h2>
              </div>
           </div>
        </div>
      </div>

      <!-- Detalhes e Cronologia (Ponto de Equilíbrio) -->
      <div class="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
         <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Mobile Order Priority: Cronologia follows Hero -->
            <div class="lg:col-span-2 order-1 lg:order-2">
               <div class="bg-indigo-950/40 backdrop-blur-3xl rounded-[3rem] p-8 lg:p-14 border border-white/5 shadow-2xl min-h-[440px]">
                  <h3 class="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase mb-10 lg:mb-12 flex items-center gap-5 italic">
                     Cronologia de Gols
                      <div class="h-px bg-white/5 flex-1"></div>
                  </h3>

                  @if (match()?.goals?.length) {
                     <div class="relative space-y-12 lg:space-y-14">
                        <!-- Linha Vertical -->
                         <div class="absolute left-6 md:left-[59px] top-4 bottom-4 w-px bg-white/10"></div>

                        @for (goal of (match()?.goals || []); track $index) {
                           <div class="relative flex items-center gap-6 lg:gap-16 animate-in fade-in slide-in-from-bottom-4 duration-500" [style.animation-delay]="$index * 100 + 'ms'">
                              <!-- Minuto do Gol -->
                               <div class="relative z-10 w-12 md:w-20 h-12 md:h-20 rounded-[1.5rem] bg-indigo-950/80 border-2 border-amber-400/20 shadow-[0_0_20px_rgba(250,204,21,0.1)] flex items-center justify-center font-black text-amber-400 text-sm md:text-xl italic">
                                 {{ goal.minute }}'
                              </div>

                              <div class="flex-1 flex items-center justify-between gap-4">
                                 <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                                    </div>
                                    <div>
                                       <h5 class="text-lg lg:text-xl font-black text-white uppercase leading-none mb-2 italic">{{ goal.scorer }}</h5>
                                       <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{{ goal.team === 'PELOTAS' ? 'Pelotas' : getOpponentName() }}</p>
                                    </div>
                                 </div>
                                 
                                 <img [src]="goal.team === 'PELOTAS' ? (appSettings.badgeUrl() || '/assets/placeholder-team.png') : getOpponentLogo()" 
                                       appFallbackImg="team" class="w-8 lg:w-10 h-8 lg:h-10 object-contain grayscale opacity-20 group-hover:opacity-100 transition-opacity">
                              </div>
                           </div>
                        }
                     </div>
                  } @else {
                     <div class="py-20 lg:py-24 flex flex-col items-center justify-center text-slate-600">
                         <svg class="mb-6 opacity-10" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                         <p class="font-black italic uppercase text-[10px] tracking-[0.4em] opacity-40 text-center">Nenhum marcador registrado ainda.</p>
                     </div>
                  }
               </div>
            </div>

            <!-- Sidebar Info: Lower priority on Mobile -->
            <div class="lg:col-span-1 space-y-6 order-2 lg:order-1">
               <div class="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 lg:p-10 border border-white/10 shadow-2xl">
                  <h4 class="text-[10px] font-black text-amber-400/60 uppercase tracking-[0.3em] mb-10 italic">Informações Detalhadas</h4>
                  <div class="space-y-8">
                     <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-indigo-900/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0 border border-white/5">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="12" r="3"/></svg>
                        </div>
                        <div>
                           <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Local da Partida</p>
                           <p class="font-black text-white italic tracking-tight">{{ match()?.stadium }}</p>
                        </div>
                     </div>
                     <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-indigo-900/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0 border border-white/5">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y2="4" y1="2"/><line x1="8" y2="4" y1="2"/><line x1="3" y2="10" y1="10"/></svg>
                        </div>
                        <div>
                           <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Data e Horário</p>
                           <p class="font-black text-white italic tracking-tight capitalize font-mono text-sm">{{ match()?.date | date:'dd/MM/yyyy' }} • {{ match()?.date | date:'HH:mm' }}</p>
                        </div>
                     </div>
                      <div class="flex items-start gap-4">
                         <div class="w-10 h-10 bg-indigo-900/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0 border border-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                         </div>
                         <div>
                            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Competição</p>
                            <p class="font-black text-white italic tracking-tight">{{ getCompetitionName() }}</p>
                         </div>
                      </div>
                   </div>

                   @if (match()?.newsId) {
                     <a [routerLink]="['/noticias', match()?.newsId]" class="mt-12 block w-full py-4 bg-white/5 text-amber-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-center border border-amber-400/10 hover:bg-amber-400 hover:text-indigo-950 transition-all italic shadow-xl">Ler Relato Completo</a>
                   }
               </div>
            </div>

         </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .ball-animation {
      animation: moveBall 25s infinite ease-in-out;
      filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
    }
    @keyframes moveBall {
      0% { top: 15%; left: -10%; transform: rotate(0deg) scale(0.8); opacity: 0.2; }
      25% { top: 45%; left: 30%; transform: rotate(180deg) scale(1.1); opacity: 0.4; }
      50% { top: 20%; left: 70%; transform: rotate(360deg) scale(0.9); opacity: 0.3; }
      75% { top: 65%; left: 95%; transform: rotate(540deg) scale(1.2); opacity: 0.5; }
      100% { top: 15%; left: 110%; transform: rotate(720deg) scale(0.8); opacity: 0.2; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly matchesApi = inject(MatchesApiService);
  private readonly socket = inject(SocketService);
  readonly appSettings = inject(AppSettingsService);
  
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
    if (!comp) return 'Amistoso';
    return typeof comp === 'string' ? 'Competição' : (comp as Competition)?.name || 'Competição';
  }
}
