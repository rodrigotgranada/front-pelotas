import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HistoryApiService } from '../../../../core/services/history-api.service';
import { History } from '../../../../core/models/history.model';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-history-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SpinnerComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">História do Clube</h1>
          <p class="text-sm font-medium text-slate-500 mt-1">Gerencie as seções e a cronologia do E.C. Pelotas.</p>
        </div>
        
        <div class="flex items-center gap-3">
          @if (!isReordering()) {
            <button 
              (click)="startReordering()"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
              Ajustar Ordem
            </button>
            <a 
              routerLink="novo" 
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Nova Seção
            </a>
          } @else {
            <div class="flex items-center gap-2 bg-amber-50 border border-amber-200 p-1.5 rounded-2xl shadow-sm">
               <button 
                (click)="cancelReordering()"
                [disabled]="savingOrder()"
                class="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                (click)="saveOrder()"
                [disabled]="savingOrder()"
                class="px-4 py-2 text-sm font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                @if (savingOrder()) {
                  <app-spinner size="sm" />
                }
                SALVAR NOVA ORDEM
              </button>
            </div>
          }
        </div>
      </div>

      @if (isReordering()) {
        <div class="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-indigo-500 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
           <p class="text-xs text-indigo-700 font-medium leading-relaxed">
             <b>Modo de Reordenação Ativo:</b> Use as setas para organizar a cronologia. As alterações só serão aplicadas ao site após você clicar em <b>Salvar Nova Ordem</b>.
           </p>
        </div>
      }

      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-4 text-slate-500 font-medium">Carregando história...</p>
          </div>
        } @else if (sections().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
             <div class="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
             </div>
             <h3 class="text-lg font-bold text-slate-900">Nenhuma seção cadastrada</h3>
             <p class="text-slate-500 max-w-xs mt-2 font-medium text-sm">Comece a contar a trajetória do Lobo do Cerrado adicionando a primeira seção.</p>
             <a routerLink="novo" class="mt-6 text-indigo-600 font-bold hover:underline text-sm">Adicionar Fundação</a>
          </div>
        } @else {
          <div class="divide-y divide-slate-100">
            @for (section of sections(); track section.id; let first = $first; let last = $last, i = $index) {
              <div class="p-5 flex items-center gap-6 hover:bg-slate-50/50 transition-colors group">
                <!-- Order Controls -->
                <div class="flex flex-col items-center gap-1 min-w-[32px]">
                   @if (isReordering()) {
                    <button 
                      (click)="move(section.id, 'up')" 
                      [disabled]="first" 
                      class="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-0 transition-colors cursor-pointer"
                      title="Mover para cima"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                  }
                  <span class="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md min-w-[20px] text-center" [title]="'Ordem Original: ' + section.order">
                    {{ i + 1 }}
                  </span>
                  @if (isReordering()) {
                    <button 
                      (click)="move(section.id, 'down')" 
                      [disabled]="last" 
                      class="p-1 text-slate-300 hover:text-indigo-600 disabled:opacity-0 transition-colors cursor-pointer"
                      title="Mover para baixo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                  }
                </div>

                <!-- Content & Image -->
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="h-14 w-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative group/img shadow-sm">
                    <img 
                      [src]="section.coverImageUrl || 'assets/placeholder-history.jpg'" 
                      class="h-full w-full object-cover grayscale group-hover/img:grayscale-0 transition-all duration-500" 
                      onerror="this.src='https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1000&auto=format&fit=crop'"
                    />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="text-base font-black text-slate-900 truncate">{{ section.title }}</h3>
                      @if (!section.isActive) {
                        <span class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-500 uppercase tracking-tighter">Inativo</span>
                      }
                    </div>
                    <p class="text-xs text-slate-500 font-medium mt-0.5 truncate">{{ section.slug }}</p>
                  </div>
                </div>

                <!-- Actions -->
                @if (!isReordering()) {
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <a 
                      [routerLink]="['editar', section.id]" 
                      class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-slate-200"
                      title="Editar Seção"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </a>
                    <button 
                      (click)="deleteSection(section.id)" 
                      class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shadow-sm border border-transparent hover:border-rose-100 cursor-pointer"
                      title="Excluir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class AdminHistoryPageComponent implements OnInit {
  private readonly historyApi = inject(HistoryApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly sections = signal<History[]>([]);
  readonly loading = signal<boolean>(true);
  
  readonly isReordering = signal<boolean>(false);
  readonly savingOrder = signal<boolean>(false);
  private originalSections: History[] = [];

  ngOnInit() {
    this.fetchSections();
  }

  fetchSections() {
    this.loading.set(true);
    this.historyApi.listAdmin().subscribe({
      next: (data: History[]) => {
        this.sections.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Não foi possível carregar as seções da história.');
        this.loading.set(false);
      }
    });
  }

  deleteSection(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta seção histórica? Esta ação não pode ser desfeita.')) return;

    this.historyApi.delete(id).subscribe({
      next: () => {
        this.toast.showSuccess('Seção excluída com sucesso.');
        this.sections.update(all => all.filter(s => s.id !== id));
      },
      error: () => this.toast.showError('Erro ao excluir seção.')
    });
  }

  startReordering() {
    this.originalSections = [...this.sections()];
    this.isReordering.set(true);
  }

  cancelReordering() {
    this.sections.set(this.originalSections);
    this.isReordering.set(false);
  }

  saveOrder() {
    if (!confirm('Deseja salvar a nova ordem da história? Esta mudança será aplicada imediatamente ao site público.')) return;

    this.savingOrder.set(true);
    const ids = this.sections().map(s => s.id);

    this.historyApi.reorder(ids)
      .pipe(finalize(() => this.savingOrder.set(false)))
      .subscribe({
        next: () => {
          this.toast.showSuccess('Nova ordem salva com sucesso!');
          this.isReordering.set(false);
        },
        error: () => this.toast.showError('Erro ao salvar nova ordem.')
      });
  }

  move(id: string, direction: 'up' | 'down') {
    const current = this.sections();
    const index = current.findIndex(s => s.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    const newOrder = [...current];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];

    this.sections.set(newOrder);
  }
}
