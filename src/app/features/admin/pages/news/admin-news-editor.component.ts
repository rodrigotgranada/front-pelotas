import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import ImageTool from '@editorjs/image';
// @ts-ignore
import List from '@editorjs/list';

import { NewsApiService } from '../../../../core/services/news-api.service';
import { ToastMessagesService } from '../../../../core/notifications/toast-messages.service';
import { AuthTokenService } from '../../../../core/auth/auth-token.service';
import { environment } from '../../../../../environments/environment';
import { News } from '../../../../core/models/news.model';
import { ImageCropperDialogComponent } from '../../../../shared/ui/image-cropper/image-cropper-dialog.component';

@Component({
  selector: 'app-admin-news-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, QuillModule, ImageCropperDialogComponent],
  template: `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto pb-20">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/admin/news" class="text-slate-500 hover:text-slate-900 border border-slate-200 p-2 rounded-xl bg-white shadow-sm transition hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </a>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900">{{ isNew() ? 'Nova Matéria' : 'Editar Matéria' }}</h1>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 flex items-center gap-2"
            (click)="showSeoPreview.set(true)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            SEO & Redes
          </button>
          
          <button
            type="button"
            class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 flex items-center gap-2"
            (click)="togglePreview()"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            Simulador Mobile
          </button>

          <button
            type="button"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 active:scale-95"
            (click)="save('PUBLISHED')"
            [disabled]="loading()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
            {{ currentStatus() === 'PUBLISHED' ? 'Atualizar' : 'Publicar' }}
          </button>
          
          <button
            type="button"
            [class]="currentStatus() === 'PUBLISHED' ? 'rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 border border-amber-100 shadow-sm transition hover:bg-amber-100 disabled:opacity-50 active:scale-95' : 'rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 active:scale-95'"
            (click)="save('DRAFT')"
            [disabled]="loading()"
          >
            {{ currentStatus() === 'PUBLISHED' ? 'Tirar do ar' : 'Salvar Rascunho' }}
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="flex flex-col gap-6">
        @if (isNew()) {
          <div class="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 flex items-center justify-between">
            <div class="flex items-center gap-4">
               <div class="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
               </div>
               <div>
                  <p class="font-black text-slate-900 leading-tight">Escolha seu fluxo de escrita</p>
                  <p class="text-xs text-slate-500 font-medium">Você pode mudar agora, mas depois de salvar o formato será fixado.</p>
               </div>
            </div>
            <div class="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
               <button type="button" (click)="form.patchValue({format: 'BLOCKS'})" [class.bg-indigo-600]="form.value.format === 'BLOCKS'" [class.text-white]="form.value.format === 'BLOCKS'" [class.text-slate-500]="form.value.format !== 'BLOCKS'" class="px-4 py-2 rounded-lg text-xs font-black transition-all">MODERNO</button>
               <button type="button" (click)="form.patchValue({format: 'HTML'})" [class.bg-indigo-600]="form.value.format === 'HTML'" [class.text-white]="form.value.format === 'HTML'" [class.text-slate-500]="form.value.format !== 'HTML'" class="px-4 py-2 rounded-lg text-xs font-black transition-all">CLÁSSICO</button>
            </div>
          </div>
        }

        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div>
                  <h3 class="text-xs font-black text-slate-900 uppercase tracking-tighter">Destaque</h3>
                </div>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" formControlName="isFeatured" class="peer sr-only">
                <div class="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none ring-offset-2 peer-focus:ring-2 peer-focus:ring-amber-300"></div>
              </label>
            </div>
            
            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-tighter">Comentários</h3>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" formControlName="allowComments" class="peer sr-only">
                <div class="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none ring-offset-2 peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
              </label>
            </div>

            <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <h3 class="text-xs font-black text-slate-900 uppercase tracking-tighter">Curtidas</h3>
              </div>
              <label class="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" formControlName="allowLikes" class="peer sr-only">
                <div class="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-rose-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none ring-offset-2 peer-focus:ring-2 peer-focus:ring-rose-300"></div>
              </label>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1 space-y-5">
              <div>
                <label class="mb-1.5 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Título do Editorial</label>
                <input type="text" formControlName="title" class="w-full rounded-2xl border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-0 text-3xl font-black py-4 px-5 shadow-sm placeholder:text-slate-300 transition-all border-2" placeholder="Digite um título impactante...">
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Chamada / Subtítulo</label>
                <textarea formControlName="subtitle" rows="2" class="w-full rounded-2xl border-slate-200 text-slate-600 focus:border-indigo-500 focus:ring-0 text-base font-medium py-3 px-5 shadow-sm placeholder:text-slate-300 transition-all border-2 resize-none" placeholder="Resumo curto para atrair o leitor..."></textarea>
              </div>
            </div>

            <!-- Capa Upload -->
            <div class="w-full md:w-80 shrink-0">
              <label class="mb-1.5 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Capa da Matéria (16:9)</label>
              @if (form.value.coverImageUrl) {
                <div class="relative w-full rounded-2xl overflow-hidden border-4 border-white shadow-xl group aspect-video">
                  <img [src]="form.value.coverImageUrl" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" (click)="removeCover()" class="bg-white text-rose-600 rounded-xl p-3 shadow-lg hover:scale-110 active:scale-95 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
              } @else {
                <label class="flex flex-col items-center justify-center w-full aspect-video border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all hover:shadow-lg group">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <div class="h-12 w-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 group-hover:text-indigo-600 transition-colors mb-3">
                       <svg class="h-6 w-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    </div>
                    <p class="text-xs font-black text-slate-500 uppercase tracking-tighter">Enviar Capa</p>
                  </div>
                  <input type="file" class="hidden" accept="image/png, image/jpeg, image/webp" (change)="onCoverSelected($event)" />
                </label>
              }
            </div>
          </div>

          <!-- Metadata Panel -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl mt-4">
            <div>
              <label class="mb-1.5 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Assinatura / Autor</label>
              <input type="text" formControlName="authorDisplayName" class="w-full rounded-xl border-slate-200 text-slate-700 font-bold focus:border-indigo-500 focus:ring-0 shadow-sm transition-all" placeholder="Ex: Lucas Medeiros ou Redação Lobão">
              <p class="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Oculta seu nome real do sistema para o público.</p>
            </div>
            
            <div>
              <label class="mb-1.5 block text-xs font-black text-slate-400 uppercase tracking-widest px-1">Categorias</label>
              <div class="relative bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm min-h-[46px] flex flex-wrap gap-1.5 transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400">
                @for (cat of form.value.categories; track cat) {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-indigo-600 text-white shadow-sm shadow-indigo-200 group">
                    {{ cat }}
                    <button type="button" (click)="removeCategory(cat)" class="hover:bg-indigo-700/50 rounded p-0.5 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </span>
                }
                <input 
                  type="text" 
                  [value]="categoryFilter()"
                  (input)="onCategoryInput($event)"
                  (keydown.enter)="$event.preventDefault(); addCategory()"
                  placeholder="Pesquisar..."
                  class="flex-1 min-w-[120px] text-sm outline-none border-none p-1 bg-transparent placeholder-slate-300 text-slate-700 font-bold"
                />

                @if (categoryFilter() && filteredCategories().length > 0) {
                  <div class="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-56 p-1 border-t-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    @for (cat of filteredCategories(); track cat) {
                      <button type="button" (click)="addCategory(cat)" class="w-full text-left px-4 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition flex items-center justify-between group rounded-xl">
                        {{ cat }}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="opacity-0 group-hover:opacity-100"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm min-h-[500px] mt-2">
          @if (form.value.format === 'HTML') {
            <quill-editor formControlName="contentHtml" [styles]="{height: '500px', 'border-radius': '1rem'}" class="block overflow-hidden"></quill-editor>
          } @else {
            <div id="editorjs" class="prose max-w-none pt-4"></div>
          }
        </div>
      </form>
    </div>

    <!-- SEO & Redes Preview Modal -->
    @if (showSeoPreview()) {
      <div class="fixed inset-0 z-[60] overflow-hidden" aria-labelledby="seo-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="showSeoPreview.set(false)"></div>
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div class="pointer-events-auto w-screen max-w-2xl transform transition-transform shadow-2xl">
              <div class="flex h-full flex-col overflow-y-auto bg-slate-50 shadow-xl">
                <div class="px-6 py-6 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between">
                  <div>
                    <h2 class="text-xl font-black text-slate-900" id="seo-title">Prévia de SEO e Redes Sociais</h2>
                    <p class="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest text-indigo-600">Otimização para busca e compartilhamento</p>
                  </div>
                  <button type="button" class="rounded-full p-2 bg-slate-100 text-slate-500 hover:text-rose-600 transition" (click)="showSeoPreview.set(false)">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                
                <div class="p-8 space-y-12">
                  <!-- Google Preview -->
                  <div class="space-y-4">
                    <div class="flex items-center gap-2 mb-1">
                      <div class="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      </div>
                      <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Google Search</h3>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-2">
                       <p class="text-xs text-slate-600 mb-0.5">ecpelotas.com.br > notícias > {{ form.value.title | lowercase }}</p>
                       <p class="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer">{{ form.value.title || 'Título da sua matéria...' }}</p>
                       <p class="text-sm text-[#4d5156] leading-relaxed line-clamp-2">
                         {{ (form.value.subtitle || 'Em um passo importante para o futuro do Lobo, o Esporte Clube Pelotas apresenta novidades que prometem empolgar a torcida no Estádio Boca do Lobo.') }}
                       </p>
                    </div>
                  </div>

                  <!-- Facebook/WhatsApp Preview -->
                  <div class="space-y-4">
                    <div class="flex items-center gap-2 mb-1">
                      <div class="h-6 w-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-blue-600"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                      </div>
                      <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Facebook / WhatsApp</h3>
                    </div>
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-md mx-auto">
                        <div class="aspect-video bg-slate-100 flex items-center justify-center">
                          @if (form.value.coverImageUrl) {
                            <img [src]="form.value.coverImageUrl" class="w-full h-full object-cover">
                          } @else {
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-slate-300"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          }
                        </div>
                        <div class="p-4 bg-[#f2f3f5] border-t border-slate-200">
                          <p class="text-[10px] text-slate-500 uppercase font-medium">ECPELOTAS.COM.BR</p>
                          <p class="text-base font-bold text-[#1c1e21] mt-1">{{ form.value.title || 'Título da notícia' }}</p>
                          <p class="text-sm text-[#65676b] mt-1 line-clamp-1">{{ form.value.subtitle || 'Breve introdução da matéria para atrair cliques.' }}</p>
                        </div>
                    </div>
                  </div>

                  <!-- Twitter/X Preview -->
                  <div class="space-y-4 pb-12">
                     <div class="flex items-center gap-2 mb-1">
                      <div class="h-6 w-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="text-white"><path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768m2.464-2.464l6.768-6.768"/></svg>
                      </div>
                      <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Twitter / X (Summary Card)</h3>
                    </div>
                    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-md mx-auto flex items-stretch h-32">
                        <div class="w-32 bg-slate-100 flex-shrink-0 border-r border-slate-200">
                           @if (form.value.coverImageUrl) {
                             <img [src]="form.value.coverImageUrl" class="w-full h-full object-cover">
                           } @else {
                             <div class="w-full h-full flex items-center justify-center text-slate-200"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg></div>
                           }
                        </div>
                        <div class="p-3 flex flex-col justify-center">
                           <p class="text-xs text-slate-500">ecpelotas.com.br</p>
                           <p class="text-sm font-bold text-slate-900 mt-0.5 line-clamp-2">{{ form.value.title || 'Título da matéria no Twitter' }}</p>
                           <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{{ form.value.subtitle }}</p>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Drawer de Preview (Mobile) -->
    @if (showPreview()) {
      <div class="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" (click)="togglePreview()"></div>

          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <div class="pointer-events-auto w-screen max-w-2xl transform transition-transform shadow-2xl">
              <div class="flex h-full flex-col overflow-y-auto bg-slate-50 py-6 shadow-xl">
                <div class="px-6 pb-6 flex items-start justify-between">
                    <div>
                      <h2 class="text-xl font-black text-slate-900" id="slide-over-title">Simulador Mobile</h2>
                      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Como o torcedor verá no celular</p>
                    </div>
                    <button type="button" class="relative rounded-full p-2 bg-slate-100 text-slate-500 hover:text-rose-500 transition-colors" (click)="togglePreview()">
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div class="relative flex-1 px-4 flex justify-center py-8">
                  <div class="bg-white w-[375px] min-h-[667px] shadow-2xl rounded-[40px] border-[12px] border-slate-900 overflow-hidden flex flex-col items-stretch relative">
                    <div class="h-7 w-full bg-slate-900 flex justify-center items-start">
                       <div class="h-1.5 w-16 bg-slate-800 rounded-full mt-2"></div>
                    </div>
                    <div class="p-6 flex-1 overflow-y-auto scrollbar-hide">
                        @if (form.value.coverImageUrl) {
                           <img [src]="form.value.coverImageUrl" class="w-full aspect-video rounded-2xl object-cover mb-6 shadow-lg">
                        }
                        <h1 class="text-2xl font-black text-slate-900 leading-tight">{{ form.value.title || 'Título da Matéria' }}</h1>
                        @if (form.value.subtitle) {
                          <p class="mt-3 text-sm text-slate-500 font-bold leading-relaxed">{{ form.value.subtitle }}</p>
                        }
                        
                        <div class="flex items-center gap-3 my-6">
                           <div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">R</div>
                           <div class="flex flex-col">
                              <span class="text-xs font-black text-slate-900 uppercase">Redação Pelotas</span>
                              <span class="text-[10px] font-bold text-slate-400 uppercase">Há 5 min • 3 min leitura</span>
                           </div>
                        </div>

                        <div class="prose prose-sm max-w-none break-words text-slate-700 leading-relaxed font-medium">
                          @if (previewLoading()) {
                            <div class="flex flex-col gap-4 py-8">
                               <div class="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                               <div class="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                               <div class="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                            </div>
                          } @else {
                            <div [innerHTML]="previewBlocksHtml()" class="block-preview"></div>
                          }
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Image Cropper Dialog -->
    @if (imageSelectedEvent()) {
      <app-image-cropper-dialog
        [imageChangedEvent]="imageSelectedEvent()!"
        [aspectRatio]="1.777"
        [maintainAspectRatio]="true"
        [resizeToWidth]="1280"
        [roundCropper]="false"
        (imageCroppedEvent)="onImageCropped($event)"
        (cancel)="onCropCancel()"
      ></app-image-cropper-dialog>
    }
  `,
  styles: [`
    :host { display: block; }
    .ce-block__content { max-width: 100%; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .block-preview ::ng-deep h2 { font-size: 1.25rem !important; font-weight: 800 !important; color: #0f172a !important; margin-top: 1.5rem !important; margin-bottom: 0.75rem !important; }
    .block-preview ::ng-deep p { margin-bottom: 1rem !important; }
    .block-preview ::ng-deep figure { margin: 1.5rem 0 !important; }
  `]
})
export class AdminNewsEditorComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly newsApi = inject(NewsApiService);
  private readonly toast = inject(ToastMessagesService);
  private readonly tokenService = inject(AuthTokenService);

  readonly isNew = signal(true);
  readonly loading = signal(false);
  readonly showPreview = signal(false);
  readonly showSeoPreview = signal(false);
  readonly previewLoading = signal(false);
  readonly previewBlocksHtml = signal('');
  readonly currentStatus = signal<string>('DRAFT');
  readonly imageSelectedEvent = signal<Event | null>(null);

  readonly availableCategories = signal<string[]>([]);
  readonly categoryFilter = signal<string>('');
  
  private normalizeStr(str: string): string {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  readonly filteredCategories = computed(() => {
    const query = this.normalizeStr(this.categoryFilter());
    if (!query) return [];
    const all = this.availableCategories();
    return all.filter(c => 
      this.normalizeStr(c).includes(query) && 
      !this.form.value.categories?.includes(c)
    );
  });
  
  private newsId: string | null = null;
  private editorJs: EditorJS | null = null;

  form = this.fb.group({
    title: ['', Validators.required],
    subtitle: [''],
    format: ['BLOCKS', Validators.required],
    contentHtml: [''],
    coverImageUrl: [null as string | null],
    isFeatured: [false],
    allowComments: [true],
    allowLikes: [true],
    authorDisplayName: [''],
    categories: [[] as string[]]
  });

  ngOnInit() {
    this.newsApi.getCategories().subscribe(res => {
      const baseCaps = ['Futebol Profissional', 'Futebol Feminino', 'Futebol de Base', 'Matérias Especiais', 'Notas Oficiais', 'Ações Sociais', 'Loba'];
      const merged = Array.from(new Set([...baseCaps, ...res])).sort();
      this.availableCategories.set(merged);
    });

    this.newsId = this.route.snapshot.paramMap.get('id');
    
    if (this.newsId && this.newsId !== 'new') {
      this.isNew.set(false);
      this.form.get('format')?.disable(); // Lock the format
      this.loadNews();
    } else {
      setTimeout(() => this.initEditorJs(), 100);
      
      this.form.get('format')?.valueChanges.subscribe(format => {
        if (format === 'BLOCKS') {
          setTimeout(() => this.initEditorJs(), 100);
        } else {
          this.destroyEditorJs();
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroyEditorJs();
  }

  private initEditorJs(initialData?: any) {
    if (this.editorJs) return;
    
    const token = this.tokenService.getToken() || '';

    this.editorJs = new EditorJS({
      holder: 'editorjs',
      placeholder: 'Clique aqui e comece a escrever... (Use / para adicionar imagens ou listas)',
      data: initialData || {},
      tools: {
        header: Header,
        list: List,
        image: {
          class: ImageTool,
          config: {
            endpoints: {
              byFile: `${environment.apiBaseUrl}/news/upload-image`,
            },
            additionalRequestHeaders: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      }
    });
  }

  private destroyEditorJs() {
    if (this.editorJs) {
      if (typeof this.editorJs.destroy === 'function') {
        try { this.editorJs.destroy(); } catch (e) {}
      }
      this.editorJs = null;
    }
  }

  private loadNews() {
    if (!this.newsId) return;
    this.loading.set(true);
    
    this.newsApi.findOne(this.newsId).subscribe({
      next: (news: News) => {
        this.form.patchValue({
          title: news.title,
          subtitle: news.subtitle,
          format: news.format,
          coverImageUrl: news.coverImageUrl || null,
          isFeatured: news.isFeatured,
          allowComments: news.allowComments !== false,
          allowLikes: news.allowLikes !== false,
          authorDisplayName: news.authorDisplayName || '',
          categories: news.categories || []
        });
        
        this.currentStatus.set(news.status || 'DRAFT');

        if (news.format === 'HTML') {
          this.form.patchValue({ contentHtml: news.content });
        } else {
          setTimeout(() => this.initEditorJs(news.content), 100);
        }
        
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao carregar matéria');
        this.loading.set(false);
        this.router.navigate(['/admin/news']);
      }
    });
  }

  async save(status: 'DRAFT' | 'PUBLISHED') {
    const rawTitle = this.form.value.title?.trim() || '';

    if (status === 'PUBLISHED' && !rawTitle) {
      this.toast.showWarning('O título é obrigatório para publicar a matéria.');
      return;
    }

    this.loading.set(true);
    const format = this.form.getRawValue().format; // Raw to get disabled format
    let content: any = null;

    if (format === 'HTML') {
      content = this.form.value.contentHtml;
      if (status === 'PUBLISHED' && (!content || String(content).trim() === '')) {
        this.toast.showWarning('O conteúdo da matéria não pode estar vazio para publicar.');
        this.loading.set(false);
        return;
      }
    } else {
      if (!this.editorJs) {
        this.loading.set(false);
        return;
      }
      const outputData: any = await this.editorJs.save();
      if (status === 'PUBLISHED' && (!outputData.blocks || outputData.blocks.length === 0)) {
        this.toast.showWarning('O conteúdo da matéria não pode estar vazio para publicar.');
        this.loading.set(false);
        return;
      }
      content = outputData || { blocks: [] };
    }

    const payload = {
      title: rawTitle || 'Rascunho sem título',
      subtitle: this.form.value.subtitle || undefined,
      format: format as 'HTML' | 'BLOCKS',
      content,
      coverImageUrl: this.form.value.coverImageUrl || undefined,
      isFeatured: this.form.value.isFeatured || false,
      allowComments: this.form.value.allowComments !== false,
      allowLikes: this.form.value.allowLikes !== false,
      authorDisplayName: this.form.value.authorDisplayName || undefined,
      categories: this.form.value.categories || [],
      status
    };

    const request = this.isNew() 
      ? this.newsApi.create(payload as any)
      : this.newsApi.update(this.newsId!, payload as any);

    request.subscribe({
      next: () => {
        this.toast.showSuccess(status === 'PUBLISHED' ? 'Matéria publicada!' : 'Rascunho salvo!');
        this.router.navigate(['/admin/news']);
      },
      error: (err) => {
        this.toast.showApiError(err, 'Erro ao salvar a matéria.');
        this.loading.set(false);
      }
    });
  }

  async togglePreview() {
    if (this.showPreview()) {
      this.showPreview.set(false);
      return;
    }
    
    this.previewLoading.set(true);
    this.showPreview.set(true);

    if (this.form.value.format === 'HTML') {
      this.previewBlocksHtml.set(this.form.value.contentHtml || '<p class="text-slate-400">Conteúdo vazio</p>');
      this.previewLoading.set(false);
    } else {
      if (!this.editorJs) {
        this.previewLoading.set(false);
        return;
      }
      try {
        const outputData: any = await this.editorJs.save();
        let html = '';
        if (outputData.blocks) {
          for (const block of outputData.blocks) {
            switch (block.type) {
              case 'header':
                html += `<h${block.data.level} class="font-bold text-slate-900 mt-5 mb-2">${block.data.text}</h${block.data.level}>`;
                break;
              case 'paragraph':
                html += `<p class="mb-4">${block.data.text}</p>`;
                break;
              case 'image':
                html += `<figure class="my-5"><img src="${block.data.file.url}" class="rounded-xl w-full object-cover border border-slate-100"><figcaption class="text-xs text-center text-slate-500 mt-2">${block.data.caption || ''}</figcaption></figure>`;
                break;
              case 'list':
                const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
                const classlist = block.data.style === 'ordered' ? 'list-decimal pl-5' : 'list-disc pl-5';
                html += `<${tag} class="${classlist} mb-4 text-slate-800">`;
                block.data.items.forEach((li: string) => { html += `<li class="mb-1">${li}</li>`; });
                html += `</${tag}>`;
                break;
            }
          }
        }
        this.previewBlocksHtml.set(html || '<p class="text-slate-400">Conteúdo vazio</p>');
      } catch (e) {
        this.previewBlocksHtml.set('<p class="text-red-500">Erro ao gerar prévia.</p>');
      }
      this.previewLoading.set(false);
    }
  }

  onCoverSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageSelectedEvent.set(event);
  }

  onImageCropped(blob: Blob) {
    this.imageSelectedEvent.set(null);
    this.loading.set(true);
    
    const ext = blob.type === 'image/jpeg' ? 'jpg' : (blob.type.split('/')[1] || 'png');
    const file = new File([blob], `cover.${ext}`, { type: blob.type || 'image/png' });

    this.newsApi.uploadImage(file).subscribe({
      next: (res) => {
        if (res.success && res.file?.url) {
          this.form.patchValue({ coverImageUrl: res.file.url });
        }
        this.loading.set(false);
      },
      error: () => {
        this.toast.showError('Erro ao enviar imagem de capa. Pode ser muito grande.');
        this.loading.set(false);
      }
    });
  }

  onCropCancel() {
    this.imageSelectedEvent.set(null);
  }

  removeCover() {
    this.form.patchValue({ coverImageUrl: null });
  }

  onCategoryInput(event: Event) {
    const el = event.target as HTMLInputElement;
    this.categoryFilter.set(el.value);
  }

  addCategory(forceCategory?: string) {
    let cat = (forceCategory || this.categoryFilter()).trim();
    if (!cat) return;

    const normalizedCat = this.normalizeStr(cat);

    // Auto-fix to existing database format if matches without accents or cases
    const existingOfficial = this.availableCategories().find(
      c => this.normalizeStr(c) === normalizedCat
    );

    if (existingOfficial) {
      cat = existingOfficial;
    } else {
      // Capitalize first letter for beautifully formatted new tags
      cat = cat.charAt(0).toUpperCase() + cat.slice(1);
    }

    const current = this.form.value.categories || [];
    const isAlreadyAdded = current.some((c: string) => this.normalizeStr(c) === this.normalizeStr(cat));
    
    if (!isAlreadyAdded) {
      this.form.patchValue({ categories: [...current, cat] });
    }
    this.categoryFilter.set('');
  }

  removeCategory(catToRemove: string) {
    const current = this.form.value.categories || [];
    this.form.patchValue({ categories: current.filter((c: string) => c !== catToRemove) });
  }
}
