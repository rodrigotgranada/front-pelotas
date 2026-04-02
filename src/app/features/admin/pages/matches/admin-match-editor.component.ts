import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatchesApiService } from '../../../../core/services/matches-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { Competition, Team, MatchStatus, MatchGoal } from '../../../../core/models/match.model';
import { finalize } from 'rxjs';
import { AdminTeamDrawerComponent } from '../teams/components/admin-team-drawer.component';
import { AdminCompetitionDrawerComponent } from '../competitions/components/admin-competition-drawer.component';
import { AdminConfirmModalComponent } from '../../../../shared/ui/admin-confirm-modal/admin-confirm-modal.component';
import { FallbackImgDirective } from '../../../../shared/directives/fallback-img.directive';
import { AppSettingsService } from '../../../../core/services/app-settings.service';

@Component({
  selector: 'app-admin-match-editor',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterLink, 
    AdminTeamDrawerComponent,
    AdminCompetitionDrawerComponent,
    AdminConfirmModalComponent,
    FallbackImgDirective
  ],
  template: `
    <div class="flex flex-col gap-8 max-w-5xl mx-auto pb-24">
      <!-- Header de Ações -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/jogos" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm group">
            <svg class="group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
          <div>
            <h1 class="text-3xl font-black tracking-tight text-slate-900 leading-none">
              {{ isNew() ? 'Agendar Partida' : 'Editar Jogo' }}
            </h1>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              Painel de Controle / Calendário
            </p>
          </div>
        </div>
        
        <div class="flex gap-3">
           @if (!isNew() && form.value.status !== 'FINISHED') {
             <button
                type="button"
                (click)="showFinishConfirm.set(true)"
                [disabled]="loading()"
                class="rounded-2xl bg-emerald-50 px-6 py-3 text-xs font-black text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
              >
                Finalizar Jogo
              </button>
           }
          <button
            type="button"
            (click)="save()"
            [disabled]="loading() || form.invalid"
            class="rounded-2xl bg-indigo-600 px-8 py-3 text-xs font-black text-white shadow-xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            {{ loading() ? 'Processando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="space-y-8">
        
        <!-- CARD 1: O CONFRONTO (Dropdowns precisam de overflow-visible) -->
        <div class="bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm relative">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <!-- Coluna 1: Campeonato -->
            <div class="space-y-4">
            <div class="flex items-center justify-between h-6">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Competição Oficial</label>
                <div class="flex items-center gap-3">
                  <label class="flex items-center gap-2 cursor-pointer group bg-slate-50 px-3 py-1 rounded-full border border-slate-100 transition-colors hover:bg-indigo-50">
                    <input type="checkbox" formControlName="isFriendly" class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                    <span class="text-[10px] font-black text-slate-500 group-hover:text-indigo-600 uppercase tracking-widest">Amistoso</span>
                  </label>
                </div>
              </div>

              @if (!form.get('isFriendly')?.value) {
                <div class="relative group">
                  <div 
                    (click)="showCompDropdown.set(!showCompDropdown())"
                    class="w-full cursor-pointer rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 flex items-center justify-between font-bold transition-all hover:bg-white hover:border-indigo-100"
                    [class.ring-4.ring-indigo-500/5.border-indigo-500.bg-white]="showCompDropdown()"
                  >
                    <div class="flex flex-col">
                      <span class="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5" *ngIf="selectedCompName()">Selecionado</span>
                      <span [class.text-slate-300]="!selectedCompName()" class="text-lg font-black text-slate-900 tracking-tight">
                        {{ selectedCompName() || 'Selecione o Campeonato' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button 
                        *ngIf="selectedCompName()" 
                        type="button" 
                        (click)="clearComp($event)"
                        class="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  @if (showCompDropdown()) {
                    <div class="absolute z-50 w-full mt-3 bg-white border border-slate-100 rounded-3xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
                      <div class="relative mb-3">
                        <input 
                          type="text" 
                          class="w-full pl-5 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                          placeholder="Pesquisar campeonato..."
                          [(ngModel)]="compSearch"
                          [ngModelOptions]="{standalone: true}"
                          (click)="$event.stopPropagation()"
                        >
                      </div>
                      <div class="max-h-64 overflow-y-auto pr-1">
                        @for (comp of filteredCompetitions(); track comp.id) {
                          <button 
                            type="button"
                            (click)="selectComp(comp)"
                            class="w-full text-left p-4 rounded-2xl hover:bg-indigo-50 transition-all flex flex-col group mb-1"
                          >
                            <span class="text-sm font-black text-slate-700 group-hover:text-indigo-900">{{ comp.name }}</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{{ comp.season }}</span>
                          </button>
                        } @empty {
                          <div class="py-10 text-center flex flex-col items-center gap-3">
                             <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nenhum resultado</p>
                             <button (click)="showCompDrawer.set(true)" class="text-[10px] font-black text-indigo-600 underline uppercase tracking-widest">Cadastrar novo</button>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="w-full px-6 py-5 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center text-center">
                  <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Jogo Fora de Calendário Oficial</p>
                </div>
              }
              <button type="button" (click)="showCompDrawer.set(true)" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest ml-1 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Não achou? Criar Campeonato
              </button>
            </div>

            <!-- Coluna 2: Adversário -->
            <div class="space-y-4">
              <div class="flex items-center justify-between h-6">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Oponente de Campo</label>
              </div>
              
              <div class="relative group">
                <div 
                  (click)="showDropdown.set(!showDropdown())"
                  class="w-full cursor-pointer rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 flex items-center justify-between font-bold transition-all hover:bg-white hover:border-indigo-100"
                  [class.ring-4.ring-indigo-500/5.border-indigo-500.bg-white]="showDropdown()"
                >
                  <div class="flex flex-col">
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5" *ngIf="selectedTeamName()">Adversário Confirmado</span>
                    <span [class.text-slate-300]="!selectedTeamName()" class="text-lg font-black text-slate-900 tracking-tight">
                      {{ selectedTeamName() || 'Buscar Time Adversário' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <button 
                      *ngIf="selectedTeamName()" 
                      type="button" 
                      (click)="clearTeam($event)"
                      class="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>

                @if (showDropdown()) {
                  <div class="absolute z-50 w-full mt-3 bg-white border border-slate-100 rounded-3xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
                    <div class="relative mb-3">
                      <input 
                        type="text" 
                        class="w-full pl-5 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500" 
                        placeholder="Nome do clube..."
                        [(ngModel)]="teamSearch"
                        [ngModelOptions]="{standalone: true}"
                        (click)="$event.stopPropagation()"
                      >
                    </div>
                    <div class="max-h-64 overflow-y-auto pr-1">
                      @for (team of filteredTeams(); track team.id) {
                        <button 
                          type="button"
                          (click)="selectTeam(team)"
                          class="w-full text-left p-3 rounded-2xl hover:bg-indigo-50 transition-all flex items-center gap-4 group mb-1"
                        >
                          <div class="w-10 h-10 bg-white rounded-xl p-1.5 shadow-sm">
                            <img [src]="team.logoUrl || appSettings.defaultTeamLogoUrl()" appFallbackImg="team" class="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all">
                          </div>
                          <div class="flex flex-col">
                            <span class="text-sm font-black text-slate-700 group-hover:text-indigo-900">{{ team.name }}</span>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ team.shortName }}</span>
                          </div>
                        </button>
                      } @empty {
                        <div class="py-10 text-center flex flex-col items-center gap-3">
                           <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Time não cadastrado</p>
                           <button (click)="showTeamDrawer.set(true)" class="text-[10px] font-black text-indigo-600 underline uppercase tracking-widest">Cadastrar novo time</button>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
              <button type="button" (click)="showTeamDrawer.set(true)" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest ml-1 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Não achou? Novo time na biblioteca
              </button>
            </div>
          </div>
        </div>

        <!-- CARD 2: LOGÍSTICA E CAMPO -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Bloco Detalhes Técnicos -->
          <div class="lg:col-span-2 bg-white border border-slate-100 rounded-[32px] p-8 md:p-10 shadow-sm space-y-8">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
              Informações Técnicas
              <div class="h-px bg-slate-50 flex-1"></div>
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Data -->
              <div class="space-y-4">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Dia e Horário</label>
                <div class="relative group">
                   <input type="datetime-local" formControlName="date" class="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-black transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5">
                </div>
              </div>

              <!-- Local -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Estádio / Arena</label>
                  <button type="button" (click)="form.patchValue({stadium: 'Estádio Boca do Lobo'})" class="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100 transition-all uppercase tracking-widest">Usar Boca do Lobo</button>
                </div>
                <input type="text" formControlName="stadium" autocomplete="off" class="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5" placeholder="Ex: Maracanã">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <!-- Status -->
               <div class="space-y-4">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fase da Partida</label>
                  <select formControlName="status" class="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-black transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5">
                    <option value="SCHEDULED">🗓️ Agendado</option>
                    <option value="LIVE">🔴 Em Andamento</option>
                    <option value="FINISHED">🏁 Finalizado</option>
                    <option value="POSTPONED">⏸️ Adiado</option>
                  </select>
               </div>

               <!-- Transmissão -->
               <div class="space-y-4">
                  <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Link da Transmissão</label>
                  <div class="relative group">
                    <input type="text" formControlName="transmissionUrl" class="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5" placeholder="YouTube, Premiere, etc">
                    <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                  </div>
               </div>
            </div>
          </div>

          <!-- Bloco Mando de Campo -->
          <div class="bg-indigo-900 rounded-[32px] p-8 md:p-10 shadow-xl shadow-indigo-900/40 flex flex-col justify-between relative overflow-hidden group">
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div class="relative z-10">
              <h3 class="text-xs font-black text-indigo-300 uppercase tracking-[0.3em] mb-10">Mando de Campo</h3>
              
              <div class="space-y-3">
                <button 
                  type="button" 
                  (click)="form.patchValue({isHome: true})"
                  [class]="form.value.isHome ? 'bg-white text-indigo-900 scale-105 shadow-xl' : 'bg-white/10 text-indigo-200 border border-white/10 hover:bg-white/20'"
                  class="w-full py-5 rounded-2xl flex items-center justify-center gap-4 transition-all duration-300 transform"
                >
                  <span class="text-xs font-black uppercase tracking-widest">PELOTAS EM CASA</span>
                  <div [class]="form.value.isHome ? 'bg-indigo-600' : 'bg-indigo-400/30'" class="w-2 h-2 rounded-full animate-pulse" *ngIf="form.value.isHome"></div>
                </button>

                <button 
                  type="button" 
                  (click)="form.patchValue({isHome: false})"
                  [class]="!form.value.isHome ? 'bg-white text-indigo-900 scale-105 shadow-xl' : 'bg-white/10 text-indigo-200 border border-white/10 hover:bg-white/20'"
                  class="w-full py-5 rounded-2xl flex items-center justify-center gap-4 transition-all duration-300 transform"
                >
                  <span class="text-xs font-black uppercase tracking-widest">VISITANTE (FORA)</span>
                  <div [class]="!form.value.isHome ? 'bg-indigo-600' : 'bg-indigo-400/30'" class="w-2 h-2 rounded-full animate-pulse" *ngIf="!form.value.isHome"></div>
                </button>
              </div>
            </div>

            <p class="relative z-10 text-[10px] font-bold text-indigo-400 uppercase tracking-widest text-center mt-8 px-4 opacity-60">
              O mando define a exibição visual e a ordem do placar no portal.
            </p>
          </div>
        </div>

        <!-- CARD 3: PLACAR E MARCADORES -->
        <div class="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
           <div class="bg-slate-900 p-8 md:p-12 text-center relative">
             <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             
             <div class="relative z-10 flex flex-col items-center">
               <h3 class="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] mb-12">Placar Automático</h3>

               <div class="flex items-center justify-center gap-8 md:gap-20">
                 <!-- Pelotas -->
                 <div class="flex flex-col items-center gap-6 group">
                   <div class="w-20 md:w-32 h-20 md:h-32 bg-white/5 backdrop-blur-md rounded-[32px] p-4 md:p-6 border border-white/10 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105">
                     <img [src]="appSettings.badgeUrl() || '/assets/placeholder-team.png'" appFallbackImg="team" class="w-full h-full object-contain">
                   </div>
                   <span class="text-xs font-black text-white uppercase tracking-[0.2em]">Pelotas</span>
                   <div class="text-6xl md:text-8xl font-black text-white tabular-nums">{{ form.value.pelotasScore }}</div>
                 </div>

                 <div class="text-4xl md:text-6xl font-black text-indigo-500 italic opacity-50">VS</div>

                 <!-- Adversário -->
                 <div class="flex flex-col items-center gap-6 group">
                   <div class="w-20 md:w-32 h-20 md:h-32 bg-white/5 backdrop-blur-md rounded-[32px] p-4 md:p-6 border border-white/10 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105">
                     <img [src]="filteredTeams().length > 0 ? (teams().find(t => t.id === form.value.opponentId)?.logoUrl || appSettings.defaultTeamLogoUrl()) : appSettings.defaultTeamLogoUrl()" appFallbackImg="team" class="w-full h-full object-contain">
                   </div>
                   <span class="text-xs font-black text-white uppercase tracking-[0.2em] truncate max-w-[120px]">{{ selectedTeamName() || 'Oponente' }}</span>
                   <div class="text-6xl md:text-8xl font-black text-white tabular-nums">{{ form.value.opponentScore }}</div>
                 </div>
               </div>
             </div>
           </div>

           <div class="p-8 md:p-12 space-y-8">
              <div class="flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h4 class="text-lg font-black text-slate-900 tracking-tight">Cronologia de Gols</h4>
                  <p class="text-xs font-bold text-slate-400 mt-1">Os tentos registrados abaixo atualizam o placar acima.</p>
                </div>
                <button type="button" (click)="addGoal()" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-900/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Adicionar Gol
                </button>
              </div>

              <div formArrayName="goals" class="space-y-4">
                @for (goal of goalGroups.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-md animate-in fade-in slide-in-from-right-4 duration-500" [style.animation-delay]="i * 100 + 'ms'">
                    <div class="w-20 shrink-0">
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1 text-center">Minuto</label>
                      <input type="number" formControlName="minute" class="w-full rounded-xl border-2 border-slate-100 bg-white text-center text-lg font-black focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all" placeholder="00'">
                    </div>
                    
                    <div class="flex-1">
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Nome do Goleador</label>
                      <input type="text" formControlName="scorer" class="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-black focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all" placeholder="Ex: Tony Jr.">
                    </div>

                    <div class="w-40 shrink-0">
                      <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Equipe</label>
                      <select formControlName="team" class="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2 text-xs font-black uppercase transition-all focus:border-indigo-400">
                        <option value="PELOTAS">🔵 Pelotas</option>
                        <option value="OPPONENT">🛡️ Adversário</option>
                      </select>
                    </div>

                    <div class="pt-6">
                      <button type="button" (click)="removeGoal(i)" class="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100 text-slate-300">
                    <svg class="mb-4 opacity-20" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>
                    <p class="font-bold uppercase tracking-widest text-[10px]">Nenhuma movimentação de placar registrada</p>
                  </div>
                }
              </div>
           </div>
        </div>
      </form>
    </div>

    <!-- Modais e Drawers (Blindagem @if) -->
    @if (showFinishConfirm()) {
      <app-admin-confirm-modal
        title="Finalizar Partida?"
        message="Isso marcará o jogo como encerrado e abrirá o editor para o relato pós-jogo."
        confirmText="Sim, Finalizar"
        type="success"
        (confirmed)="finishMatch()"
        (cancelled)="showFinishConfirm.set(false)"
      />
    }

    @if (showTeamDrawer()) {
      <app-admin-team-drawer
        [isOpen]="true"
        (closed)="onTeamDrawerClosed($event)"
      />
    }

    @if (showCompDrawer()) {
      <app-admin-competition-drawer
        [isOpen]="true"
        (closed)="onCompDrawerClosed($event)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMatchEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly matchesApi = inject(MatchesApiService);
  private readonly toast = inject(ToastMessagesService);
  protected readonly appSettings = inject(AppSettingsService);

  private matchId: string | null = null;

  form = this.fb.group({
    competitionId: [''],
    isFriendly: [false],
    opponentId: ['', Validators.required],
    date: ['', Validators.required],
    stadium: ['', Validators.required],
    isHome: [true, Validators.required],
    pelotasScore: [0, [Validators.required, Validators.min(0)]],
    opponentScore: [0, [Validators.required, Validators.min(0)]],
    status: ['SCHEDULED' as MatchStatus, Validators.required],
    transmissionUrl: [''],
    goals: this.fb.array<MatchGoal>([])
  });

  readonly isNew = signal(true);
  readonly loading = signal(false);
  readonly competitions = signal<Competition[]>([]);
  readonly teams = signal<Team[]>([]);

  // States para a UX aprimorada
  readonly showDropdown = signal(false);
  readonly showCompDropdown = signal(false);
  readonly teamSearch = signal('');
  readonly compSearch = signal('');
  readonly showTeamDrawer = signal(false);
  readonly showCompDrawer = signal(false);
  readonly showFinishConfirm = signal(false);

  // Reatividade para formulário (toSignal)
  private readonly opponentIdSignal = toSignal(this.form.get('opponentId')!.valueChanges);
  private readonly competitionIdSignal = toSignal(this.form.get('competitionId')!.valueChanges);

  // Filtro de times buscável
  readonly filteredTeams = computed(() => {
    const search = this.teamSearch().toLowerCase();
    return this.teams()
      .filter(t => !t.isPelotas)
      .filter(t => t.name.toLowerCase().includes(search) || (t.shortName?.toLowerCase().includes(search)));
  });

  // Filtro e Ordenação de competições
  readonly sortedCompetitions = computed(() => {
    return [...this.competitions()].sort((a, b) => {
        // Ordenar por temporada DESC
        const seasonA = parseInt(a.season) || 0;
        const seasonB = parseInt(b.season) || 0;
        if (seasonB !== seasonA) return seasonB - seasonA;
        return a.name.localeCompare(b.name);
    });
  });

  readonly filteredCompetitions = computed(() => {
    const search = this.compSearch().toLowerCase();
    return this.sortedCompetitions()
      .filter(c => c.name.toLowerCase().includes(search) || c.season.toLowerCase().includes(search));
  });

  readonly selectedTeamName = computed(() => {
    const id = this.opponentIdSignal() || this.form.get('opponentId')?.value;
    return this.teams().find(t => t.id === id)?.name || '';
  });

  readonly selectedCompName = computed(() => {
    const id = this.competitionIdSignal() || this.form.get('competitionId')?.value;
    const comp = this.competitions().find(c => c.id === id);
    return comp ? `${comp.name} (${comp.season})` : '';
  });

  get goalGroups() {
    return this.form.get('goals') as FormArray;
  }

  ngOnInit() {
    this.matchId = this.route.snapshot.paramMap.get('id');
    this.loadPrerequisites();

    if (this.matchId && this.matchId !== 'new') {
      this.isNew.set(false);
      this.loadMatch();
    }

    this.setupScoreAutomation();
    this.setupFriendlyLogic();
  }

  private setupFriendlyLogic() {
    this.form.get('isFriendly')?.valueChanges.subscribe(friendy => {
      const compControl = this.form.get('competitionId');
      if (friendy) {
        compControl?.setValue('');
        compControl?.clearValidators();
      } else {
        compControl?.setValidators([Validators.required]);
      }
      compControl?.updateValueAndValidity();
    });
  }

  private setupScoreAutomation() {
    this.goalGroups.valueChanges.subscribe((goals: MatchGoal[]) => {
      const pelotasScore = (goals || []).filter(g => g.team === 'PELOTAS').length;
      const opponentScore = (goals || []).filter(g => g.team === 'OPPONENT').length;
      
      this.form.patchValue({
        pelotasScore,
        opponentScore
      }, { emitEvent: false });
    });
  }

  private loadPrerequisites() {
    this.matchesApi.listCompetitions().subscribe(data => this.competitions.set(data));
    this.matchesApi.listTeams().subscribe(data => this.teams.set(data));
  }

  private loadMatch() {
    if (!this.matchId) return;
    this.loading.set(true);
    this.matchesApi.getMatch(this.matchId).subscribe({
      next: (match) => {
        let dateStr = '';
        if (match.date) {
            const d = new Date(match.date);
            const offset = d.getTimezoneOffset() * 60000;
            const localDate = new Date(d.getTime() - offset);
            dateStr = localDate.toISOString().slice(0, 16);
        }
        
        const competitionId = typeof match.competitionId === 'string' ? match.competitionId : (match.competitionId as Competition)?.id;

        this.form.patchValue({
          competitionId: competitionId || '',
          isFriendly: !competitionId,
          opponentId: typeof match.opponentId === 'string' ? match.opponentId : (match.opponentId as Team).id,
          date: dateStr,
          stadium: match.stadium,
          isHome: match.isHome,
          pelotasScore: match.isHome ? match.homeScore : match.awayScore,
          opponentScore: match.isHome ? match.awayScore : match.homeScore,
          status: match.status,
          transmissionUrl: match.transmissionUrl || ''
        });

        this.goalGroups.clear();
        (match.goals || []).forEach(g => this.addGoal(g));
        
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao carregar dados do jogo');
        this.router.navigate(['/admin/jogos']);
      }
    });
  }

  selectTeam(team: Team) {
    this.form.patchValue({ opponentId: team.id });
    this.showDropdown.set(false);
    this.teamSearch.set('');
  }

  clearTeam(event: Event) {
    event.stopPropagation();
    this.form.patchValue({ opponentId: '' });
    this.teamSearch.set('');
  }

  selectComp(comp: Competition) {
    this.form.patchValue({ 
        competitionId: comp.id,
        isFriendly: false 
    });
    this.showCompDropdown.set(false);
    this.compSearch.set('');
  }

  clearComp(event: Event) {
    event.stopPropagation();
    this.form.patchValue({ competitionId: '' });
    this.compSearch.set('');
  }

  onTeamDrawerClosed(team: Team | null) {
    this.showTeamDrawer.set(false);
    if (team) {
      this.matchesApi.listTeams().subscribe(data => {
        this.teams.set(data);
        this.form.patchValue({ opponentId: team.id });
        this.showDropdown.set(false);
        this.toast.showSuccess(`Time ${team.name} selecionado!`);
      });
    }
  }

  onCompDrawerClosed(comp: Competition | null) {
    this.showCompDrawer.set(false);
    if (comp) {
      this.matchesApi.listCompetitions().subscribe(data => {
        this.competitions.set(data);
        this.form.patchValue({ 
          competitionId: comp.id,
          isFriendly: false 
        });
        this.toast.showSuccess(`Campeonato ${comp.name} selecionado!`);
      });
    }
  }

  addGoal(goal?: MatchGoal) {
    const group = this.fb.group({
      minute: [goal?.minute || null, [Validators.required, Validators.min(0), Validators.max(130)]],
      scorer: [goal?.scorer || '', Validators.required],
      team: [goal?.team || 'PELOTAS', Validators.required]
    });
    this.goalGroups.push(group);
  }

  removeGoal(index: number) {
    this.goalGroups.removeAt(index);
  }

  save() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.getRawValue();
    
    const payload = {
      competitionId: formValue.isFriendly ? undefined : (formValue.competitionId || undefined),
      opponentId: formValue.opponentId!,
      date: new Date(formValue.date!).toISOString(),
      stadium: formValue.stadium!,
      isHome: formValue.isHome!,
      homeScore: formValue.isHome ? (formValue.pelotasScore || 0) : (formValue.opponentScore || 0),
      awayScore: formValue.isHome ? (formValue.opponentScore || 0) : (formValue.pelotasScore || 0),
      status: formValue.status!,
      goals: formValue.goals as MatchGoal[],
      transmissionUrl: formValue.transmissionUrl || undefined
    };

    const request = this.isNew() 
      ? this.matchesApi.createMatch(payload)
      : this.matchesApi.updateMatch(this.matchId!, payload);

    request.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: () => {
        this.toast.showSuccess(this.isNew() ? 'Jogo agendado com sucesso!' : 'Jogo atualizado!');
        this.router.navigate(['/admin/jogos']);
      },
      error: (err) => this.toast.showApiError(err, 'Erro ao salvar jogo')
    });
  }

  finishMatch() {
    this.showFinishConfirm.set(false);
    this.loading.set(true);
    
    const formValue = this.form.getRawValue();
    const pelotasScore = formValue.pelotasScore || 0;
    const opponentScore = formValue.opponentScore || 0;
    const opponentName = this.teams().find(t => t.id === formValue.opponentId)?.name || 'Adversário';

    this.matchesApi.finishMatch(this.matchId!).subscribe({
        next: () => {
            const title = `PÓS-JOGO: ${pelotasScore} X ${opponentScore} - Pelotas vs ${opponentName}`;
            const queryParams = { 
                title, 
                categories: 'Pós-Jogo, Futebol Profissional',
                tags: 'gauchão, lobo, placar'
            };
            this.toast.showSuccess('Jogo finalizado! Redirecionando para as notícias...');
            this.router.navigate(['/admin/news/editor/new'], { queryParams });
        },
        error: (err) => {
            this.toast.showApiError(err, 'Erro ao finalizar jogo');
            this.loading.set(false);
        }
    });
  }
}
