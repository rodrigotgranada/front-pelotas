import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipInterestApiService, MembershipInterest } from '../../../../core/services/membership-interest-api.service';
import { SpinnerComponent } from '../../../../shared/ui/spinner/spinner.component';
import { finalize } from 'rxjs';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-admin-interests-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="p-6 max-w-6xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Intenções de Sócio</h1>
          <p class="text-slate-500 font-medium mt-1">Gerencie os torcedores interessados em aderir aos planos do clube.</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
           <span class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
           <span class="text-xs font-black text-slate-600 uppercase tracking-widest">{{ unreadCount() }} novas solicitações</span>
        </div>
      </div>

      @if (loading()) {
        <div class="flex translate-y-20 justify-center"><app-spinner size="lg" /></div>
      } @else if (interests().length === 0) {
        <div class="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto text-slate-300 mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
           <p class="text-slate-500 font-bold">Nenhuma intenção registrada ainda.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4">
          @for (item of interests(); track item.id) {
            <div 
              class="group bg-white rounded-3xl border border-slate-200 p-6 transition-all hover:shadow-xl hover:border-indigo-200 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden"
              [class.bg-slate-50]="item.isRead"
              [class.border-l-4]="!item.isRead"
              [class.border-l-indigo-500]="!item.isRead"
            >
              @if (!item.isRead) {
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
                   <a [href]="'mailto:' + item.email" class="hover:text-indigo-600 transition flex items-center gap-1.5">
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
                </div>
              </div>

              <!-- Plan Badge -->
              <div class="md:w-48">
                <div class="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <span class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-0.5">Plano de Interesse</span>
                  <p class="text-sm font-black text-indigo-700 truncate">{{ item.planId?.name }}</p>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-3">
                 <a 
                   [href]="'https://wa.me/55' + cleanPhone(item.phone)" 
                   target="_blank"
                   (click)="onContact(item)"
                   class="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 text-xs shadow-lg shadow-emerald-100"
                 >
                   WHATSAPP
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                 </a>
                 
                 @if (!item.isRead) {
                   <button 
                    (click)="markAsRead(item)"
                    class="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-200 transition-all"
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
  `,
})
export class AdminInterestsPageComponent implements OnInit {
  private readonly interestApi = inject(MembershipInterestApiService);
  private readonly toast = inject(ToastMessagesService);

  readonly interests = signal<MembershipInterest[]>([]);
  readonly unreadCount = signal(0);
  readonly loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.interestApi.getAdminInterests()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.interests.set(data);
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
    if (!item.isRead) {
      this.markAsRead(item);
    }
  }
}
