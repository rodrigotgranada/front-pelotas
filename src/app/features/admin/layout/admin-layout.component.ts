import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from '../../../core/auth/auth-session.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <!-- Sidebar Desktop -->
      <aside class="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex z-20 shadow-sm">
        <div class="flex h-16 shrink-0 items-center px-6 border-b border-slate-100">
          <span class="text-xl font-black tracking-tight text-slate-900">
            Lobao<span class="text-cyan-600">Admin</span>
          </span>
        </div>

        <nav class="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          <!-- Modulos Gerais (Todos veem) -->
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </a>

          <a
            routerLink="/admin/content"
            routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
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
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
              Notícias e Matérias
            </a>
          }

          <!-- Modulos Gerenciais (Owner, Socio, Admin) -->
          @if (hasAnyRole(['owner', 'socio', 'admin'])) {
            <div class="pt-4 pb-2">
              <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Gerencial</p>
            </div>
            
            <a
              routerLink="/admin/users"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Usuarios e Time
            </a>
            
            <a
              routerLink="/admin/logs"
              routerLinkActive="bg-cyan-50 text-cyan-700 font-semibold"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              Logs do Sistema
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
              <span class="truncate text-sm font-semibold">{{ me()?.firstName }} {{ me()?.lastName }}</span>
              <span class="truncate text-xs text-slate-500 uppercase tracking-wider">{{ roleCode }}</span>
            </div>
          </a>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex flex-1 flex-col overflow-hidden relative">
        <!-- Dashboard Topbar (Mobile Menu Toggle, Breadcrumbs, etc) -->
        <header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-8 z-10">
          <div class="flex items-center gap-4">
            <!-- Mobile Menu Button (Placeholder for now) -->
            <button class="md:hidden text-slate-500 hover:text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 class="text-lg font-bold text-slate-800 hidden md:block">Painel de Controle</h1>
          </div>
          
          <div class="flex items-center gap-4">
            <a routerLink="/" class="text-sm font-semibold text-cyan-700 hover:underline">Ver site</a>
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
export class AdminLayoutComponent {
  private readonly session = inject(AuthSessionService);
  
  readonly me = this.session.me;

  get roleCode(): string {
    return (this.me() as any)?.roleCode || 'guest';
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.roleCode);
  }
}
