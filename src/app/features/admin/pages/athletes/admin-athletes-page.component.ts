import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AthletesApiService, Athlete } from '../../../../core/services/athletes-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { AdminAthleteDrawerComponent } from './components/admin-athlete-drawer.component';

@Component({
  selector: 'app-admin-athletes-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminAthleteDrawerComponent],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Gestão de Atletas</h1>
          <p class="text-slate-500 text-sm">Cadastre jogadores e comissão técnica para os elencos</p>
        </div>
        <button 
          (click)="openDrawer()"
          class="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-600/20 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Novo Atleta
        </button>
      </header>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              [formControl]="searchControl"
              type="text" 
              placeholder="Buscar por nome ou apelido..." 
              class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
            >
          </div>
          <div class="flex gap-2">
            <select [formControl]="staffFilter" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500/20 outline-none">
              <option [value]="null">Todos (Jogadores + Comissão)</option>
              <option [value]="false">Apenas Jogadores</option>
              <option [value]="true">Apenas Comissão Técnica</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th class="px-6 py-4 font-black">Atleta</th>
                <th class="px-6 py-4 font-black">Posições / Cargo</th>
                <th class="px-6 py-4 font-black">Status</th>
                <th class="px-6 py-4 font-black text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (athlete of athletes(); track athlete._id) {
                <tr class="hover:bg-slate-50/80 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <img [src]="athlete.photoUrl" class="h-full w-full object-cover" [alt]="athlete.name">
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-slate-900 leading-none mb-1">{{ athlete.name }}</span>
                        @if (athlete.nickname) {
                          <span class="text-xs text-brand-600 font-medium">"{{ athlete.nickname }}"</span>
                        } @else {
                          <span class="text-[10px] text-slate-400 italic">Sem apelido</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      @for (pos of athlete.positions; track pos) {
                        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-tight">
                          {{ pos }}
                        </span>
                      } @empty {
                        <span class="text-[10px] text-slate-400">Não definida</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    @if (athlete.isActive) {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Ativo
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                        Inativo
                      </span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        (click)="editAthlete(athlete)"
                        class="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                      <button 
                        (click)="deleteAthlete(athlete)"
                        class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-6 py-20 text-center">
                    <div class="flex flex-col items-center gap-2">
                       <svg class="text-slate-200" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                       <p class="text-slate-400 font-medium">Nenhum atleta encontrado.</p>
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

    <!-- Drawer component placeholder -->
    <app-admin-athlete-drawer 
      [athlete]="selectedAthlete()"
      [isOpen]="isDrawerOpen()"
      (close)="closeDrawer()"
      (save)="onSave()"
    />
  `
})
export class AdminAthletesPageComponent implements OnInit {
  private readonly athletesApi = inject(AthletesApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly athletes = signal<Athlete[]>([]);
  readonly isDrawerOpen = signal(false);
  readonly selectedAthlete = signal<Athlete | null>(null);

  readonly searchControl = new FormControl('');
  readonly staffFilter = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.loadAthletes();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.loadAthletes());

    this.staffFilter.valueChanges.subscribe(() => this.loadAthletes());
  }

  loadAthletes(): void {
    const params: any = {
      search: this.searchControl.value,
    };
    
    if (this.staffFilter.value !== null && this.staffFilter.value !== 'null') {
      params.isStaff = this.staffFilter.value;
    }

    this.athletesApi.findAll(params).subscribe({
      next: (data) => this.athletes.set(data),
      error: (err) => this.toast.showApiError(err, 'Erro ao carregar atletas')
    });
  }

  openDrawer(athlete: Athlete | null = null): void {
    this.selectedAthlete.set(athlete);
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.selectedAthlete.set(null);
  }

  editAthlete(athlete: Athlete): void {
    this.openDrawer(athlete);
  }

  deleteAthlete(athlete: Athlete): void {
    if (confirm(`Tem certeza que deseja remover ${athlete.name}?`)) {
      this.athletesApi.delete(athlete._id).subscribe({
        next: () => {
          this.toast.showSuccess('Atleta removido com sucesso');
          this.loadAthletes();
        },
        error: (err) => this.toast.showApiError(err, 'Erro ao remover atleta')
      });
    }
  }

  onSave(): void {
    this.closeDrawer();
    this.loadAthletes();
  }
}
