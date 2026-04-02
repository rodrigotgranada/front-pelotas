import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { AppSettingsService, THEME_PRESETS } from '../../../../core/services/app-settings.service';
import { NewsApiService } from '../../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { compressImage } from '../../../../shared/utils/image-compress.util';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto pb-20 flex flex-col gap-8">

      <!-- Header -->
      <div class="flex items-center gap-4">
        <a routerLink="/admin/dashboard" class="text-slate-500 hover:text-slate-900 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <div>
          <h1 class="text-2xl font-black tracking-tight text-slate-900">Configurações do Portal</h1>
          <p class="text-sm text-slate-500 mt-0.5">Identidade visual e tema da campanha ativa</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap">
        <button 
          (click)="activeTab.set('identidade')"
          [class]="activeTab() === 'identidade' 
            ? 'px-6 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-sm' 
            : 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition'"
        >
          Identidade
        </button>
        <button 
          (click)="activeTab.set('tema')"
          [class]="activeTab() === 'tema' 
            ? 'px-6 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-sm' 
            : 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition'"
        >
          Personalização
        </button>
        <button 
          (click)="activeTab.set('modulos')"
          [class]="activeTab() === 'modulos' 
            ? 'px-6 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-sm' 
            : 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition'"
        >
          Módulos
        </button>
        <button 
          (click)="activeTab.set('rodape')"
          [class]="activeTab() === 'rodape' 
            ? 'px-6 py-2 bg-white rounded-xl text-sm font-bold text-slate-900 shadow-sm' 
            : 'px-6 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition'"
        >
          Rodapé & Contato
        </button>
      </div>

      <!-- Tab: Identidade Visual -->
      @if (activeTab() === 'identidade') {
        <div class="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Escudo do Clube</h2>
            </div>
            
            <div class="p-6">
              <div class="flex flex-col sm:flex-row gap-6 items-start">
                <div class="flex flex-col gap-2 items-center">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distintivo atual</p>
                  <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    @if (badgeUrl()) {
                      <img [src]="badgeUrl()" alt="Distintivo" class="w-full h-full object-contain p-1" />
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-slate-300">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    }
                  </div>
                </div>

                <div class="flex-1 flex flex-col gap-4">
                  <div>
                    <p class="text-sm font-semibold text-slate-700 mb-1">Foto do Distintivo/Escudo</p>
                    <p class="text-xs text-slate-500">A imagem é enviada inteira (sem recorte) e redimensionada automaticamente. Recomendado PNG com fundo transparente.</p>
                  </div>

                  @if (!badgeUrl()) {
                    <label class="flex flex-col items-center justify-center w-full h-28 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                      <div class="flex flex-col items-center gap-2">
                        <svg class="w-7 h-7 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p class="text-xs text-slate-500"><span class="font-semibold">Clique para enviar o distintivo</span></p>
                        <p class="text-[10px] text-slate-400">PNG, JPG, WEBP — recomendado PNG com fundo transparente</p>
                      </div>
                      <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onBadgeSelected($event)" />
                    </label>
                  } @else {
                    <div class="flex items-center gap-3">
                      <label class="cursor-pointer px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        Trocar imagem
                        <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onBadgeSelected($event)" />
                      </label>
                      <button type="button" (click)="removeBadge()" class="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                        Remover
                      </button>
                    </div>
                  }
                </div>
              </div>

              @if (badgeSaving()) {
                <div class="flex items-center gap-2 text-xs text-slate-500 mt-4">
                  <svg class="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando distintivo...
                </div>
              }
            </div>
          </section>

          <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Imagem Padrão de Notícias</h2>
            </div>
            
            <div class="p-6">
              <div class="flex flex-col sm:flex-row gap-6 items-start">
                <div class="w-full sm:w-48 aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                   @if (defaultNewsUrl()) {
                      <img [src]="defaultNewsUrl()" alt="Default News" class="w-full h-full object-cover" />
                    } @else {
                      <div class="flex flex-col items-center gap-1 text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Zm0-6 5-5 5 5 5-5 3 3"/></svg>
                        <span class="text-[10px] font-bold uppercase tracking-tighter">Sem Imagem</span>
                      </div>
                    }
                </div>
                <div class="flex-1 flex flex-col gap-3">
                  <p class="text-xs text-slate-500 leading-relaxed">
                    Esta imagem será exibida em todas as notícias que não possuírem uma imagem de capa definida. 
                    Recomendado: 1280x720px (16:9).
                  </p>
                  
                  <div class="flex items-center gap-3 mt-1">
                    <label class="cursor-pointer px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                      {{ defaultNewsUrl() ? 'Trocar Imagem' : 'Enviar Imagem' }}
                      <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onDefaultNewsImageSelected($event)" />
                    </label>
                    @if (defaultNewsUrl()) {
                      <button type="button" (click)="removeDefaultNewsImage()" class="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition">
                        Remover
                      </button>
                    }
                  </div>

                  @if (defaultNewsSaving()) {
                    <div class="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando imagem padrão...
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Escudos Padrão (Fallback)</h2>
            </div>
            
            <div class="p-6 space-y-8">
              <!-- Default Team Logo -->
              <div class="flex flex-col sm:flex-row gap-6 items-start border-b border-slate-50 pb-8">
                <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                   @if (defaultTeamUrl()) {
                      <img [src]="defaultTeamUrl()" alt="Default Team" class="w-full h-full object-contain p-2" />
                    } @else {
                      <div class="flex flex-col items-center gap-1 text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
                      </div>
                    }
                </div>
                <div class="flex-1 flex flex-col gap-3">
                  <h4 class="text-xs font-black text-slate-900 uppercase tracking-tight">Escudo Padrão de Times</h4>
                  <p class="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-widest">
                    Exibido para adversários sem escudo cadastrado.
                  </p>
                  
                  <div class="flex items-center gap-3 mt-1">
                    <label class="cursor-pointer px-4 py-2 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                       {{ defaultTeamUrl() ? 'Trocar' : 'Enviar' }}
                      <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onDefaultTeamImageSelected($event)" />
                    </label>
                    @if (defaultTeamUrl()) {
                      <button type="button" (click)="removeDefaultTeamImage()" class="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-[10px] font-black uppercase text-rose-700 hover:bg-rose-100 transition">
                        Remover
                      </button>
                    }
                  </div>
                </div>
              </div>

              <!-- Default Competition Logo -->
              <div class="flex flex-col sm:flex-row gap-6 items-start">
                <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                   @if (defaultCompUrl()) {
                      <img [src]="defaultCompUrl()" alt="Default Competition" class="w-full h-full object-contain p-2" />
                    } @else {
                      <div class="flex flex-col items-center gap-1 text-slate-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                      </div>
                    }
                </div>
                <div class="flex-1 flex flex-col gap-3">
                  <h4 class="text-xs font-black text-slate-900 uppercase tracking-tight">Escudo Padrão de Campeonatos</h4>
                  <p class="text-[10px] text-slate-500 leading-relaxed uppercase font-bold tracking-widest">
                    Exibido para competições sem imagem de capa.
                  </p>
                  
                  <div class="flex items-center gap-3 mt-1">
                    <label class="cursor-pointer px-4 py-2 rounded-lg border border-slate-200 bg-white text-[10px] font-black uppercase text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                       {{ defaultCompUrl() ? 'Trocar' : 'Enviar' }}
                      <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onDefaultCompImageSelected($event)" />
                    </label>
                    @if (defaultCompUrl()) {
                      <button type="button" (click)="removeDefaultCompImage()" class="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 text-[10px] font-black uppercase text-rose-700 hover:bg-rose-100 transition">
                        Remover
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      }

      <!-- Tab: Tema / Campanha -->
      @if (activeTab() === 'tema') {
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Tema da Campanha</h2>
            <p class="text-xs text-slate-500 mt-0.5">Altera a cor principal do portal em tempo real para todos os usuários</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (preset of themePresets; track preset.id) {
                <button
                  type="button"
                  (click)="selectTheme(preset.id)"
                  [class]="selectedTheme() === preset.id
                    ? 'relative rounded-2xl border-2 border-brand-500 bg-brand-50 p-4 text-left transition shadow-md ring-2 ring-brand-200'
                    : 'relative rounded-2xl border-2 border-slate-200 bg-white p-4 text-left hover:border-slate-300 transition'"
                >
                  <div class="flex gap-1.5 mb-3">
                    @for (shade of getSwatches(preset); track shade) {
                      <div class="h-6 w-6 rounded-full shadow-sm border border-black/5 flex-shrink-0" [style.background]="shade"></div>
                    }
                  </div>
                  <p class="font-bold text-slate-900 text-sm">{{ preset.label }}</p>
                  @if (selectedTheme() === preset.id) {
                    <span class="absolute top-3 right-3 bg-brand-500 text-white rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </span>
                  }
                </button>
              }
            </div>

            <div class="mt-6 flex items-center justify-between">
              <p class="text-xs text-slate-500">
                Preview ao vivo — a alteração só será persistida após clicar em <strong>Salvar</strong>.
              </p>
              <button
                type="button"
                (click)="saveTheme()"
                [disabled]="themeSaving()"
                class="px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                @if (themeSaving()) {
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                } @else {
                  Salvar Tema
                }
              </button>
            </div>
          </div>
        </section>
      }

      <!-- Tab: Módulos -->
      @if (activeTab() === 'modulos') {
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Gestão de Módulos</h2>
            <p class="text-xs text-slate-500 mt-0.5">Habilite ou desabilite funcionalidades inteiras do portal</p>
          </div>
          <div class="p-6 space-y-6">
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Módulo de Sócios</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Se desativado, remove botões de adesão e bloqueia rotas de inscrição.</p>
                </div>
              </div>

              <!-- Toggle -->
              <button
                type="button"
                (click)="toggleMembership()"
                [disabled]="membershipSaving()"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                [class.bg-brand-600]="isMembershipEnabled()"
                [class.bg-slate-200]="!isMembershipEnabled()"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="isMembershipEnabled()"
                  [class.translate-x-0]="!isMembershipEnabled()"
                ></span>
              </button>
            </div>

            @if (membershipSaving()) {
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando alteração...
              </div>
            }

            <!-- Sponsors Toggle -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mt-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Módulo de Patrocinadores</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Se desativado, o carrossel de patrocinadores não será renderizado na tela inicial (Home).</p>
                </div>
              </div>

              <!-- Toggle -->
              <button
                type="button"
                (click)="toggleSponsors()"
                [disabled]="sponsorsSaving()"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                [class.bg-brand-600]="isSponsorsEnabled()"
                [class.bg-slate-200]="!isSponsorsEnabled()"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="isSponsorsEnabled()"
                  [class.translate-x-0]="!isSponsorsEnabled()"
                ></span>
              </button>
            </div>

            @if (sponsorsSaving()) {
              <div class="flex items-center gap-2 text-xs text-slate-500">
                <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando alteração...
              </div>
            }

            <!-- Squads Toggle -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mt-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M7 11V7l5-5 5 5v4"/><path d="M11 11.5l1.5 1.5 3-3"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Módulo de Elencos</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Se desativado, remove o link 'Elenco' do menu e bloqueia o acesso à página de jogadores.</p>
                </div>
              </div>

              <!-- Toggle -->
              <button
                type="button"
                (click)="toggleSquads()"
                [disabled]="squadsSaving()"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                [class.bg-brand-600]="isSquadsEnabled()"
                [class.bg-slate-200]="!isSquadsEnabled()"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="isSquadsEnabled()"
                  [class.translate-x-0]="!isSquadsEnabled()"
                ></span>
              </button>
            </div>

            @if (squadsSaving()) {
              <div class="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando alteração...
              </div>
            }

            <!-- Newsletter Toggle -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mt-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Módulo de Newsletter</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Se desativado, esconde todos os widgets de captura de e-mail e desativa o rodapé especial.</p>
                </div>
              </div>

              <!-- Toggle -->
              <button
                type="button"
                (click)="toggleNewsletterVisibility()"
                [disabled]="newsletterSaving()"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                [class.bg-brand-600]="isNewsletterEnabled()"
                [class.bg-slate-200]="!isNewsletterEnabled()"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="isNewsletterEnabled()"
                  [class.translate-x-0]="!isNewsletterEnabled()"
                ></span>
              </button>
            </div>

            @if (newsletterSaving()) {
              <div class="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando alteração...
              </div>
            }
            
            <!-- Idols Toggle -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mt-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Módulo de Ídolos</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Se desativado, remove o link 'Ídolos' do menu e bloqueia o acesso à galeria de ídolos.</p>
                </div>
              </div>

              <!-- Toggle -->
              <button
                type="button"
                (click)="toggleIdols()"
                [disabled]="idolsSaving()"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                [class.bg-brand-600]="isIdolsEnabled()"
                [class.bg-slate-200]="!isIdolsEnabled()"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="isIdolsEnabled()"
                  [class.translate-x-0]="!isIdolsEnabled()"
                ></span>
              </button>
            </div>

            @if (idolsSaving()) {
              <div class="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando alteração...
              </div>
            }

            <!-- Matches Toggle -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mt-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 4 4 8-8"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Módulo de Jogos</h3>
                  <p class="text-xs text-slate-500 mt-0.5">Se desativado, remove calendários e resultados do site e bloqueia as rotas de gestão.</p>
                </div>
              </div>

              <!-- Toggle -->
              <button
                type="button"
                (click)="toggleMatches()"
                [disabled]="matchesSaving()"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                [class.bg-brand-600]="isMatchesEnabled()"
                [class.bg-slate-200]="!isMatchesEnabled()"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  [class.translate-x-5]="isMatchesEnabled()"
                  [class.translate-x-0]="!isMatchesEnabled()"
                ></span>
              </button>
            </div>

            @if (matchesSaving()) {
              <div class="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <svg class="animate-spin h-3.5 w-3.5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando alteração...
              </div>
            }
          </div>
        </section>
      }

      <!-- Tab: Rodapé & Contato -->
      @if (activeTab() === 'rodape') {
        <section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Rodapé Público</h2>
            <p class="text-xs text-slate-500 mt-0.5">Informações de contato institucionais, mapa e links</p>
          </div>
          <form [formGroup]="footerForm" (ngSubmit)="saveFooter()" class="p-6 space-y-6">
            
            <div class="space-y-4">
              <h3 class="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Informações de Contato</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-700">Telefone Principal</label>
                  <div class="flex items-center gap-3">
                    <input type="text" formControlName="footerPhone" class="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm">
                    <button
                      type="button"
                      (click)="footerForm.get('footerIsWhatsapp')?.setValue(!footerForm.get('footerIsWhatsapp')?.value)"
                      class="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0"
                      [class]="footerForm.get('footerIsWhatsapp')?.value 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </button>
                  </div>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-700">E-mail Oficial</label>
                  <input type="email" formControlName="footerEmail" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm">
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Endereço Completo</label>
                <input type="text" formControlName="footerAddress" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm">
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-700">Google Maps Embed URL / Iframe</label>
                <textarea formControlName="footerMapsEmbedUrl" rows="3" class="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm font-mono text-slate-600 placeholder:text-slate-300" placeholder="Cole o código do iframe do mapa aqui..."></textarea>
                <p class="text-[10px] text-slate-400">Entre no Google Maps, clique em "Compartilhar", "Incorporar um mapa" e copie o código HTML (&lt;iframe ...&gt;).</p>
              </div>
            </div>

            <div class="space-y-4 pt-4" formArrayName="footerSocialLinks">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 class="text-xs font-black uppercase text-slate-400 tracking-widest">Redes Sociais</h3>
                <button type="button" (click)="addSocialLink()" class="text-xs bg-brand-50 text-brand-700 font-bold px-3 py-1.5 rounded-lg hover:bg-brand-100 border border-brand-200 transition">
                  + Add Rede Social
                </button>
              </div>

              @if (footerSocialLinksFormArray.controls.length === 0) {
                <div class="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                  <p class="text-xs text-slate-400">Nenhuma rede social cadastrada.</p>
                </div>
              }
              
              <div class="grid grid-cols-1 gap-3">
                @for (social of footerSocialLinksFormArray.controls; track $index) {
                  <div [formGroupName]="$index" class="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-end sm:items-center">
                    <div class="flex-none w-full sm:w-40 space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plataforma</label>
                      <select formControlName="type" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="twitter">X (Twitter)</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                    <div class="flex-1 w-full space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rótulo (Opcional - Ex: Loja)</label>
                      <input type="text" formControlName="label" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="Ex: Oficial">
                    </div>
                    <div class="flex-1 w-full space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Link (URL Completa)</label>
                      <input type="url" formControlName="url" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm" placeholder="https://...">
                    </div>
                    <button type="button" (click)="removeSocialLink($index)" class="p-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition" title="Remover rede social">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                }
              </div>
            </div>

            <div class="space-y-4 pt-4" formArrayName="footerLinks">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 class="text-xs font-black uppercase text-slate-400 tracking-widest">Links Úteis</h3>
                <button type="button" (click)="addFooterLink()" class="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">
                  + Add Link
                </button>
              </div>
              
              @for (link of footerLinksFormArray.controls; track i; let i = $index) {
                <div [formGroupName]="i" class="flex gap-4 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div class="flex-1 space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título do Link</label>
                    <input type="text" formControlName="label" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Ex: Portal da Transparência">
                  </div>
                  <div class="flex-1 space-y-1">
                    <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">URL do Link</label>
                    <input type="text" formControlName="url" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="https://...">
                  </div>
                  <div class="pt-5 mt-1">
                    <button type="button" (click)="removeFooterLink(i)" class="p-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition" title="Remover link">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>

            <div class="space-y-4 pt-4 border-t border-slate-100">
              <h3 class="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Créditos de Desenvolvimento</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Desenvolvedor</p>
                  <p class="text-sm font-semibold text-slate-700">{{ appSettings.footerDevName() || 'N/A' }}</p>
                </div>
                <div class="space-y-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link / Portfólio</p>
                  <p class="text-sm font-semibold text-brand-600 truncate underline">{{ appSettings.footerDevUrl() || 'N/A' }}</p>
                </div>
              </div>
              <p class="text-[10px] text-slate-400 mt-2 italic">* Estes dados são definidos no código do portal e não podem ser alterados pelo painel administrativo.</p>
            </div>

            <div class="pt-6 flex justify-end">
              <button
                type="submit"
                [disabled]="footerSaving()"
                class="px-8 py-3 rounded-xl bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                @if (footerSaving()) {
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando Dados...
                } @else {
                  Salvar Rodapé
                }
              </button>
            </div>
          </form>
        </section>
      }
    </div>
  `,
})
export class AdminSettingsPageComponent implements OnInit {
  protected readonly appSettings = inject(AppSettingsService);
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly fb = inject(FormBuilder);

  readonly themePresets = THEME_PRESETS;
  readonly badgeUrl = this.appSettings.badgeUrl;
  readonly defaultNewsUrl = this.appSettings.defaultNewsImageUrl;
  readonly defaultTeamUrl = this.appSettings.defaultTeamLogoUrl;
  readonly defaultCompUrl = this.appSettings.defaultCompetitionLogoUrl;
  readonly selectedTheme = signal(this.appSettings.themePreset());

  readonly activeTab = signal<'identidade' | 'tema' | 'modulos' | 'rodape'>('identidade');
  readonly badgeSaving = signal(false);
  readonly defaultNewsSaving = signal(false);
  readonly defaultTeamSaving = signal(false);
  readonly defaultCompSaving = signal(false);
  readonly membershipSaving = signal(false);
  readonly sponsorsSaving = signal(false);
  readonly squadsSaving = signal(false);
  readonly newsletterSaving = signal(false);
  readonly themeSaving = signal(false);
  readonly footerSaving = signal(false);
  readonly idolsSaving = signal(false);
  readonly matchesSaving = signal(false);
  readonly isMembershipEnabled = this.appSettings.isMembershipEnabled;
  readonly isSponsorsEnabled = this.appSettings.isSponsorsEnabled;
  readonly isSquadsEnabled = this.appSettings.isSquadsEnabled;
  readonly isNewsletterEnabled = this.appSettings.isNewsletterEnabled;
  readonly isIdolsEnabled = this.appSettings.isIdolsEnabled;
  readonly isMatchesEnabled = this.appSettings.isMatchesEnabled;

  readonly footerForm: FormGroup = this.fb.group({
    footerPhone: [''],
    footerIsWhatsapp: [false],
    footerEmail: [''],
    footerAddress: [''],
    footerMapsEmbedUrl: [''],
    footerSocialLinks: this.fb.array([]),
    footerLinks: this.fb.array([])
  });

  get footerSocialLinksFormArray(): FormArray {
    return this.footerForm.get('footerSocialLinks') as FormArray;
  }

  get footerLinksFormArray(): FormArray {
    return this.footerForm.get('footerLinks') as FormArray;
  }

  constructor() {
    // Reactively update form when settings signals change
    effect(() => {
      const socials = this.appSettings.footerSocialLinks();
      const links = this.appSettings.footerLinks();
      
      // Update basic fields
      this.footerForm.patchValue({
        footerPhone: this.appSettings.footerPhone() || '',
        footerIsWhatsapp: this.appSettings.footerIsWhatsapp() || false,
        footerEmail: this.appSettings.footerEmail() || '',
        footerAddress: this.appSettings.footerAddress() || '',
        footerMapsEmbedUrl: this.appSettings.footerMapsEmbedUrl() || '',
      }, { emitEvent: false });

      // Update Social Array
      this.footerSocialLinksFormArray.clear({ emitEvent: false });
      for (const s of socials) {
        this.footerSocialLinksFormArray.push(this.fb.group({
          type: [s.type || 'instagram'],
          label: [s.label || ''],
          url: [s.url || '']
        }), { emitEvent: false });
      }

      // Update Links Array
      this.footerLinksFormArray.clear({ emitEvent: false });
      for (const link of links) {
        this.footerLinksFormArray.push(this.fb.group({
          label: [link.label || ''],
          url: [link.url || '']
        }), { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.selectedTheme.set(this.appSettings.themePreset());
  }

  addSocialLink() {
    this.footerSocialLinksFormArray.push(this.fb.group({ type: ['instagram'], label: [''], url: [''] }));
  }

  removeSocialLink(index: number) {
    this.footerSocialLinksFormArray.removeAt(index);
  }

  addFooterLink() {
    this.footerLinksFormArray.push(this.fb.group({ label: [''], url: [''] }));
  }

  removeFooterLink(index: number) {
    this.footerLinksFormArray.removeAt(index);
  }

  async saveFooter() {
    this.footerSaving.set(true);
    try {
      const raw = this.footerForm.getRawValue();
      const keys = Object.keys(raw);
      
      // Save basic settings
      const basicKeys = ['footerPhone', 'footerIsWhatsapp', 'footerEmail', 'footerAddress', 'footerMapsEmbedUrl'];
      for (const k of basicKeys) {
        const val = String(raw[k]);
        await this.appSettings.saveSetting(k, val);
        (this.appSettings as any)[k].set(raw[k]);
      }

      // Save footerSocialLinks as JSON string
      const socialsJson = JSON.stringify(raw.footerSocialLinks);
      await this.appSettings.saveSetting('footerSocialLinks', socialsJson);
      this.appSettings.footerSocialLinks.set(raw.footerSocialLinks);

      // Save footerLinks as JSON string
      const linksJson = JSON.stringify(raw.footerLinks);
      await this.appSettings.saveSetting('footerLinks', linksJson);
      this.appSettings.footerLinks.set(raw.footerLinks);

      this.toast.showSuccess('Configurações de rodapé salvas!');
    } catch {
      this.toast.showError('Erro ao salvar as configurações.');
    } finally {
      this.footerSaving.set(false);
    }
  }

  getSwatches(preset: (typeof THEME_PRESETS)[0]): string[] {
    return [
      preset.colors['--theme-brand-300'],
      preset.colors['--theme-brand-500'],
      preset.colors['--theme-brand-700'],
    ];
  }

  selectTheme(id: string) {
    this.selectedTheme.set(id);
    this.appSettings.applyTheme(id);
  }

  async saveTheme() {
    this.themeSaving.set(true);
    try {
      await this.appSettings.saveSetting('themePreset', this.selectedTheme());
      this.appSettings.themePreset.set(this.selectedTheme());
      this.toast.showSuccess('Tema salvo com sucesso!');
    } catch {
      this.toast.showError('Erro ao salvar o tema.');
    } finally {
      this.themeSaving.set(false);
    }
  }

  onBadgeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = ''; // Reset so same file can be re-selected
    this.resizeAndUpload(file);
  }

  /**
   * Resizes the image to fit within 256×256 (preserving aspect ratio)
   * using a canvas, then uploads directly — no cropper needed for a badge/shield.
   */
  private resizeAndUpload(file: File): void {
    this.badgeSaving.set(true);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const MAX = 256;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);

      // Use PNG to preserve transparency (important for shields without background)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            this.toast.showError('Erro ao processar imagem.');
            this.badgeSaving.set(false);
            return;
          }
          this.uploadBadge(new File([blob], 'badge.png', { type: 'image/png' }));
        },
        'image/png',
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      this.toast.showError('Não foi possível carregar a imagem.');
      this.badgeSaving.set(false);
    };

    img.src = objectUrl;
  }

  private uploadBadge(file: File): void {
    this.newsApi.uploadImage(file).subscribe({
      next: async (res) => {
        if (res.success && res.file?.url) {
          try {
            await this.appSettings.saveSetting('badgeUrl', res.file.url);
            this.appSettings.badgeUrl.set(res.file.url);
            this.toast.showSuccess('Distintivo atualizado!');
          } catch {
            this.toast.showError('Erro ao salvar URL do distintivo.');
          }
        }
        this.badgeSaving.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao enviar imagem.');
        this.badgeSaving.set(false);
      },
    });
  }

  async removeBadge() {
    this.badgeSaving.set(true);
    try {
      await this.appSettings.saveSetting('badgeUrl', '');
      this.appSettings.badgeUrl.set(null);
      this.toast.showSuccess('Distintivo removido.');
    } catch {
    } finally {
      this.badgeSaving.set(false);
    }
  }

  async toggleIdols() {
    this.idolsSaving.set(true);
    try {
      const newVal = !this.isIdolsEnabled();
      await this.appSettings.saveSetting('isIdolsEnabled', String(newVal));
      this.isIdolsEnabled.set(newVal);
      this.toast.showSuccess(`Módulo de Ídolos ${newVal ? 'ativado' : 'desativado'}`);
    } catch {
      this.toast.showError('Erro ao alterar o status do módulo.');
    } finally {
      this.idolsSaving.set(false);
    }
  }

  async onDefaultNewsImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    
    this.defaultNewsSaving.set(true);
    // Compress before upload (max 1280px, JPEG 82%)
    const compressed = await compressImage(file).catch(() => file) as File;
    const fileToUpload = compressed instanceof File ? compressed : new File([compressed], 'news-default.jpg', { type: 'image/jpeg' });
    this.newsApi.uploadImage(fileToUpload).subscribe({
      next: async (res) => {
        if (res.success && res.file?.url) {
          try {
            await this.appSettings.saveSetting('defaultNewsImageUrl', res.file.url);
            this.appSettings.defaultNewsImageUrl.set(res.file.url);
            this.toast.showSuccess('Imagem padrão de notícias atualizada!');
          } catch {
            this.toast.showError('Erro ao salvar URL da imagem padrão.');
          }
        }
        this.defaultNewsSaving.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao enviar imagem.');
        this.defaultNewsSaving.set(false);
      },
    });
  }

  async removeDefaultNewsImage() {
    this.defaultNewsSaving.set(true);
    try {
      await this.appSettings.saveSetting('defaultNewsImageUrl', '');
      this.appSettings.defaultNewsImageUrl.set(null);
      this.toast.showSuccess('Imagem padrão removida.');
    } catch {
      this.toast.showError('Erro ao remover imagem padrão.');
    } finally {
      this.defaultNewsSaving.set(false);
    }
  }

  async toggleMembership() {
    this.membershipSaving.set(true);
    const newValue = !this.isMembershipEnabled();
    try {
      await this.appSettings.saveSetting('isMembershipEnabled', String(newValue));
      this.appSettings.isMembershipEnabled.set(newValue);
      this.toast.showSuccess(newValue ? 'Módulo de Sócios ativado!' : 'Módulo de Sócios desativado!');
    } catch {
      this.toast.showError('Erro ao alterar status do módulo.');
    } finally {
      this.membershipSaving.set(false);
    }
  }

  async toggleSponsors() {
    this.sponsorsSaving.set(true);
    const newValue = !this.isSponsorsEnabled();
    try {
      await this.appSettings.saveSetting('isSponsorsEnabled', String(newValue));
      this.appSettings.isSponsorsEnabled.set(newValue);
      this.toast.showSuccess(newValue ? 'Módulo de Patrocinadores ativado!' : 'Módulo de Patrocinadores desativado!');
    } catch {
      this.toast.showError('Erro ao alterar status do módulo.');
    } finally {
      this.sponsorsSaving.set(false);
    }
  }

  async toggleSquads() {
    this.squadsSaving.set(true);
    const newValue = !this.isSquadsEnabled();
    try {
      await this.appSettings.saveSetting('isSquadsEnabled', String(newValue));
      this.appSettings.isSquadsEnabled.set(newValue);
      this.toast.showSuccess(newValue ? 'Módulo de Elencos ativado!' : 'Módulo de Elencos desativado!');
    } catch {
      this.toast.showError('Erro ao alterar status do módulo.');
    } finally {
      this.squadsSaving.set(false);
    }
  }

  async toggleNewsletterVisibility() {
    this.newsletterSaving.set(true);
    const newValue = !this.isNewsletterEnabled();
    try {
      await this.appSettings.saveSetting('isNewsletterEnabled', String(newValue));
      this.appSettings.isNewsletterEnabled.set(newValue);
      this.toast.showSuccess(newValue ? 'Módulo de Newsletter ativado!' : 'Módulo de Newsletter desativado!');
    } catch {
      this.toast.showError('Erro ao alterar status do módulo.');
    } finally {
      this.newsletterSaving.set(false);
    }
  }

  async toggleMatches() {
    this.matchesSaving.set(true);
    const newValue = !this.isMatchesEnabled();
    try {
      await this.appSettings.saveSetting('isMatchesEnabled', String(newValue));
      this.appSettings.isMatchesEnabled.set(newValue);
      this.toast.showSuccess(newValue ? 'Módulo de Jogos ativado!' : 'Módulo de Jogos desativado!');
    } catch {
      this.toast.showError('Erro ao alterar status do módulo.');
    } finally {
      this.matchesSaving.set(false);
    }
  }

  async onDefaultTeamImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    
    this.defaultTeamSaving.set(true);
    try {
      const compressed = await compressImage(file, 400).catch(() => file) as File;
      this.newsApi.uploadImage(compressed).subscribe({
        next: async (res) => {
          if (res.success && res.file?.url) {
            await this.appSettings.saveSetting('defaultTeamLogoUrl', res.file.url);
            this.appSettings.defaultTeamLogoUrl.set(res.file.url);
            this.toast.showSuccess('Logo padrão de times atualizada!');
          }
          this.defaultTeamSaving.set(false);
        },
        error: () => {
          this.toast.showError('Erro ao enviar imagem.');
          this.defaultTeamSaving.set(false);
        }
      });
    } catch {
      this.defaultTeamSaving.set(false);
    }
  }

  async removeDefaultTeamImage() {
    this.defaultTeamSaving.set(true);
    try {
      await this.appSettings.saveSetting('defaultTeamLogoUrl', '');
      this.appSettings.defaultTeamLogoUrl.set(null);
      this.toast.showSuccess('Logo padrão removida.');
    } finally {
      this.defaultTeamSaving.set(false);
    }
  }

  async onDefaultCompImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    
    this.defaultCompSaving.set(true);
    try {
      const compressed = await compressImage(file, 400).catch(() => file) as File;
      this.newsApi.uploadImage(compressed).subscribe({
        next: async (res) => {
          if (res.success && res.file?.url) {
            await this.appSettings.saveSetting('defaultCompetitionLogoUrl', res.file.url);
            this.appSettings.defaultCompetitionLogoUrl.set(res.file.url);
            this.toast.showSuccess('Logo padrão de campeonatos atualizada!');
          }
          this.defaultCompSaving.set(false);
        },
        error: () => {
          this.toast.showError('Erro ao enviar imagem.');
          this.defaultCompSaving.set(false);
        }
      });
    } catch {
      this.defaultCompSaving.set(false);
    }
  }

  async removeDefaultCompImage() {
    this.defaultCompSaving.set(true);
    try {
      await this.appSettings.saveSetting('defaultCompetitionLogoUrl', '');
      this.appSettings.defaultCompetitionLogoUrl.set(null);
      this.toast.showSuccess('Logo padrão removida.');
    } finally {
      this.defaultCompSaving.set(false);
    }
  }
}
