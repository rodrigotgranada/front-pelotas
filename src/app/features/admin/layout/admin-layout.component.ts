import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { MembershipInterestApiService } from '../../../core/services/membership-interest-api.service';
import { AppSettingsService } from '../../../core/services/app-settings.service';
import { ToastMessagesService } from '../../../core/notifications/toast-messages.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen w-full bg-amber-400 font-sans text-indigo-950 overflow-hidden relative">
      <!-- Sidebar Mobile Overlay -->
      <div 
        *ngIf="isSidebarOpen()" 
        (click)="isSidebarOpen.set(false)"
        class="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
      ></div>

      <!-- Sidebar (Lobo Light/Vibrant Theme) -->
      <aside 
        [class.translate-x-0]="isSidebarOpen()"
        [class.-translate-x-full]="!isSidebarOpen()"
        class="fixed inset-y-0 left-0 w-72 flex flex-col border-r border-indigo-950/10 bg-white shadow-2xl transition-transform duration-500 md:relative md:flex md:translate-x-0 z-[70]"
      >
        <!-- Branding Admin -->
        <div class="flex h-20 shrink-0 items-center justify-between px-6 border-b border-indigo-950/5 bg-amber-50">
           <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-indigo-950 flex items-center justify-center text-amber-400 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
             </div>
             <div class="flex flex-col text-left">
                <span class="text-sm font-black text-indigo-950 tracking-widest uppercase italic leading-none">LOBO<span class="text-amber-500">ADMIN</span></span>
                <span class="text-[7px] font-bold text-indigo-950/40 uppercase tracking-[0.2em] mt-1.5 italic">Gestão de Elite</span>
             </div>
           </div>
           <button (click)="isSidebarOpen.set(false)" class="md:hidden p-2 rounded-lg text-indigo-950/40 hover:text-indigo-950 hover:bg-indigo-950/5 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </button>
        </div>

        <!-- Navigation Admin (Carga Total de Links) -->
        <nav class="flex-1 space-y-1 px-4 py-6 overflow-y-auto custom-scrollbar relative z-10 text-left bg-white">
          
          <!-- Seção Dashboard -->
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1"
            (click)="isSidebarOpen.set(false)"
            class="flex items-center gap-4 rounded-xl px-4 py-2.5 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Dashboard
          </a>

          <!-- CATEGORIA: EDITORIAL -->
          @if (hasAnyRole(['owner', 'socio', 'admin', 'editor'])) {
            <div class="pt-5 pb-1 px-4">
              <span class="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-950/40">Editorial</span>
            </div>
            
            <a routerLink="/admin/news" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
              Notícias
            </a>

            <a routerLink="/admin/newsletter" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              Newsletter
            </a>

            <a routerLink="/admin/historia" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
              História
            </a>
          }

          <!-- CATEGORIA: GERENCIAL -->
          @if (hasAnyRole(['owner', 'socio', 'admin'])) {
            <div class="pt-5 pb-1 px-4">
              <span class="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-950/40">Gestão</span>
            </div>
            
            <a routerLink="/admin/intencoes" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center justify-between rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <div class="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
                Intenções Sócio
              </div>
              <span *ngIf="unreadInterestsCount() > 0" class="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[9px] font-black text-white shadow-lg">
                {{ unreadInterestsCount() }}
              </span>
            </a>

            <a routerLink="/admin/users" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Usuários e Time
            </a>

            @if (settings.isMembershipEnabled()) {
              <a routerLink="/admin/socio/planos" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
                 class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Planos de Sócio
              </a>
            }

            <a routerLink="/admin/sponsors" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v-8h-1a2 2 0 0 0-2 2v0a2 2 0 0 1-2-2v0a2 2 0 0 0-2 2v0a2 2 0 0 1-2-2"/></svg>
              Patrocinadores
            </a>

            @if (settings.isIdolsEnabled()) {
              <a routerLink="/admin/idolos" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
                 class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Ídolos
              </a>
            }

            <a routerLink="/admin/logs" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              Logs Sistema
            </a>
          }

          <!-- CATEGORIA: FUTEBOL -->
          @if (settings.isSquadsEnabled() || settings.isMatchesEnabled()) {
            <div class="pt-5 pb-1 px-4">
              <span class="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-950/40">Futebol</span>
            </div>
          }

          @if (settings.isSquadsEnabled()) {
             <a routerLink="/admin/atletas" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Atletas
            </a>
            
            <a routerLink="/admin/elencos" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18.1H3"/></svg>
              Elencos Históricos
            </a>
          }

          @if (settings.isMatchesEnabled()) {
            <a routerLink="/admin/jogos" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><circle cx="12" cy="12" r="10"/><path d="m8 12 4 4 8-8"/></svg>
              Jogos
            </a>
            
             <a routerLink="/admin/competicoes" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              Campeonatos
            </a>

            <a routerLink="/admin/times" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
               Biblioteca Teams
            </a>
          }

          <!-- CATEGORIA: SISTEMA -->
          @if (hasAnyRole(['owner', 'admin'])) {
            <div class="pt-5 pb-1 px-4">
              <span class="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-950/40">Sistema</span>
            </div>

            <a routerLink="/admin/settings" routerLinkActive="bg-amber-400 text-indigo-950 shadow-md translate-x-1" (click)="isSidebarOpen.set(false)"
               class="flex items-center gap-4 rounded-xl px-4 py-2 text-sm font-black text-indigo-950/60 transition-all hover:bg-amber-100 hover:text-indigo-950 group">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Configurações
            </a>
          }

        </nav>
      </aside>

      <!-- Main Content Area (Amber Background) -->
      <main class="flex flex-1 flex-col overflow-hidden relative">
        <!-- Header de Comando (Vibrant/Light) -->
        <header class="flex h-20 shrink-0 items-center justify-between border-b border-indigo-950/10 bg-white/80 backdrop-blur-md px-6 md:px-10 z-50">
          <div class="flex items-center gap-6 text-left">
            <!-- Mobile Menu Toggle -->
            <button (click)="isSidebarOpen.set(true)" class="md:hidden p-2 rounded-xl bg-amber-400 text-indigo-950 hover:bg-indigo-950 hover:text-amber-400 transition-all active:scale-95 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="flex flex-col">
               <h1 class="text-xl font-black text-indigo-950 tracking-tighter uppercase italic leading-none">Arena de Comando</h1>
               <span class="text-[8px] font-black text-indigo-950/40 uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Painel Administrativo Operante
               </span>
            </div>
          </div>
          
          <div class="flex items-center gap-6">
             <!-- Dropdown do Usuário (Premium Light) -->
             <div class="relative">
                <button
                  id="user-menu-button"
                  type="button"
                  (click)="toggleDropdown()"
                  class="flex items-center gap-3 px-4 py-2 rounded-2xl bg-indigo-950 text-amber-400 hover:bg-indigo-900 transition-all group active:scale-95 shadow-lg"
                  [attr.aria-expanded]="dropdownOpen()"
                >
                  <div class="flex flex-col text-right hidden sm:flex">
                     <span class="text-[10px] font-black text-white uppercase italic leading-none truncate max-w-[120px]">{{ me()?.firstName }}</span>
                     <span class="text-[7px] font-bold text-amber-400/60 uppercase tracking-widest mt-1 italic">{{ roleCode }}</span>
                  </div>
                  @if (me()?.photoUrl) {
                    <img [src]="me()!.photoUrl" class="h-9 w-9 rounded-xl object-cover border-2 border-amber-400/20 group-hover:border-amber-400 transition-all shadow-xl" />
                  } @else {
                    <div class="h-9 w-9 rounded-xl bg-amber-400 text-indigo-950 font-black text-sm flex items-center justify-center shadow-xl group-hover:scale-105 transition-all">
                      {{ me()?.firstName?.charAt(0)?.toUpperCase() || 'U' }}
                    </div>
                  }
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                       class="text-amber-400 transition-transform duration-300" [class.rotate-180]="dropdownOpen()">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                @if (dropdownOpen()) {
                  <div
                    id="user-dropdown"
                    class="absolute right-0 top-full mt-4 w-56 rounded-3xl bg-white border border-indigo-950/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-[100] animate-in fade-in zoom-in slide-in-from-top-4 duration-300"
                  >
                    <div class="px-5 py-4 border-b border-indigo-950/5 bg-amber-50 text-left">
                      <p class="text-xs font-black text-indigo-950 uppercase italic truncate">{{ me()?.firstName }} {{ me()?.lastName }}</p>
                      <p class="text-[8px] text-indigo-950/40 uppercase tracking-widest mt-1 italic truncate">{{ me()?.email }}</p>
                    </div>

                    <div class="p-2 space-y-1">
                      <a routerLink="/" (click)="closeDropdown()"
                         class="flex items-center gap-3 w-full px-4 py-3 text-xs font-black text-indigo-950 hover:bg-amber-400 rounded-2xl transition-all italic tracking-widest uppercase text-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Ver Portal
                      </a>
                      
                      <a routerLink="/app/me" (click)="closeDropdown()"
                         class="flex items-center gap-3 w-full px-4 py-3 text-xs font-black text-indigo-950/60 hover:bg-amber-100 rounded-2xl transition-all italic tracking-widest uppercase text-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                        Meu Perfil
                      </a>

                      <button type="button" (click)="onLogout()"
                              class="flex items-center gap-3 w-full px-4 py-3 text-xs font-black text-indigo-950 hover:bg-amber-400 rounded-2xl transition-all italic tracking-widest uppercase mt-4 text-left">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        Sair do Comando
                      </button>
                    </div>
                  </div>
                }
             </div>
          </div>
        </header>

        <!-- Scrollable content Area (Vibrant Amber Background) -->
        <div class="flex-1 overflow-auto custom-scrollbar relative z-10 p-4 md:p-8">
          <div class="mx-auto max-w-[1600px] bg-white/90 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/50 p-6 lg:p-12 min-h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
             <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(250, 204, 21, 0.5); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly session = inject(AuthSessionService);
  private readonly authApi = inject(AuthApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly router = inject(Router);
  private readonly interestApi = inject(MembershipInterestApiService);
  readonly settings = inject(AppSettingsService);
  
  readonly me = this.session.me;
  readonly isSidebarOpen = signal(false);
  readonly unreadInterestsCount = signal(0);
  readonly dropdownOpen = signal(false);
  
  private pollInterval?: any;

  ngOnInit() {
    this.refreshUnreadCount();
    // Poll every 1 minute
    this.pollInterval = setInterval(() => this.refreshUnreadCount(), 60000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#user-menu-button') && !target.closest('#user-dropdown')) {
      this.dropdownOpen.set(false);
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  onLogout(): void {
    this.dropdownOpen.set(false);
    this.authApi.logout();
    this.session.clear();
    this.toast.showLogoutInfo();
    void this.router.navigateByUrl('/');
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
