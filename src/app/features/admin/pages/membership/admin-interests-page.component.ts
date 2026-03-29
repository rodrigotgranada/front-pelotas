import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipInterest, MembershipInterestApiService } from '../../../../core/services/membership-interest-api.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { AdminInterestResolveDrawerComponent } from './admin-interest-resolve-drawer.component';

type InterestStatus = 'ALL' | 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'REJECTED';

@Component({
  selector: 'app-admin-interests-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, AdminInterestResolveDrawerComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Intenções de Sócio</h1>
          <p class="text-slate-500 font-medium mt-1">Gerencie os torcedores interessados em aderir aos planos do clube.</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200 cursor-default">
           <span class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
           <span class="text-xs font-black text-slate-600 uppercase tracking-widest">{{ unreadCount() }} novas solicitações</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3 mb-8">
        @for (status of statusFilters; track status.value) {
          <button 
            (click)="activeFilter.set(status.value)"
            class="px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 cursor-pointer"
            [class.bg-slate-900]="activeFilter() === status.value"
            [class.border-slate-900]="activeFilter() === status.value"
            [class.text-white]="activeFilter() === status.value"
            [class.bg-white]="activeFilter() !== status.value"
            [class.border-slate-200]="activeFilter() !== status.value"
            [class.text-slate-400]="activeFilter() !== status.value"
            [class.hover:border-slate-900]="activeFilter() !== status.value"
          >
            {{ status.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="flex translate-y-20 justify-center"><app-spinner size="lg" /></div>
      } @else if (filteredInterests().length === 0) {
        <div class="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-slate-300 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
           <p class="text-slate-500 font-bold">Nenhuma intenção encontrada com este filtro.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @for (item of filteredInterests(); track item.id) {
            <div 
              class="group bg-white rounded-3xl border border-slate-200 p-6 transition-all hover:shadow-xl hover:border-indigo-200 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden"
              [class.bg-slate-50]="item.isRead || item.status === 'COMPLETED' || item.status === 'REJECTED'"
              [class.border-l-4]="!item.isRead && item.status === 'PENDING'"
              [class.border-l-indigo-500]="!item.isRead && item.status === 'PENDING'"
            >
              @if (!item.isRead && item.status === 'PENDING') {
                <div class="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Novo</div>
              }

              <!-- User Info -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-lg font-black text-slate-900">{{ item.name }}</h3>
                  @if (item.userId) {
                    <span class="px-2 py-0.5 bg-slate-200 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Usuário Logado</span>
                  }
                </div>
                <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                   <a [href]="'mailto:' + item.email" class="hover:text-indigo-600 transition flex items-center gap-1.5 cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                     {{ item.email }}
                   </a>
                   <span class="flex items-center gap-1.5">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                     {{ item.phone }}
                   </span>
                   <span class="flex items-center gap-1.5 text-slate-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                     {{ item.createdAt | date:'dd/MM/yy HH:mm' }}
                   </span>

                   @if (item.status === 'COMPLETED') {
                     <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-widest">Adesão Concluída</span>
                   } @else if (item.status === 'REJECTED') {
                     <span class="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black rounded-lg uppercase tracking-widest">Desistência</span>
                   } @else if (item.status === 'CONTACTED') {
                     <span class="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-lg uppercase tracking-widest">Em Contato</span>
                   } @else {
                     <span class="px-3 py-1 bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg uppercase tracking-widest">Pendente</span>
                   }
                </div>
                
                @if (item.resolutionNotes) {
                  <div class="mt-3 bg-indigo-50/50 border border-indigo-100/50 p-3 rounded-xl border-dashed">
                    <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                      {{ item.status === 'REJECTED' ? 'Motivo da Desistência' : 'Observações da Adesão' }}
                    </p>
                    <p class="text-sm text-slate-600 italic">"{{ item.resolutionNotes }}"</p>
                  </div>
                }
              </div>

              <!-- Plan Badge -->
              <div class="md:w-48">
                <div class="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl cursor-default">
                  <span class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-0.5">Plano de Interesse</span>
                  <p class="text-sm font-black text-indigo-700 truncate">{{ item.planId?.name }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-3">
                  <!-- Resolution Group -->
                  <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
                    <button 
                      (click)="openResolveDrawer(item, 'COMPLETED')"
                      [disabled]="item.status === 'COMPLETED'"
                      class="px-3 py-2 font-black rounded-xl transition-all text-[10px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                      [class.bg-emerald-600]="item.status === 'COMPLETED'"
                      [class.text-white]="item.status === 'COMPLETED'"
                      [class.bg-white]="item.status !== 'COMPLETED'"
                      [class.text-emerald-600]="item.status !== 'COMPLETED'"
                      [class.hover:bg-emerald-50]="item.status !== 'COMPLETED'"
                      title="Torcedor se associou"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      {{ item.status === 'COMPLETED' ? 'ADESÃO OK' : 'CONCLUIR' }}
                    </button>
                    <button 
                        (click)="openResolveDrawer(item, 'REJECTED')"
                        [disabled]="item.status === 'REJECTED'"
                        class="px-3 py-2 font-black rounded-xl transition-all text-[10px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
                        [class.bg-rose-600]="item.status === 'REJECTED'"
                        [class.text-white]="item.status === 'REJECTED'"
                        [class.bg-white]="item.status !== 'REJECTED'"
                        [class.text-rose-600]="item.status !== 'REJECTED'"
                        [class.hover:bg-rose-50]="item.status !== 'REJECTED'"
                        title="Nao quis se associar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      {{ item.status === 'REJECTED' ? 'DESISTIU' : 'REJEITAR' }}
                    </button>
                  </div>

                  <div class="h-8 w-px bg-slate-200 mx-1"></div>

                  @if (item.isWhatsApp) {
                    <a 
                      [href]="'https://wa.me/55' + cleanPhone(item.phone)" 
                      target="_blank"
                      (click)="onContact(item)"
                      class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 text-xs shadow-lg shadow-emerald-100 cursor-pointer"
                    >
                      WHATSAPP
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                    </a>
                  } @else {
                    <a 
                      [href]="'tel:' + cleanPhone(item.phone)" 
                      (click)="onContact(item)"
                      class="flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-black rounded-2xl hover:bg-sky-700 transition-all active:scale-95 text-xs shadow-lg shadow-sky-100 cursor-pointer"
                    >
                      LIGAR
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </a>
                  }
                  
                  @if (!item.isRead) {
                    <button 
                     (click)="markAsRead(item)"
                     class="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer"
                     title="Marcar como lido"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
                    </button>
                  }
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (resolveDrawerItem()) {
      <app-admin-interest-resolve-drawer
        [item]="resolveDrawerItem()"
        [type]="resolveDrawerType()"
        (close)="closeResolveDrawer()"
        (resolved)="onInterestResolved($event)"
      />
    }
  `,
})
export class AdminInterestsPageComponent implements OnInit {
  private readonly interestApi = inject(MembershipInterestApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly interests = signal<MembershipInterest[]>([]);
  readonly unreadCount = signal(0);
  readonly loading = signal(true);
  
  readonly activeFilter = signal<InterestStatus>('ALL');
  
  readonly resolveDrawerItem = signal<MembershipInterest | null>(null);
  readonly resolveDrawerType = signal<'COMPLETED' | 'REJECTED'>('COMPLETED');

  readonly statusFilters: { label: string, value: InterestStatus }[] = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Pendentes', value: 'PENDING' },
    { label: 'Em Contato', value: 'CONTACTED' },
    { label: 'Concluídos', value: 'COMPLETED' },
    { label: 'Desistências', value: 'REJECTED' },
  ];

  readonly filteredInterests = () => {
    const filter = this.activeFilter();
    const data = this.interests();
    if (filter === 'ALL') return data;
    return data.filter(i => (i.status as string) === (filter as string));
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.interestApi.getAdminInterests()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.interests.set(data as any);
          this.unreadCount.set(data.filter(i => !i.isRead).length);
        },
        error: () => this.toast.showError('Erro ao carregar intenções.')
      });
  }

  cleanPhone(p: string): string {
    return p.replace(/\D/g, '');
  }

  markAsRead(item: MembershipInterest) {
    this.interestApi.markAsRead(item.id).subscribe(() => {
      this.interests.update(list => list.map(i => i.id === item.id ? { ...i, isRead: true } : i));
      this.unreadCount.update(c => Math.max(0, c - 1));
    });
  }

  onContact(item: MembershipInterest) {
    if (item.status === 'PENDING') {
      this.updateInterestStatusLocal(item.id, 'CONTACTED');
      this.interestApi.updateStatus(item.id, 'CONTACTED').subscribe();
    }
    if (!item.isRead) {
      this.markAsRead(item);
    }
  }

  openResolveDrawer(item: MembershipInterest, type: 'COMPLETED' | 'REJECTED') {
    this.resolveDrawerType.set(type);
    this.resolveDrawerItem.set(item);
  }

  closeResolveDrawer() {
    this.resolveDrawerItem.set(null);
  }

  onInterestResolved(updated: MembershipInterest) {
    this.updateInterestStatusLocal(updated.id, updated.status, updated.resolutionNotes);
    this.closeResolveDrawer();
  }

  private updateInterestStatusLocal(id: string, status: string, notes?: string) {
    const item = this.interests().find(i => i.id === id);
    const wasUnread = item ? !item.isRead : false;

    this.interests.update(list => list.map(i => 
      i.id === id ? { ...i, status: status as any, resolutionNotes: notes, isRead: true } : i
    ));

    if (wasUnread) {
      this.unreadCount.update(c => Math.max(0, c - 1));
    }
  }
}
