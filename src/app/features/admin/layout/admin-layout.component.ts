import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { MembershipInterestApiService } from '../../../core/services/membership-interest-api.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
    <div class="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      <!-- Sidebar Mobile Overlay -->
      <div 
        *ngIf="isSidebarOpen()" 
        (click)="isSidebarOpen.set(false)"
        class="fixed inset-0 bg-slate-900/50 z-30 md:hidden animate-in fade-in duration-300"
      ></div>

      <!-- Sidebar (Desktop & Mobile) -->
      <aside 
        [class.translate-x-0]="isSidebarOpen()"
        [class.-translate-x-full]="!isSidebarOpen()"
        class="fixed inset-y-0 left-0 w-64 flex-col border-r border-slate-200 bg-white z-40 shadow-xl transition-transform duration-300 md:relative md:flex md:translate-x-0 md:shadow-sm"
      >
        <div class="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-100">
          <span class="text-xl font-black tracking-tight text-slate-900 line-clamp-1">
            Lobao<span class="text-cyan-600">Admin</span>
          </span>
          <button (click)="isSidebarOpen.set(false)" class="md:hidden text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <nav class="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          <!-- Modulos Gerais (Todos veem) -->
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
            (click)="isSidebarOpen.set(false)"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </a>

          <a
            routerLink="/admin/content"
            routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
            (click)="isSidebarOpen.set(false)"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Conteudo (Landing)
          </a>

          <!-- Modulos Editoriais -->
          @if (hasAnyRole(['owner', 'socio', 'admin', 'editor'])) {
            <div class="pt-4 pb-2">
              <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Editorial</p>
            </div>
            
            <a
              routerLink="/admin/news"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
              Notícias e Matérias
            </a>

            <a
              routerLink="/admin/newsletter"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              Inscritos Newsletter
            </a>

            <a
              routerLink="/admin/historia"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
              História do Clube
            </a>
          }

          <!-- Modulos Gerenciais (Owner, Socio, Admin) -->
          @if (hasAnyRole(['owner', 'socio', 'admin'])) {
            <div class="pt-4 pb-2">
              <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Gerencial</p>
            </div>
            
            <a
              routerLink="/admin/intencoes"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 group"
            >
              <div class="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                Intenções de Sócio
              </div>
              <span 
                *ngIf="unreadInterestsCount() > 0"
                class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white shadow-sm shadow-red-200"
              >
                {{ unreadInterestsCount() }}
              </span>
            </a>

            <a
              routerLink="/admin/users"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Usuarios e Time
            </a>

            <a
              routerLink="/admin/socio/planos"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Planos de Sócio
            </a>

            <a
              routerLink="/admin/sponsors"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
              Patrocinadores
            </a>
            
            <a
              routerLink="/admin/logs"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              Logs do Sistema
            </a>

            <a
              routerLink="/admin/settings"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Configurações
            </a>
          }

          <!-- Modulos Restritos (Owner, Socio) -->
          @if (hasAnyRole(['owner', 'socio'])) {
            <div class="pt-4 pb-2">
              <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Restrito</p>
            </div>
            
            <a
              routerLink="/admin/finance"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              (click)="isSidebarOpen.set(false)"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Financeiro
            </a>
          }
        </nav>

        <!-- User bottom panel -->
        <div class="border-t border-slate-100 p-4">
          <a routerLink="/app/me" class="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 cursor-pointer">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold">
              {{ me()?.firstName?.charAt(0) || 'U' }}
            </div>
            <div class="flex flex-col truncate">
              <span class="truncate text-sm font-semibold text-left">{{ me()?.firstName }} {{ me()?.lastName }}</span>
              <span class="truncate text-[10px] text-slate-500 uppercase font-black tracking-widest text-left mt-0.5">{{ roleCode }}</span>
            </div>
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex flex-1 flex-col overflow-hidden relative">
        <!-- Dashboard Topbar (Mobile Menu Toggle, Breadcrumbs, etc) -->
        <header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-8 z-10">
          <div class="flex items-center gap-4">
            <!-- Mobile Menu Button -->
            <button (click)="isSidebarOpen.set(true)" class="md:hidden text-slate-500 hover:text-cyan-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 class="text-lg font-bold text-slate-800 hidden md:block">Painel de Controle</h1>
            <!-- Mobile Branding -->
            <div class="md:hidden flex items-center gap-2">
              <span class="text-lg font-black tracking-tight text-slate-900">
                Lobao<span class="text-cyan-600">Admin</span>
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <a routerLink="/" class="text-xs md:text-sm font-bold text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg hover:bg-cyan-100 transition shadow-sm border border-cyan-100">Ver site</a>
          </div>
        </header>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-auto bg-slate-50/50 p-4 md:p-8">
          <div class="mx-auto max-w-6xl">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly session = inject(AuthSessionService);
  private readonly interestApi = inject(MembershipInterestApiService);
  
  readonly me = this.session.me;
  readonly isSidebarOpen = signal(false);
  readonly unreadInterestsCount = signal(0);
  
  private pollInterval?: any;

  ngOnInit() {
    this.refreshUnreadCount();
    // Poll every 1 minute
    this.pollInterval = setInterval(() => this.refreshUnreadCount(), 60000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  refreshUnreadCount() {
    if (this.hasAnyRole(['owner', 'admin'])) {
      this.interestApi.getUnreadCount().subscribe(res => this.unreadInterestsCount.set(res.count));
    }
  }

  get roleCode(): string {
    return (this.me() as any)?.roleCode || 'guest';
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.roleCode);
  }
}
