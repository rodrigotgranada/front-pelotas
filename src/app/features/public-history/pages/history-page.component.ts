import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HistoryApiService, History } from '../../../shared/master-bypass-v2';
import { SpinnerComponent } from '../../../shared/ui/spinner/spinner.component';
import { AppSettingsService } from '../../../core/services/app-settings.service';


@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, SpinnerComponent, RouterLink],
  template: `
    <div class="bg-white">
      <!-- Header / Banner -->
      <section class="relative h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div class="absolute inset-0 opacity-40">
           <img src="assets/stadium-history-bg.jpg" class="w-full h-full object-cover grayscale" onerror="this.src='https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop'" />
        </div>
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900"></div>
        
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span class="inline-block px-4 py-1.5 rounded-full bg-cyan-600/20 text-cyan-400 text-xs font-black uppercase tracking-[0.3em] mb-4 backdrop-blur-md border border-cyan-400/30 animate-in fade-in slide-in-from-bottom-4 duration-700">Tradição Centenária</span>
          <h1 class="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000">História do <span class="text-cyan-400 italic font-black">Lobo</span></h1>
          <p class="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Desde 1908, forjando glórias e paixão no coração da Princesa do Sul. Conheça a trajetória épica do Esporte Clube Pelotas.
          </p>
        </div>
      </section>

      <!-- Main Content / Timeline -->
      <main class="max-w-5xl mx-auto px-4 py-20 relative">
        <!-- Vertical Line -->
        <div class="absolute left-1/2 top-40 bottom-20 w-px bg-slate-200 -translate-x-1/2 hidden md:block"></div>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-20">
            <app-spinner size="lg"></app-spinner>
            <p class="mt-4 text-slate-500 font-medium">Resgatando memórias...</p>
          </div>
        } @else if (sections().length === 0) {
          <div class="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
             <p class="text-slate-400 font-bold uppercase tracking-widest">A história está sendo escrita...</p>
          </div>
        } @else {
          <div class="space-y-32">
            @for (section of sections(); track section.id; let i = $index) {
              <div 
                class="relative flex flex-col md:flex-row items-center gap-12 group"
                [class.md:flex-row-reverse]="i % 2 !== 0"
              >
                <!-- Timeline Dot -->
                <div class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-cyan-500 z-10 hidden md:block group-hover:scale-150 transition-transform duration-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>

                <!-- Image Side -->
                <div class="w-full md:w-1/2 animate-in fade-in slide-in-from-{{ i % 2 === 0 ? 'left' : 'right' }}-12 duration-1000">
                  <div class="relative rounded-[32px] overflow-hidden shadow-2xl aspect-[4/3] group-hover:shadow-cyan-200/50 transition-shadow duration-700">
                    <img [src]="section.coverImageUrl || 'assets/placeholder-history.jpg'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale hover:grayscale-0" onerror="this.src='https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1000&auto=format&fit=crop'" />
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                  </div>
                </div>

                <!-- Text Side -->
                <div class="w-full md:w-1/2 space-y-4 animate-in fade-in slide-in-from-{{ i % 2 === 0 ? 'right' : 'left' }}-12 duration-1000">
                  <div class="flex items-center gap-4 mb-2">
                    <div class="h-px flex-1 bg-slate-200 md:hidden"></div>
                    <span class="text-cyan-600 font-black text-xl italic tracking-tighter">Etapa {{ i + 1 }}</span>
                    <div class="h-px flex-1 bg-slate-200"></div>
                  </div>
                  
                  <h2 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tighter transition-colors group-hover:text-cyan-700">
                    {{ section.title }}
                  </h2>
                  
                  <div class="prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                    @if (section.format === 'BLOCKS') {
                      <div [innerHTML]="parseBlocks(section.content)"></div>
                    } @else {
                      <div [innerHTML]="section.content"></div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>

      <!-- CTA Footer -->
      <section class="bg-slate-950 py-32 px-4 text-center overflow-hidden relative">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        <div class="relative z-10">
          <h2 class="text-4xl font-black text-white mb-8 tracking-tighter">O Lobo Nunca Deixa de Lutar.</h2>
          <p class="text-slate-400 font-medium max-w-xl mx-auto mb-12">
            A história continua sendo escrita por cada torcedor@if (isMembershipEnabled()) {, cada sócio} e cada atleta que veste o manto áureo-cerúleo.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
             @if (isMembershipEnabled()) {
               <a routerLink="/seja-socio" class="px-8 py-4 bg-cyan-600 text-white font-black rounded-full hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20 active:scale-95">Seja Sócio do Lobo</a>
             }
          </div>
        </div>
      </section>
      

    </div>
  `,
  styles: [`
    :host { display: block; }
    .prose ::ng-deep h2 { font-weight: 900; color: #0f172a; margin-top: 2rem; }
    .prose ::ng-deep p { margin-bottom: 1.5rem; line-height: 1.8; }
  `]
})
export class HistoryPageComponent implements OnInit {
  private readonly historyApi = inject(HistoryApiService);
  private readonly appSettings = inject(AppSettingsService);
  readonly sections = signal<History[]>([]);
  readonly loading = signal<boolean>(true);
  readonly isMembershipEnabled = this.appSettings.isMembershipEnabled;

  ngOnInit() {
    this.historyApi.listPublic().subscribe({
      next: (data: History[]) => {
        this.sections.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  parseBlocks(content: any): string {
    if (!content || !content.blocks) return '';
    return content.blocks.map((block: any) => {
      switch (block.type) {
        case 'header':
          return `<h${block.data.level} class="text-2xl font-black text-slate-900 mt-6 mb-3">${block.data.text}</h${block.data.level}>`;
        case 'paragraph':
          return `<p class="mb-4 text-slate-600 leading-relaxed font-medium">${block.data.text}</p>`;
        case 'list':
          const items = block.data.items.map((item: string) => `<li class="ml-4 list-disc">${item}</li>`).join('');
          return `<ul class="mb-4 space-y-2">${items}</ul>`;
        case 'image':
          return `
            <figure class="my-8">
              <img src="${block.data.file.url}" class="rounded-3xl shadow-lg w-full object-cover aspect-video" alt="${block.data.caption || ''}">
              ${block.data.caption ? `<figcaption class="text-center text-xs text-slate-400 mt-3 font-bold uppercase tracking-widest">${block.data.caption}</figcaption>` : ''}
            </figure>
          `;
        default:
          return '';
      }
    }).join('');
  }
}
