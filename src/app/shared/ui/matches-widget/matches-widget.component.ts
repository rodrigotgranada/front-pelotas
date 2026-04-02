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
        <a [routerLink]="['/jogos', match.id]" class="group bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40 block transition-all hover:scale-[1.02] active:scale-100 hover:shadow-indigo-500/30">
          <!-- Background Decorativo -->
          <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-50 transition-all group-hover:opacity-70"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-8">
              @if (match.status === 'LIVE') {
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 bg-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500 animate-pulse">AO VIVO</span>
                </div>
              } @else {
                <span class="px-3 py-1 bg-indigo-700/50 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">Próxima Partida</span>
              }
            </div>

            <div class="flex items-center justify-between gap-4">
               <!-- Pelotas -->
               <div class="flex flex-col items-center gap-3 flex-1">
                 <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                   <img [src]="appSettings.badgeUrl() || '/assets/placeholder-team.png'" appFallbackImg="team" class="w-full h-full object-contain drop-shadow-lg">
                 </div>
                 <span class="text-sm font-black uppercase tracking-tighter">PELOTAS</span>
               </div>

               <!-- Meio / VS ou Placar -->
               <div class="flex flex-col items-center gap-1 min-w-[100px]">
                 @if (match.status === 'LIVE') {
                   <div class="flex items-center gap-3">
                     <span class="text-4xl font-black tabular-nums">{{ match.isHome ? match.homeScore : match.awayScore }}</span>
                     <span class="text-xl font-bold text-indigo-400 italic">X</span>
                     <span class="text-4xl font-black tabular-nums">{{ match.isHome ? match.awayScore : match.homeScore }}</span>
                   </div>
                   @if (match.transmissionUrl) {
                      <a [href]="match.transmissionUrl" target="_blank" class="px-2 py-0.5 bg-indigo-600 rounded text-[8px] font-black uppercase text-white tracking-widest mt-2 hover:bg-indigo-700 transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        Assistir Ao Vivo
                      </a>
                   } @else {
                      <span class="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-2 animate-pulse font-mono">Em Andamento</span>
                   }
                 } @else {
                   <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest">{{ match.date | date:'dd/MM/yyyy' }}</span>
                   <span class="text-3xl font-black italic">VS</span>
                   <span class="text-xs font-bold text-indigo-400 capitalize">{{ match.stadium }}</span>
                 }
               </div>

               <!-- Adversário -->
               <div class="flex flex-col items-center gap-3 flex-1">
                 <div class="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-center transition-transform group-hover:scale-110">
                   <img [src]="getOpponentLogo(match)" appFallbackImg="team" class="w-full h-full object-contain drop-shadow-lg">
                 </div>
                 <span class="text-sm font-black uppercase tracking-tighter truncate max-w-full text-center">
                    {{ getOpponentName(match) }}
                 </span>
               </div>
            </div>
            
            <div class="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
               <span class="text-[10px] font-black uppercase text-indigo-300 tracking-widest">{{ getCompetitionName(match) }}</span>
               <span class="w-1 h-1 bg-indigo-500 rounded-full"></span>
               <span class="text-[10px] font-black uppercase text-indigo-300 tracking-widest">
                  @if (match.status === 'LIVE') {
                     {{ match.stadium }} (Ao Vivo)
                  } @else {
                     {{ match.date | date:'HH:mm' }}
                  }
               </span>
            </div>
          </div>
        </a>
      } @else {
        <div class="bg-indigo-900 rounded-[32px] p-8 text-white flex items-center justify-center min-h-[300px]">
           <p class="py-10 text-center text-indigo-400 font-bold italic text-sm">
              Nenhum jogo agendado no momento.
           </p>
        </div>
      }

      <!-- Último Resultado -->
      @if (lastResult(); as result) {
        <a [routerLink]="['/jogos', result.id]" class="group bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 flex flex-col transition-all hover:scale-[1.02] active:scale-100 hover:shadow-indigo-100/50">
          <div class="flex items-center justify-between mb-8">
              <span class="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">Último Resultado</span>
              <span class="text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">Detalhes do Jogo</span>
          </div>

          <div class="flex-1 flex items-center justify-between gap-4">
             <!-- Pelotas -->
             <div class="flex flex-col items-center gap-2 flex-1">
                 <img [src]="appSettings.badgeUrl() || '/assets/placeholder-team.png'" appFallbackImg="team" class="w-12 h-12 object-contain transition-transform group-hover:scale-110">
                <span class="text-xs font-black text-slate-400">PEL</span>
             </div>

             <!-- Placar -->
             <div class="flex items-center gap-6">
                <span class="text-5xl font-black text-slate-900">{{ result.isHome ? result.homeScore : result.awayScore }}</span>
                <div class="flex flex-col items-center text-slate-200 font-black italic">
                   <span class="text-indigo-500">X</span>
                </div>
                <span class="text-5xl font-black text-slate-900">{{ result.isHome ? result.awayScore : result.homeScore }}</span>
             </div>

             <!-- Adversário -->
             <div class="flex flex-col items-center gap-2 flex-1 text-center">
                <img [src]="getOpponentLogo(result)" appFallbackImg="team" class="w-12 h-12 object-contain transition-transform group-hover:scale-110">
                <span class="text-xs font-black text-slate-400 uppercase">{{ getOpponentShortName(result) }}</span>
             </div>
          </div>

          <div class="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
             @for (goal of result.goals; track $index) {
                <div class="flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                   <span class="text-[10px] font-bold text-slate-500">{{ goal.scorer }} ({{ goal.minute }}')</span>
                </div>
             }
          </div>
        </a>
      } @else {
        <div class="bg-white border border-slate-200 rounded-[32px] p-8 flex items-center justify-center min-h-[300px]">
           <div class="text-slate-300 font-bold italic text-sm py-10">
              Nenhum resultado anterior.
           </div>
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
