import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../core/services/matches-api.service';
import { Match, Team, Competition } from '../../../core/models/match.model';
import { FallbackImgDirective } from '../../directives/fallback-img.directive';
import { SocketService } from '../../../core/services/socket.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';

@Component({
  selector: 'app-matches-widget',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FallbackImgDirective],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <!-- Próximo Jogo / AO VIVO -->
       @if (nextMatch(); as match) {
        <a [routerLink]="['/jogos', match.id]" class="group bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl block transition-all hover:scale-[1.01] active:scale-100 hover:border-amber-400/20">
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/5 rounded-full blur-[80px]"></div>

          <div class="relative z-10">
            <div class="flex items-center justify-between mb-6 md:mb-10">
              @if (match.status === 'LIVE') {
                <div class="flex items-center gap-2">
                  <span class="px-4 py-1.5 bg-rose-600/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/40 text-rose-400 animate-pulse italic">AO VIVO</span>
                </div>
              } @else {
                <span class="px-4 py-1.5 bg-amber-400/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-400/20 text-amber-400 italic">Próxima Batalha</span>
              }
              <span class="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] font-mono">Live Widget V2</span>
            </div>

            <div class="flex items-center justify-between gap-4">
               <!-- Pelotas -->
               <div class="flex flex-col items-center gap-3 flex-1">
                 <div class="w-16 h-16 md:w-24 md:h-24 bg-slate-950/40 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-amber-400/30">
                   <img [src]="appSettings.badgeUrl() || '/assets/placeholder-team.png'" appFallbackImg="team" class="w-full h-full object-contain drop-shadow-lg">
                 </div>
                 <span class="text-xs md:text-sm font-black uppercase tracking-tighter italic text-amber-400/80">PELOTAS</span>
               </div>

               <!-- Meio / VS ou Placar -->
               <div class="flex flex-col items-center gap-2 min-w-[100px]">
                 @if (match.status === 'LIVE') {
                   <div class="flex items-center gap-4">
                     <span class="text-4xl md:text-6xl font-black tabular-nums italic tracking-tighter">{{ match.isHome ? match.homeScore : match.awayScore }}</span>
                     <span class="text-xl font-black text-amber-400 italic">x</span>
                     <span class="text-4xl md:text-6xl font-black tabular-nums italic tracking-tighter">{{ match.isHome ? match.awayScore : match.homeScore }}</span>
                   </div>
                   @if (match.transmissionUrl) {
                      <a [href]="match.transmissionUrl" target="_blank" class="px-3 py-1 bg-amber-400 text-indigo-950 rounded-lg text-[9px] font-black uppercase tracking-widest mt-4 hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20 italic">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        Sintonizar
                      </a>
                   } @else {
                      <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2 animate-pulse italic">Andamento...</span>
                   }
                 } @else {
                    <span class="text-[10px] font-black text-amber-400/60 uppercase tracking-widest mb-1">{{ match.date | date:'dd/MM' }}</span>
                    <span class="text-4xl font-black italic tracking-tighter text-white/20">VS</span>
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{{ match.stadium }}</span>
                 }
               </div>

               <!-- Adversário -->
               <div class="flex flex-col items-center gap-3 flex-1">
                 <div class="w-16 h-16 md:w-24 md:h-24 bg-slate-950/40 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-amber-400/30">
                   <img [src]="getOpponentLogo(match)" appFallbackImg="team" class="w-full h-full object-contain drop-shadow-lg">
                 </div>
                 <span class="text-xs md:text-sm font-black uppercase tracking-tighter truncate max-w-full text-center italic text-slate-400">
                    {{ getOpponentName(match) }}
                 </span>
               </div>
            </div>
            
            <div class="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4">
               <span class="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic">{{ getCompetitionName(match) }}</span>
               <span class="w-1 h-1 bg-amber-400/30 rounded-full"></span>
               <span class="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] italic">
                  @if (match.status === 'LIVE') {
                     {{ match.stadium }} (Ao Vivo)
                  } @else {
                     Concentração {{ match.date | date:'HH:mm' }}
                  }
               </span>
            </div>
          </div>
        </a>
      } @else {
        <div class="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex items-center justify-center min-h-[220px]">
           <p class="text-center text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic opacity-40">
              Silêncio na Arena. Nenhum jogo agendado.
           </p>
        </div>
      }

      <!-- Último Resultado -->
      @if (lastResult(); as result) {
        <a [routerLink]="['/jogos', result.id]" class="group bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-6 md:p-10 flex flex-col transition-all hover:scale-[1.01] active:scale-100 shadow-2xl hover:border-white/10">
          <div class="flex items-center justify-between mb-10">
              <span class="px-4 py-1.5 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5 italic">Resultado Anterior</span>
              <span class="text-[10px] font-black text-amber-400 uppercase tracking-widest italic group-hover:translate-x-1 transition-transform">Ver Detalhes →</span>
          </div>

          <div class="flex-1 flex items-center justify-between gap-4">
             <!-- Pelotas -->
             <div class="flex flex-col items-center gap-2 flex-1">
                 <img [src]="appSettings.badgeUrl() || '/assets/placeholder-team.png'" appFallbackImg="team" class="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform group-hover:scale-105">
                 <span class="text-[10px] font-black text-amber-400/60 tracking-widest italic">PELOTAS</span>
             </div>

             <!-- Placar -->
             <div class="flex items-center gap-4 md:gap-8">
                 <span class="text-4xl md:text-6xl font-black text-white italic tracking-tighter">{{ result.isHome ? result.homeScore : result.awayScore }}</span>
                 <div class="flex flex-col items-center text-slate-800 font-black italic">
                    <span class="text-amber-400/40 font-black italic text-xl">x</span>
                 </div>
                 <span class="text-4xl md:text-6xl font-black text-white italic tracking-tighter">{{ result.isHome ? result.awayScore : result.homeScore }}</span>
             </div>

             <!-- Adversário -->
             <div class="flex flex-col items-center gap-2 flex-1 text-center">
                 <img [src]="getOpponentLogo(result)" appFallbackImg="team" class="w-12 h-12 md:w-16 md:h-16 object-contain transition-transform group-hover:scale-105">
                 <span class="text-[10px] font-black text-slate-500 tracking-widest uppercase italic truncate max-w-full px-2">{{ getOpponentShortName(result) }}</span>
             </div>
          </div>

          <div class="mt-8 pt-6 border-t border-white/5 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-40 group-hover:opacity-80 transition-opacity">
             @for (goal of result.goals; track $index) {
                <div class="flex items-center gap-1">
                   <div class="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.4)]"></div>
                   <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{{ goal.scorer }} ({{ goal.minute }}')</span>
                </div>
             }
          </div>
        </a>
      } @else {
        <div class="bg-slate-950/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 flex items-center justify-center min-h-[220px]">
           <p class="text-center text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] italic opacity-40">
              Arquivos Vazios. Sem resultados.
           </p>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchesWidgetComponent implements OnInit {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly socket = inject(SocketService);
  readonly appSettings = inject(AppSettingsService);
  
  readonly nextMatch = signal<Match | null>(null);
  readonly lastResult = signal<Match | null>(null);

  ngOnInit() {
    this.reloadData();
    
    // Reatualiza em tempo real
    this.socket.onMatchUpdated().subscribe(() => {
      this.reloadData();
    });
  }

  private reloadData() {
    this.matchesApi.getNextMatch().subscribe(m => this.nextMatch.set(m));
    this.matchesApi.getLastResult().subscribe(m => this.lastResult.set(m));
  }

  getOpponentName(match: Match): string {
    if (!match.opponentId || typeof match.opponentId === 'string') return 'Adversário';
    return (match.opponentId as Team).name || 'Adversário';
  }

  getOpponentShortName(match: Match): string {
    if (!match.opponentId || typeof match.opponentId === 'string') return 'ADV';
    const team = match.opponentId as Team;
    return team.shortName || team.name?.substring(0, 3).toUpperCase() || 'ADV';
  }

  getOpponentLogo(match: Match): string | null {
    if (!match.opponentId || typeof match.opponentId === 'string') return null;
    return (match.opponentId as Team)?.logoUrl || null;
  }

  getCompetitionName(match: Match): string {
    if (!match.competitionId || typeof match.competitionId === 'string') return 'Campeonato';
    return (match.competitionId as Competition).name || 'Campeonato';
  }
}
