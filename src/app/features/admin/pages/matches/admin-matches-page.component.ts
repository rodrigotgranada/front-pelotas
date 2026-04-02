import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../../core/services/matches-api.service';
import { Match } from '../../../../core/models/match.model';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { finalize } from 'rxjs';
import { FallbackImgDirective } from '../../../../shared/directives/fallback-img.directive';
import { Competition, Team } from '../../../../core/models/match.model';
import { AdminConfirmModalComponent } from '../../../../shared/ui/admin-confirm-modal/admin-confirm-modal.component';

@Component({
  selector: 'app-admin-matches-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    SpinnerComponent, 
    DatePipe, 
    FallbackImgDirective,
    AdminConfirmModalComponent
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Calendário de Jogos</h1>
          <p class="mt-1 text-slate-500">Gerencie partidas, resultados e placares.</p>
        </div>
        <div class="flex gap-2">
          <a routerLink="/admin/competicoes" class="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all">
            Campeonatos
          </a>
          <a routerLink="/admin/times" class="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all">
            Adversários
          </a>
          <a routerLink="editor/new" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
            Novo Jogo
          </a>
        </div>
      </header>

      <div class="relative min-h-[400px]">
        @if (loading()) {
          <div class="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
            <app-spinner />
          </div>
        }

        @if (matches().length > 0) {
          <div class="grid grid-cols-1 gap-4">
            @for (match of matches(); track match.id) {
              <div class="group bg-white border border-slate-200 rounded-2xl p-5 transition-all hover:shadow-xl flex flex-col md:flex-row items-center gap-6">
                <!-- Data e Competição -->
                <div class="flex flex-col items-center md:items-start min-w-[120px]">
                  <span class="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">
                    {{ getCompetitionName(match.competitionId) }}
                  </span>
                  <span class="text-xl font-black text-slate-900">{{ match.date | date:'dd/MM' }}</span>
                  <span class="text-xs font-bold text-slate-400">{{ match.date | date:'HH:mm' }}</span>
                </div>

                <!-- Confronto -->
                <div class="flex-1 flex items-center justify-center gap-8">
                  <!-- Pelotas -->
                  <div class="flex flex-col items-center gap-2 w-1/3">
                    <div class="w-16 h-16 rounded-full bg-slate-50 p-2 border border-slate-100 flex items-center justify-center overflow-hidden">
                       <img src="https://s.sde.globo.com/media/organizations/2019/01/03/Pelotas-01.svg" class="w-full h-full object-contain">
                    </div>
                    <span class="text-sm font-black text-slate-900 uppercase tracking-tighter">Pelotas</span>
                  </div>

                  <!-- Placar -->
                  <div class="flex flex-col items-center gap-1">
                    <div class="flex items-center gap-3">
                      <span class="text-3xl font-black text-slate-900">{{ match.isHome ? match.homeScore : match.awayScore }}</span>
                      <span class="text-slate-300 font-black">X</span>
                      <span class="text-3xl font-black text-slate-900">{{ match.isHome ? match.awayScore : match.homeScore }}</span>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                       {{ getStatusLabel(match.status) }}
                    </span>
                  </div>

                  <!-- Adversário -->
                  <div class="flex flex-col items-center gap-2 w-1/3">
                    <div class="w-16 h-16 rounded-full bg-slate-50 p-2 border border-slate-100 flex items-center justify-center overflow-hidden">
                       <img [src]="getOpponentLogo(match.opponentId)" appFallbackImg="team" class="w-full h-full object-contain">
                    </div>
                    <span class="text-sm font-black text-slate-900 uppercase tracking-tighter truncate max-w-full">
                       {{ getOpponentName(match.opponentId) }}
                    </span>
                  </div>
                </div>

                <!-- Ações -->
                <div class="flex gap-2">
                  <a [routerLink]="['live', match.id]" 
                     [class]="match.status === 'LIVE' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                     class="p-3 rounded-xl transition-all active:scale-90 shadow-sm border border-transparent" 
                     title="War Room - Cobertura ao Vivo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></svg>
                  </a>
                  <a [routerLink]="['editor', match.id]" class="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all active:scale-90 shadow-sm border border-indigo-100" title="Editar Detalhes">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </a>
                  <button (click)="openDeleteConfirm(match)" class="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-90 shadow-sm border border-rose-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (showConfirm()) {
        <app-admin-confirm-modal
          [title]="'Excluir Jogo?'"
          [message]="'Tem certeza que deseja remover esta partida do calendário?'"
          confirmText="Sim, Excluir"
          type="danger"
          (confirmed)="confirmDelete()"
          (cancelled)="showConfirm.set(false)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMatchesPageComponent implements OnInit {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly toast = inject(ToastMessagesService);
  
  readonly matches = signal<Match[]>([]);
  readonly loading = signal(false);
  readonly showConfirm = signal(false);
  readonly matchToDelete = signal<Match | null>(null);

  ngOnInit() {
    this.loadMatches();
  }

  loadMatches() {
    this.loading.set(true);
    this.matchesApi.listMatches()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.matches.set(data),
        error: (err) => this.toast.showApiError(err, 'Falha ao carregar jogos')
      });
  }

  openDeleteConfirm(match: Match) {
    this.matchToDelete.set(match);
    this.showConfirm.set(true);
  }

  confirmDelete() {
    const match = this.matchToDelete();
    if (!match) return;

    this.showConfirm.set(false);
    this.matchesApi.deleteMatch(match.id).subscribe({
      next: () => {
        this.toast.showSuccess('Jogo excluído com sucesso');
        this.loadMatches();
      },
      error: (err) => this.toast.showApiError(err, 'Falha ao excluir')
    });
  }

  getOpponentName(opponent: string | Team): string {
    if (typeof opponent === 'string') return 'Carregando...';
    return opponent.name;
  }

  getOpponentLogo(opponent: string | Team): string | null {
    if (typeof opponent === 'string') return null;
    return opponent.logoUrl || null;
  }

  getCompetitionName(comp: string | Competition | null | undefined): string {
    if (!comp) return 'Amistoso';
    if (typeof comp === 'string') return 'Competição';
    return comp.name;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'SCHEDULED': 'Agendado',
      'LIVE': 'Em Andamento',
      'FINISHED': 'Finalizado',
      'POSTPONED': 'Adiado'
    };
    return labels[status] || status;
  }
}
