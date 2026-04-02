import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatchesApiService } from '../../../../core/services/matches-api.service';
import { Team } from '../../../../core/models/match.model';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { finalize } from 'rxjs';
import { FallbackImgDirective } from '../../../../shared/directives/fallback-img.directive';
import { AdminTeamDrawerComponent } from './components/admin-team-drawer.component';

@Component({
  selector: 'app-admin-teams-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    SpinnerComponent, 
    FallbackImgDirective, 
    AdminTeamDrawerComponent
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Biblioteca de Times</h1>
          <p class="mt-1 text-slate-500">Adversários frequentes do Pelotas.</p>
        </div>
        <button (click)="openAddModal()" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
          Novo Time
        </button>
      </header>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        @if (loading()) {
          <div class="col-span-full flex items-center justify-center py-20">
            <app-spinner />
          </div>
        }

        @for (team of teams(); track team._id || team.id || team.name) {
          <div 
            [class.border-indigo-200]="team.isPelotas" 
            [class.bg-indigo-50]="team.isPelotas" 
            class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all group flex flex-col items-center gap-3 text-center"
          >
            <div class="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center relative overflow-hidden">
               <img [src]="team.logoUrl || '/assets/placeholder-team.png'" appFallbackImg="team" class="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500">
               @if (team.isPelotas) {
                  <span class="absolute bottom-0 inset-x-0 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-tighter py-0.5">Principal</span>
               }
            </div>
            
            <div class="min-w-0 w-full">
              <h3 class="text-xs font-black text-slate-900 truncate tracking-tight">{{ team.name }}</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ team.shortName || '-' }}</p>
            </div>

            <div class="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="openEditModal(team)" class="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                @if (!team.isPelotas) {
                  <button (click)="deleteTeam(team.id)" class="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                }
            </div>
          </div>
        }
      </div>

      <!-- Novo Drawer Reutilizável -->
      <app-admin-team-drawer
        [isOpen]="showModal()"
        [team]="selectedTeam()"
        (closed)="closeModal($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTeamsPageComponent implements OnInit {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly teams = signal<Team[]>([]);
  readonly loading = signal(false);
  readonly showModal = signal(false);
  readonly selectedTeam = signal<Team | null>(null);

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading.set(true);
    this.matchesApi.listTeams()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.teams.set(data),
        error: (err) => this.toast.showApiError(err, 'Erro ao carregar biblioteca')
      });
  }

  openAddModal() {
    this.selectedTeam.set(null);
    this.showModal.set(true);
  }

  openEditModal(team: Team) {
    this.selectedTeam.set(team);
    this.showModal.set(true);
  }

  closeModal(team: Team | null) {
    this.showModal.set(false);
    this.selectedTeam.set(null);
    if (team) {
      this.loadTeams();
    }
  }

  deleteTeam(id: string) {
    if (!confirm('Remover este time da biblioteca?')) return;
    this.matchesApi.deleteTeam(id).subscribe({
      next: () => {
        this.toast.showSuccess('Time removido');
        this.loadTeams();
      },
      error: (err) => this.toast.showApiError(err, 'Erro ao remover')
    });
  }
}
