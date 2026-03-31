import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SquadsApiService, Squad } from '../../../../core/services/squads-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { AdminSquadDrawerComponent } from './components/admin-squad-drawer.component';

@Component({
  selector: 'app-admin-squads-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSquadDrawerComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Gestão de Elencos</h1>
          <p class="text-slate-500 text-sm">Organize os atletas por ano, competição e categoria</p>
        </div>
        <button 
          (click)="openDrawer()"
          class="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-600/20 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Novo Elenco
        </button>
      </header>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Ano</label>
            <input 
              [formControl]="yearFilter"
              type="number" 
              placeholder="Ex: 2026" 
              class="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            >
          </div>
          <div class="flex flex-col gap-1 min-w-[200px]">
             <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Competição</label>
             <input 
              [formControl]="competitionFilter"
              type="text" 
              placeholder="Ex: Gauchão" 
              class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 outline-none"
            >
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-black uppercase text-slate-400 ml-1">Categoria</label>
            <select [formControl]="categoryFilter" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none">
              <option value="">Todas</option>
              <option value="Profissional">Profissional</option>
              <option value="Feminino">Feminino</option>
              <option value="Sub-20">Sub-20</option>
              <option value="Sub-17">Sub-17</option>
              <option value="Sub-15">Sub-15</option>
              <option value="Sub-13">Sub-13</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th class="px-6 py-4 font-black">Temporada / Competição</th>
                <th class="px-6 py-4 font-black">Categoria</th>
                <th class="px-6 py-4 font-black">Atletas</th>
                <th class="px-6 py-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (squad of squads(); track squad._id) {
                <tr class="hover:bg-slate-50/80 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-slate-900 leading-none mb-1">{{ squad.year }}</span>
                      <span class="text-xs text-brand-600 font-medium">{{ squad.competition }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                      {{ squad.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex -space-x-2">
                       @for (member of squad.members.slice(0, 5); track $index) {
                         <div class="h-8 w-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                           <!-- In a real app, we'd populated athlete photo here. 
                                Since we use athleteId (populated in backend), we can check types -->
                           <div class="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                              {{ $index + 1 }}
                           </div>
                         </div>
                       }
                       @if (squad.members.length > 5) {
                         <div class="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 shadow-sm">
                            +{{ squad.members.length - 5 }}
                         </div>
                       }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        (click)="editSquad(squad)"
                        class="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button 
                        (click)="deleteSquad(squad)"
                        class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-6 py-20 text-center">
                    <div class="flex flex-col items-center gap-2">
                       <svg class="text-slate-200" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                       <p class="text-slate-400 font-medium">Nenhum elenco encontrado com estes filtros.</p>
                       <button (click)="openDrawer()" class="text-brand-600 font-bold text-sm hover:underline">Cadastrar o primeiro</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <app-admin-squad-drawer 
      [squad]="selectedSquad()"
      [isOpen]="isDrawerOpen()"
      (close)="closeDrawer()"
      (save)="onSave()"
    />
  `
})
export class AdminSquadsPageComponent implements OnInit {
  private readonly squadsApi = inject(SquadsApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly squads = signal<Squad[]>([]);
  readonly isDrawerOpen = signal(false);
  readonly selectedSquad = signal<Squad | null>(null);

  readonly yearFilter = new FormControl<number | null>(null);
  readonly competitionFilter = new FormControl('');
  readonly categoryFilter = new FormControl('');

  ngOnInit(): void {
    this.loadSquads();
    this.yearFilter.valueChanges.subscribe(() => this.loadSquads());
    this.competitionFilter.valueChanges.subscribe(() => this.loadSquads());
    this.categoryFilter.valueChanges.subscribe(() => this.loadSquads());
  }

  loadSquads(): void {
    const params: any = {};
    if (this.yearFilter.value) params.year = this.yearFilter.value;
    if (this.competitionFilter.value) params.competition = this.competitionFilter.value;
    if (this.categoryFilter.value) params.category = this.categoryFilter.value;

    this.squadsApi.findAll(params).subscribe({
      next: (data: Squad[]) => this.squads.set(data),
      error: (err: any) => this.toast.showApiError(err, 'Erro ao carregar elencos')
    });
  }

  openDrawer(squad: Squad | null = null): void {
    this.selectedSquad.set(squad);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedSquad.set(null);
  }

  editSquad(squad: Squad): void {
    this.openDrawer(squad);
  }

  deleteSquad(squad: Squad): void {
    if (confirm(`Remover o elenco de ${squad.year} - ${squad.competition}?`)) {
      this.squadsApi.delete(squad._id).subscribe({
        next: () => {
          this.toast.showSuccess('Elenco removido');
          this.loadSquads();
        },
        error: (err: any) => this.toast.showApiError(err, 'Erro ao remover elenco')
      });
    }
  }

  onSave(): void {
    this.closeDrawer();
    this.loadSquads();
  }
}
