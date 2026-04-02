import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../core/services/matches-api.service';
import { Match, Team, Competition } from '../../../core/models/match.model';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { FallbackImgDirective } from '../../../shared/directives/fallback-img.directive';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent, DatePipe, FallbackImgDirective],
  template: `
    <div class="min-h-screen bg-slate-50 pb-20">
      <!-- Header Seccional -->
      <div class="bg-indigo-900 pt-32 pb-20 px-4 text-center relative overflow-hidden">
         <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div class="relative z-10 max-w-4xl mx-auto">
            <h1 class="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">Calendário de Jogos</h1>
            <p class="text-indigo-200 font-bold text-lg max-w-2xl mx-auto">Acompanhe a trajetória do Lobo em todas as competições da temporada.</p>
         </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
         <!-- Filtros por Competição -->
         <div class="flex flex-wrap justify-center gap-3 mb-10">
            <button (click)="selectedComp.set(null)" [class]="selectedComp() === null ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'" class="px-6 py-3 rounded-2xl font-black uppercase text-xs transition-all border border-transparent shadow-sm">
              Todos os Jogos
            </button>
            @for (comp of activeCompetitions(); track comp.id) {
               <button (click)="selectedComp.set(comp.id)" [class]="selectedComp() === comp.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'" class="px-6 py-3 rounded-2xl font-black uppercase text-xs transition-all border border-transparent shadow-sm">
                 {{ comp.name }}
               </button>
            }
         </div>

         @if (loading()) {
            <div class="flex justify-center py-20">
               <app-spinner size="lg" />
            </div>
         } @else {
            <div class="space-y-12">
               <!-- Jogos Futuros -->
               @if (upcomingMatches().length > 0) {
                  <section>
                    <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                       Próximos Confrontos
                       <div class="h-px bg-slate-200 flex-1"></div>
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                       @for (match of upcomingMatches(); track match.id) {
                          <a [routerLink]="['/jogos', match.id]" class="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative block">
                             <div class="flex items-center justify-between mb-6">
                                <div class="flex flex-col">
                                   <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ getCompetitionName(match) }}</span>
                                   <span class="text-xs font-bold text-slate-400 font-mono">{{ match.date | date:'dd/MM/yyyy' }}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                   @if (match.status === 'LIVE') {
                                      <span class="px-2 py-1 bg-rose-600 rounded-full text-[8px] font-black uppercase text-white animate-pulse">AO VIVO</span>
                                   }
                                   <span class="bg-slate-50 text-slate-400 text-[10px] font-black px-2 py-1 rounded border border-slate-100 uppercase tracking-widest">{{ match.stadium }}</span>
                                </div>
                             </div>

                             <div class="flex items-center justify-around gap-4 pb-4">
                                <div class="flex flex-col items-center gap-3 transition-transform group-hover:scale-110">
                                   <img src="https://s.sde.globo.com/media/organizations/2019/01/03/Pelotas-01.svg" class="w-16 h-16 object-contain">
                                   <span class="text-xs font-black text-slate-800 uppercase tracking-tighter">Pelotas</span>
                                </div>

                                <div class="flex flex-col items-center">
                                   @if (match.status === 'LIVE') {
                                      <div class="flex items-center gap-2">
                                         <span class="text-3xl font-black text-slate-900">{{ match.isHome ? match.homeScore : match.awayScore }}</span>
                                         <span class="text-xl font-bold text-indigo-500 italic">X</span>
                                         <span class="text-3xl font-black text-slate-900">{{ match.isHome ? match.awayScore : match.homeScore }}</span>
                                      </div>
                                   } @else {
                                      <span class="text-2xl font-black text-slate-900">{{ match.date | date:'HH:mm' }}</span>
                                      <span class="text-[10px] font-black text-slate-300 italic">Horário</span>
                                   }
                                </div>

                                <div class="flex flex-col items-center gap-3 transition-transform group-hover:scale-110">
                                   <img [src]="getOpponentLogo(match)" appFallbackImg="team" class="w-16 h-16 object-contain">
                                   <span class="text-xs font-black text-slate-800 uppercase tracking-tighter truncate max-w-full">
                                      {{ getOpponentName(match) }}
                                   </span>
                                </div>
                             </div>

                             <div class="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center">
                                <span class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">Ver Detalhes do Jogo</span>
                             </div>
                          </a>
                       }
                    </div>
                  </section>
               }

               <!-- Resultados Passados -->
               @if (pastMatches().length > 0) {
                  <section>
                    <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                       Resultados Anteriores
                       <div class="h-px bg-slate-200 flex-1"></div>
                    </h2>
                    <div class="space-y-4">
                       @for (match of pastMatches(); track match.id) {
                          <a [routerLink]="['/jogos', match.id]" class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-indigo-200 hover:shadow-lg transition-all relative block">
                             <div class="min-w-[100px] text-center md:text-left">
                                <p class="text-xs font-black text-slate-400 tracking-widest mb-1 font-mono">{{ match.date | date:'dd/MM/yyyy' }}</p>
                                <p class="text-[10px] font-bold text-indigo-500 uppercase">{{ getCompetitionName(match) }}</p>
                             </div>

                             <div class="flex-1 flex items-center justify-center gap-10">
                                <!-- Pelotas -->
                                <div class="flex items-center gap-4 flex-1 justify-end transition-transform group-hover:-translate-x-2">
                                   <span class="text-sm font-black text-slate-800 uppercase hidden sm:block">Pelotas</span>
                                   <img src="https://s.sde.globo.com/media/organizations/2019/01/03/Pelotas-01.svg" class="w-10 h-10 object-contain">
                                </div>

                                <!-- Placar -->
                                <div class="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                   <span class="text-3xl font-black text-slate-900">{{ match.isHome ? match.homeScore : match.awayScore }}</span>
                                   <span class="text-slate-200 font-black italic group-hover:text-indigo-200 transition-colors">X</span>
                                   <span class="text-3xl font-black text-slate-900">{{ match.isHome ? match.awayScore : match.homeScore }}</span>
                                </div>

                                <!-- Adversário -->
                                <div class="flex items-center gap-4 flex-1 transition-transform group-hover:translate-x-2">
                                   <img [src]="getOpponentLogo(match)" appFallbackImg="team" class="w-10 h-10 object-contain">
                                   <span class="text-sm font-black text-slate-800 uppercase hidden sm:block truncate">{{ getOpponentName(match) }}</span>
                                </div>
                             </div>

                             <div class="min-w-[120px] flex justify-center md:justify-end">
                                <span class="text-[10px] font-black text-indigo-600 group-hover:text-white group-hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-indigo-50 border-transparent">
                                   Ver Detalhes
                                </span>
                             </div>
                          </a>
                       }
                    </div>
                  </section>
               }
            </div>
         }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPageComponent implements OnInit {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly socket = inject(SocketService);
  
  readonly matches = signal<Match[]>([]);
  readonly competitions = signal<Competition[]>([]);
  readonly loading = signal(true);
  readonly selectedComp = signal<string | null>(null);

  readonly activeCompetitions = computed(() => this.competitions().filter(c => c.isActive));

  readonly filteredMatches = computed(() => {
    const all = this.matches();
    const compId = this.selectedComp();
    if (!compId) return all;
    return all.filter(m => {
       const mCompId = typeof m.competitionId === 'string' ? m.competitionId : (m.competitionId as Competition).id;
       return mCompId === compId;
    });
  });

  readonly upcomingMatches = computed(() => 
    this.filteredMatches().filter(m => m.status !== 'FINISHED').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );

  readonly pastMatches = computed(() => 
    this.filteredMatches().filter(m => m.status === 'FINISHED').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );

  ngOnInit() {
    this.loadData();

    // Reatualiza em tempo real
    this.socket.onMatchUpdated().subscribe(() => {
      this.loadData();
    });
  }

  loadData() {
    this.loading.set(true);
    // ForkJoin or multiple subscriptions
    this.matchesApi.listCompetitions().subscribe(comps => this.competitions.set(comps));
    this.matchesApi.listMatches().subscribe({
        next: (matches) => {
            this.matches.set(matches);
            this.loading.set(false);
        },
        error: () => {
            this.loading.set(false);
        }
    });
  }

  getOpponentName(match: Match): string {
    if (typeof match.opponentId === 'string') return 'Adversário';
    return (match.opponentId as Team).name;
  }

  getOpponentLogo(match: Match): string | null {
    if (typeof match.opponentId === 'string') return null;
    return (match.opponentId as Team).logoUrl || null;
  }

  getCompetitionName(match: Match): string {
    if (!match.competitionId) return 'Amistoso';
    if (typeof match.competitionId === 'string') return '';
    return (match.competitionId as Competition).name;
  }
}
