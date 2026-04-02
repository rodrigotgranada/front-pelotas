import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatchesApiService } from '../../../../core/services/matches-api.service';
import { Competition } from '../../../../core/models/match.model';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { finalize } from 'rxjs';
import { AdminCompetitionDrawerComponent } from './components/admin-competition-drawer.component';
import { AdminConfirmModalComponent } from '../../../../shared/ui/admin-confirm-modal/admin-confirm-modal.component';
import { FallbackImgDirective } from '../../../../shared/directives/fallback-img.directive';

@Component({
  selector: 'app-admin-competitions-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    SpinnerComponent, 
    AdminCompetitionDrawerComponent,
    AdminConfirmModalComponent,
    FallbackImgDirective
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">Campeonatos</h1>
          <p class="mt-1 text-slate-500">Configure as competições que o Pelotas participa.</p>
        </div>
        <button (click)="openAddModal()" class="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95">
          Nova Competição
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @if (loading()) {
          <div class="col-span-full flex items-center justify-center py-20">
            <app-spinner />
          </div>
        }

        @for (comp of competitions(); track comp.id) {
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div class="flex items-start justify-between mb-4">
              <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden shrink-0">
                <img [src]="comp.logoUrl || 'assets/placeholder-comp.png'" appFallbackImg="competition" class="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all">
              </div>
              <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button (click)="openEditModal(comp)" class="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button (click)="openDeleteConfirm(comp)" class="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-black text-slate-900 leading-tight mb-1">{{ comp.name }}</h3>
              <p class="text-sm font-bold text-slate-500 uppercase tracking-widest">{{ comp.season }}</p>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <span [class]="comp.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'" class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border">
                {{ comp.isActive ? 'Ativa' : 'Encerrada' }}
              </span>
              @if (comp.externalTableUrl) {
                <a [href]="comp.externalTableUrl" target="_blank" class="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  Ver Tabela Externa
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                </a>
              }
            </div>
          </div>
        }
      </div>

      @if (showModal()) {
        <app-admin-competition-drawer
          [isOpen]="true"
          [competition]="selectedComp()"
          (closed)="closeModal($event)"
        />
      }

      @if (showConfirm()) {
        <app-admin-confirm-modal
          [title]="'Remover ' + compToDelete()?.name + '?'"
          message="Esta ação não afetará os jogos já cadastrados no sistema."
          confirmText="Sim, Remover"
          type="danger"
          (confirmed)="confirmDelete()"
          (cancelled)="showConfirm.set(false)"
        />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCompetitionsPageComponent implements OnInit {
  private readonly matchesApi = inject(MatchesApiService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly toast = inject(ToastMessagesService);

  readonly competitions = signal<Competition[]>([]);
  readonly loading = signal(false);
  readonly showModal = signal(false);
  readonly selectedComp = signal<Competition | null>(null);
  readonly showConfirm = signal(false);
  readonly compToDelete = signal<Competition | null>(null);

  ngOnInit() {
    this.loadCompetitions();
  }

  loadCompetitions() {
    this.loading.set(true);
    this.matchesApi.listCompetitions()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.competitions.set(data),
        error: (err) => this.toast.showApiError(err, 'Erro ao carregar competições')
      });
  }

  openAddModal() {
    this.selectedComp.set(null);
    this.showModal.set(true);
  }

  openEditModal(comp: Competition) {
    this.selectedComp.set(comp);
    this.showModal.set(true);
  }

  closeModal(comp: Competition | null) {
    this.showModal.set(false);
    this.selectedComp.set(null);
    if (comp) {
      this.loadCompetitions();
    }
  }

  save() {
    // A lógica de save agora fica dentro do Drawer, 
    // AdminCompetitionsPageComponent apenas reage ao evento (closed)
  }

  openDeleteConfirm(comp: Competition) {
    this.compToDelete.set(comp);
    this.showConfirm.set(true);
  }

  confirmDelete() {
    const comp = this.compToDelete();
    if (!comp) return;

    this.showConfirm.set(false);
    this.matchesApi.deleteCompetition(comp.id).subscribe({
      next: () => {
        this.toast.showSuccess(`Competição ${comp.name} removida!`);
        this.loadCompetitions();
      },
      error: (err) => this.toast.showApiError(err, 'Erro ao remover')
    });
  }
}
