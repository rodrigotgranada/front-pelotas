import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { MembershipInterestApiService } from '../../../../core/services/membership-interest-api.service';
import { MatchesApiService } from '../../../../core/services/matches-api.service';
import { LogsApiService } from '../../../../core/services/logs-api.service';
import { UsersApiService } from '../../../../core/services/users-api.service';
import { Match } from '../../../../core/models/match.model';
import { ActivityLog } from '../../../../core/models/log.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 min-h-full animate-in fade-in duration-700 pb-10">
      <!-- Dashboard Header -->
      <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
        <div>
          <h1 class="text-4xl font-black tracking-tighter text-indigo-950 uppercase italic leading-none">Arena de Comando</h1>
          <p class="mt-4 text-indigo-900/60 font-bold uppercase tracking-widest text-[10px] italic flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Centro de Inteligência Estratégica
          </p>
        </div>
        <div class="flex items-center gap-3 bg-white/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm">
           <span class="text-[9px] font-black text-indigo-950/60 uppercase tracking-widest italic">Sincronia:</span>
           <span class="text-[10px] font-black text-indigo-950 uppercase italic">{{ lastSync() | date:'HH:mm:ss' }}</span>
        </div>
      </header>

      <!-- KPI Grid (Top Row) - Clickable cards -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Notícias -->
        <a routerLink="/admin/news" class="rounded-3xl border border-white/50 bg-white/95 backdrop-blur-xl p-5 shadow-xl shadow-indigo-950/5 group hover:scale-[1.03] hover:shadow-indigo-950/10 transition-all duration-300">
          <div class="flex items-center gap-3 mb-4 text-left">
             <div class="h-9 w-9 rounded-xl bg-indigo-950 flex items-center justify-center text-amber-400 shadow-lg group-hover:rotate-6 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
             </div>
             <p class="text-[9px] font-black text-indigo-950/40 uppercase tracking-[0.2em] italic">Matérias</p>
          </div>
          <div class="flex items-end gap-2 text-left">
            <span class="text-4xl font-black tracking-tighter text-indigo-950 leading-none italic">{{ newsCount() }}</span>
            <span class="text-[8px] font-black text-indigo-900/60 bg-indigo-950/5 px-2 py-0.5 rounded-lg uppercase italic mb-0.5">Ativas</span>
          </div>
        </a>

        <!-- Sócios Pendentes -->
        <a routerLink="/admin/membership/interests" class="rounded-3xl border border-white/50 bg-white/95 backdrop-blur-xl p-5 shadow-xl shadow-indigo-950/5 group hover:scale-[1.03] hover:shadow-indigo-950/10 transition-all duration-300">
          <div class="flex items-center gap-3 mb-4 text-left">
             <div class="h-9 w-9 rounded-xl bg-amber-400 flex items-center justify-center text-indigo-950 shadow-lg group-hover:rotate-6 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <p class="text-[9px] font-black text-indigo-950/40 uppercase tracking-[0.2em] italic">Interessados</p>
          </div>
          <div class="flex items-end gap-2 text-left">
            <span class="text-4xl font-black tracking-tighter leading-none italic text-indigo-600">
              {{ pendingInterests() }}
            </span>
            <span class="text-[8px] font-black text-white px-2 py-0.5 rounded-lg uppercase italic mb-0.5 tracking-widest bg-indigo-600 shadow-md">
              {{ pendingInterests() > 0 ? 'Novos' : 'Safe' }}
            </span>
          </div>
        </a>

        <!-- Usuários Totais -->
        <a routerLink="/admin/users/time" class="rounded-3xl border border-white/50 bg-white/95 backdrop-blur-xl p-5 shadow-xl shadow-indigo-950/5 group hover:scale-[1.03] hover:shadow-indigo-950/10 transition-all duration-300">
          <div class="flex items-center gap-3 mb-4 text-left">
             <div class="h-9 w-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="4"/></svg>
             </div>
             <p class="text-[9px] font-black text-indigo-950/40 uppercase tracking-[0.2em] italic">Alcateia Total</p>
          </div>
          <div class="flex items-end gap-2 text-left">
            <span class="text-4xl font-black tracking-tighter text-indigo-950 leading-none italic">{{ userCount() }}</span>
            <span class="text-[8px] font-black text-indigo-900/60 bg-indigo-950/5 px-2 py-0.5 rounded-lg uppercase italic mb-0.5">Contas</span>
          </div>
        </a>

        <!-- Batalhas Agendadas -->
        <a routerLink="/admin/matches" class="rounded-3xl border border-white/50 bg-white/95 backdrop-blur-xl p-5 shadow-xl shadow-indigo-950/5 group hover:scale-[1.03] hover:shadow-indigo-950/10 transition-all duration-300">
          <div class="flex items-center gap-3 mb-4 text-left">
             <div class="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
             </div>
             <p class="text-[9px] font-black text-indigo-950/40 uppercase tracking-[0.2em] italic">Jogos</p>
          </div>
          <div class="flex items-end gap-2 text-left">
            <span class="text-4xl font-black tracking-tighter text-indigo-950 leading-none italic">{{ matchesCount() }}</span>
            <span class="text-[8px] font-black text-indigo-900/60 bg-indigo-950/5 px-2 py-0.5 rounded-lg uppercase italic mb-0.5">Agenda</span>
          </div>
        </a>
      </div>

      <!-- Main Section: Game & Compact Logs -->
      <div class="grid gap-6 lg:grid-cols-5">
        
        <!-- Próxima Batalha (Largo) -->
        <div class="lg:col-span-3 rounded-[40px] border border-white/50 bg-indigo-950 p-8 shadow-2xl relative overflow-hidden group min-h-[340px] flex flex-col">
           <div class="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700">
             <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
           </div>
           
           <div class="relative z-10 text-left h-full flex flex-col">
              <header class="flex items-center justify-between mb-8">
                 <span class="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] italic flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Próxima Batalha
                 </span>
                 <a routerLink="/admin/matches" class="text-[9px] font-black text-white/40 hover:text-amber-400 uppercase tracking-widest italic transition-colors">Gerenciar Agenda</a>
              </header>
              
              @if (nextMatch()) {
                <div class="flex-1 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                   <div class="flex items-center gap-8 order-2 lg:order-1">
                      <div class="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-4">
                         <img src="/assets/logo-pelotas.png" class="w-full h-auto drop-shadow-xl" alt="EC Pelotas">
                      </div>
                      <span class="text-4xl font-black text-white italic opacity-10">VS</span>
                      <div class="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-4">
                         <img [src]="nextMatch()?.opponent?.logoUrl || '/assets/placeholder-team.png'" class="w-full h-auto drop-shadow-xl" [alt]="nextMatch()?.opponent?.name">
                      </div>
                   </div>
                   
                   <div class="order-1 lg:order-2 text-center lg:text-left flex-1">
                      <h3 class="text-4xl font-black text-white uppercase italic tracking-tighter leading-tight">{{ nextMatch()?.opponent?.name }}</h3>
                      <p class="text-amber-400/80 text-sm font-black uppercase tracking-[0.2em] mt-2 italic">{{ nextMatch()?.competition?.name || 'Grande Amistoso' }}</p>
                      
                      <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-6">
                         <div class="px-5 py-2.5 rounded-2xl bg-white/10 border border-white/5 flex flex-col">
                            <span class="text-[10px] font-black text-white uppercase italic">{{ nextMatch()?.date | date:'dd/MM' }}</span>
                            <span class="text-[8px] font-bold text-white/40 uppercase italic tracking-widest">Data</span>
                         </div>
                         <div class="px-5 py-2.5 rounded-2xl bg-amber-400 text-indigo-950 flex flex-col shadow-xl shadow-amber-400/10">
                            <span class="text-[10px] font-black uppercase italic">{{ nextMatch()?.date | date:'HH:mm' }}</span>
                            <span class="text-[8px] font-bold text-indigo-950/40 uppercase italic tracking-widest">Horário</span>
                         </div>
                         <div class="px-5 py-2.5 flex flex-col">
                             <span class="text-[11px] font-black text-white uppercase italic truncate max-w-[150px]">{{ nextMatch()?.stadium }}</span>
                             <span class="text-[8px] font-bold text-white/30 uppercase italic tracking-widest">Localização</span>
                         </div>
                      </div>
                   </div>
                </div>
              } @else {
                <div class="flex-1 flex flex-col items-center justify-center opacity-40">
                   <p class="text-xs font-black text-white uppercase italic tracking-[0.3em]">Horizonte Livre de Batalhas</p>
                </div>
              }
           </div>
        </div>

        <!-- Rastro de Comando Compacto (2/5) -->
        <div class="lg:col-span-2 rounded-[40px] border border-white/50 bg-white/95 backdrop-blur-xl p-8 shadow-xl shadow-indigo-950/5 flex flex-col min-h-[340px]">
           <header class="flex items-center justify-between mb-8 text-left">
             <div>
                <h2 class="text-xl font-black tracking-tighter text-indigo-950 uppercase italic leading-none">Últimos Rastros</h2>
                <p class="text-[8px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mt-2 italic">Ação em Tempo Real</p>
             </div>
             <a routerLink="/admin/logs" class="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest italic border-b-2 border-indigo-600/10 pb-0.5 transition-all">Histórico</a>
           </header>

           <div class="flex-1 space-y-3">
              @for (log of latestLogs(); track log.id) {
                <div class="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-950/5 group hover:bg-white hover:shadow-lg transition-all duration-300">
                   <div class="h-8 w-8 min-w-[32px] rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-950/5">
                      <svg *ngIf="log.status === 'success'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <svg *ngIf="log.status === 'failure'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                   </div>
                   <div class="flex-1 text-left min-w-0">
                      <p class="text-[10px] font-black text-indigo-950 uppercase italic truncate leading-none mb-1">
                        {{ log.message || log.action }}
                      </p>
                      <div class="flex items-center gap-2">
                         <span class="text-[7px] font-bold text-indigo-900/60 uppercase italic tracking-widest">{{ log.createdAt | date:'HH:mm • dd/MM' }}</span>
                      </div>
                   </div>
                   <div class="flex-shrink-0 w-1.5 h-1.5 rounded-full" [class.bg-emerald-500]="log.status === 'success'" [class.bg-rose-500]="log.status === 'failure'"></div>
                </div>
              } @empty {
                 <div class="flex-1 flex flex-col items-center justify-center py-5 opacity-30 text-center">
                    <p class="text-[9px] font-black text-indigo-950 uppercase italic tracking-widest">Silêncio no Comando</p>
                 </div>
              }
           </div>
        </div>
      </div>

      <!-- Voz da Torcida: Comentários Recentes (Largo) -->
      <div class="rounded-[40px] border border-white/50 bg-white/95 backdrop-blur-xl p-8 shadow-xl shadow-indigo-950/5 relative overflow-hidden flex flex-col text-left">
         <header class="flex items-center justify-between mb-8">
            <div>
               <h2 class="text-2xl font-black tracking-tighter text-indigo-950 uppercase italic leading-none">Voz da Torcida</h2>
               <p class="text-[9px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mt-2 italic">Últimos Comentários nas Matérias</p>
            </div>
            <div class="flex items-center gap-3">
               <span class="px-3 py-1 rounded-full bg-amber-400 text-[8px] font-black text-indigo-950 uppercase italic italic shadow-md">Moderação Ativa</span>
            </div>
         </header>

         <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (comment of latestComments(); track comment.id) {
               <div class="p-5 rounded-[32px] bg-indigo-950/5 border border-indigo-950/5 hover:bg-white hover:shadow-2xl hover:shadow-indigo-950/10 transition-all group relative">
                  <div class="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all transform group-hover:rotate-12 translate-y-2 group-hover:translate-y-0">
                     <button class="h-8 w-8 rounded-full bg-indigo-950 text-amber-400 flex items-center justify-center shadow-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                     </button>
                  </div>
                  
                  <div class="flex flex-col gap-3">
                     <p class="text-[11px] font-bold text-indigo-900 leading-relaxed italic">"{{ comment.content }}"</p>
                     <div class="mt-2 flex items-center gap-3 border-t border-indigo-950/5 pt-3">
                        <div class="w-6 h-6 rounded-lg bg-indigo-950 flex items-center justify-center text-[8px] font-black text-amber-400">
                           {{ comment.authorName?.charAt(0) || 'A' }}
                        </div>
                        <div class="flex flex-col">
                           <span class="text-[9px] font-black text-indigo-950 uppercase italic leading-none">{{ comment.authorName }}</span>
                           <span class="text-[7px] font-bold text-indigo-900/40 uppercase tracking-widest mt-1 italic">{{ comment.createdAt | date:'dd/MM • HH:mm' }}</span>
                        </div>
                     </div>
                  </div>
               </div>
            } @empty {
               <div class="col-span-full py-16 flex flex-col items-center justify-center opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <p class="text-xs font-black text-indigo-950 uppercase italic tracking-[0.2em]">Nenhum Comentário Recente nas Matérias</p>
               </div>
            }
         </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly newsService = inject(NewsApiService);
  private readonly interestService = inject(MembershipInterestApiService);
  private readonly matchesService = inject(MatchesApiService);
  private readonly logsService = inject(LogsApiService);
  private readonly usersService = inject(UsersApiService);

  readonly newsCount = signal(0);
  readonly pendingInterests = signal(0);
  readonly userCount = signal(0);
  readonly matchesCount = signal(0);
  readonly nextMatch = signal<Match | null>(null);
  readonly latestLogs = signal<ActivityLog[]>([]);
  readonly latestComments = signal<any[]>([]);
  readonly loading = signal(true);
  readonly lastSync = signal(new Date());

  ngOnInit(): void {
    this.refreshDashboard();
  }

  refreshDashboard(): void {
    this.loading.set(true);
    
    forkJoin({
      news: this.newsService.findAll({ limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
      interests: this.interestService.getUnreadCount().pipe(catchError(() => of({ count: 0 }))),
      users: this.usersService.list({ limit: 1 }).pipe(catchError(() => of({ total: 0 }))),
      matches: this.matchesService.listMatches().pipe(catchError(() => of([]))),
      nextMatch: this.matchesService.getNextMatch().pipe(catchError(() => of(null))),
      logs: this.logsService.list({ limit: 4 }).pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.newsCount.set((res.news as any).total || 0);
        this.pendingInterests.set(res.interests.count || 0);
        this.userCount.set((res.users as any).total || 0);
        this.matchesCount.set(res.matches.length || 0);
        
        this.nextMatch.set(res.nextMatch);
        this.latestLogs.set(res.logs);
        
        // Simulação de comentários (já que não há API global)
        // Em um cenário real, o backend teria um /comments/latest
        this.latestComments.set([]); 

        this.lastSync.set(new Date());
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
