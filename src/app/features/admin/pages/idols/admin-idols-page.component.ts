import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { Idol } from '../../../../core/models/idol.model';
import { IdolsApiService } from '../../../../core/services/idols-api.service';
import { ToastMessagesService, ToastTitle } from '../../../../core/notifications/toast-messages.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { FallbackImgDirective } from '../../../../shared/directives/fallback-img.directive';
import { AdminCreateIdolDrawerComponent } from './components/admin-create-idol-drawer.component';

@Component({
  selector: 'app-admin-idols-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, SpinnerComponent, FallbackImgDirective, AdminCreateIdolDrawerComponent],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex sm:flex-row flex-col items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Mural de Ídolos</h1>
          <p class="text-sm text-slate-500 mt-1">Gerencie os atletas históricos e ídolos do clube exibidos no site.</p>
        </div>
        <button (click)="openDrawer()" class="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Ídolo
        </button>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-800">Lista e Ordenação</h2>
          @if (isReordering()) {
            <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md animate-pulse">Ordem não salva...</span>
          }
        </div>

        @if (loading() && idols().length === 0) {
          <div class="py-12 flex justify-center"><app-spinner /></div>
        } @else {
          
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th class="px-6 py-4 w-12 text-center">Ord.</th>
                  <th class="px-6 py-4">Ídolo</th>
                  <th class="px-6 py-4 w-32">Categoria</th>
                  <th class="px-6 py-4 w-32 text-center">Gols / Titulos</th>
                  <th class="px-6 py-4 w-32 text-center">Status</th>
                  <th class="px-6 py-4 w-24 text-right">Ação</th>
                </tr>
              </thead>
              
              <tbody cdkDropList (cdkDropListDropped)="onDrop($event)" class="divide-y divide-slate-100 text-slate-700">
                @for (idol of idols(); track idol._id) {
                  <tr cdkDrag class="hover:bg-slate-50 transition-colors group bg-white cursor-move">
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <svg cdkDragHandle xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        <span class="text-xs font-medium text-slate-400 w-4">{{ $index + 1 }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                          <img [src]="idol.photoUrl" appFallbackImg="cover" class="h-full w-full object-cover">
                        </div>
                        <div class="flex flex-col">
                          <span class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{{ idol.name }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      @if(idol.isAthlete) {
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10"><span class="h-1.5 w-1.5 rounded-full bg-blue-600"></span>Atleta</span>
                      } @else {
                        <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">Torcedor/Membro</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if(idol.isAthlete) {
                        <span class="text-xs font-bold">{{ idol.statistics?.goals || 0 }} ⚽ / {{ idol.statistics?.titles?.length || 0 }} 🏆</span>
                      } @else {
                        <span class="text-xs text-slate-400">-</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      @if (idol.isActive) {
                        <span class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Visível</span>
                      } @else {
                        <span class="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">Oculto</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="openDrawer(idol)" type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button (click)="removeIdol(idol)" type="button" class="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Deletar">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                
                @if (idols().length === 0) {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                      Nenhum ídolo cadastrado ainda. O mural está vazio.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Sticky Reorder Actions -->
          @if (isReordering()) {
            <div class="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
              <span class="text-sm font-medium text-slate-700">A ordem dos ídolos foi alterada.</span>
              <div class="flex gap-3">
                <button (click)="cancelReorder()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition">Cancelar</button>
                <button (click)="saveReorder()" class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all focus-visible:outline focus-visible:outline-emerald-600">Salvar Nova Ordem</button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    @if (showingDrawer()) {
      <app-admin-create-idol-drawer 
        [idolToEdit]="selectedIdol()" 
        (close)="showingDrawer.set(false)" 
        (saved)="onSaved()"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIdolsPageComponent implements OnInit {
  private idolsApi = inject(IdolsApiService);
  private toast = inject(ToastMessagesService);

  readonly idols = signal<Idol[]>([]);
  readonly loading = signal(false);
  
  readonly showingDrawer = signal(false);
  readonly selectedIdol = signal<Idol | null>(null);
  readonly isReordering = signal(false);

  private originalOrder: Idol[] = [];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.isReordering.set(false);
    this.idolsApi.listAdmin().subscribe({
      next: (res) => {
        this.idols.set(res);
        this.originalOrder = [...res];
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openDrawer(idol?: Idol) {
    this.selectedIdol.set(idol || null);
    this.showingDrawer.set(true);
  }

  onSaved() {
    this.showingDrawer.set(false);
    this.load();
  }

  removeIdol(idol: Idol) {
    if (!confirm(`Tem certeza que deseja apagar ${idol.name} do Mural de Ídolos?`)) return;
    this.loading.set(true);
    this.idolsApi.delete(idol._id).subscribe({
      next: () => {
        this.toast.showSuccess('Ídolo removido com sucesso', ToastTitle.Success);
        this.load();
      },
      error: (err) => {
        this.toast.showApiError(err, 'Falha ao remover Ídolo');
        this.loading.set(false);
      }
    });
  }

  onDrop(event: CdkDragDrop<Idol[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const items = [...this.idols()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.idols.set(items);
    this.isReordering.set(true);
  }

  cancelReorder() {
    this.idols.set([...this.originalOrder]);
    this.isReordering.set(false);
  }

  saveReorder() {
    this.loading.set(true);
    const ids = this.idols().map(i => i._id);
    this.idolsApi.reorder(ids).subscribe({
      next: () => {
        this.toast.showSuccess('Ordem de ídolos salva', 'Sucesso');
        this.load();
      },
      error: (err) => {
        this.toast.showApiError(err, 'Falha ao reordenar');
        this.loading.set(false);
      }
    });
  }
}
